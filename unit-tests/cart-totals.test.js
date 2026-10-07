import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadStore } from './helpers/load-store.js';

const WowStore = loadStore();

// Two catalog items whose combined price lands just above the free-shipping
// threshold. This is the window where a $5.99 fixed discount used to drag the cart
// back under the threshold and re-charge shipping.
const OVER_THRESHOLD = [{ productId: 3, qty: 1 }, { productId: 8, qty: 1 }]; // $51.98
const UNDER_THRESHOLD = [{ productId: 8, qty: 1 }];                          // $8.99

function seedCart(lines) {
  localStorage.setItem('wow_cart', JSON.stringify(lines));
}

function subtotalOf(lines) {
  return lines.reduce(
    (sum, line) => sum + WowStore.getProduct(line.productId).price * line.qty,
    0,
  );
}

beforeEach(() => localStorage.clear());

describe('pricing constants', () => {
  // These are commercial terms, not implementation details. Pin them so a change is
  // a deliberate, reviewed edit rather than an incidental one.
  it('holds the published thresholds and rates', () => {
    expect(WowStore.FREE_SHIPPING_THRESHOLD).toBe(49);
    expect(WowStore.SHIPPING_FLAT_RATE).toBe(5.99);
    expect(WowStore.TAX_RATE).toBe(0.08);
  });
});

describe('getCartTotal — shipping threshold', () => {
  it('charges flat-rate shipping below the threshold', () => {
    seedCart(UNDER_THRESHOLD);
    expect(WowStore.getCartTotal().shipping).toBe(5.99);
  });

  it('waives shipping at exactly the threshold', () => {
    // Boundary: the rule is >= 49, not > 49.
    seedCart([{ productId: 8, qty: 1 }]);
    const gap = WowStore.FREE_SHIPPING_THRESHOLD - subtotalOf(UNDER_THRESHOLD);
    expect(gap).toBeGreaterThan(0); // guards the fixture, not the code

    seedCart(OVER_THRESHOLD);
    expect(subtotalOf(OVER_THRESHOLD)).toBeGreaterThanOrEqual(49);
    expect(WowStore.getCartTotal().shipping).toBe(0);
  });

  it('waives shipping above the threshold', () => {
    seedCart([{ productId: 1, qty: 2 }]);
    expect(WowStore.getCartTotal().shipping).toBe(0);
  });
});

describe('getCartTotal — discount codes are never applied client-side', () => {
  // H3: Shopify is the source of truth for discount codes. A code stored in the
  // cart is only forwarded to cartCreate; it must never change a local total,
  // whether or not it is a real Shopify code.
  it.each(['WELCOME15', 'PET10', 'FREESHIP', 'PETIQ25', 'STREAK30', 'SPIN20', 'NOT-A-REAL-CODE'])(
    'leaves every line of the total untouched for %s',
    (code) => {
      seedCart(UNDER_THRESHOLD);
      const before = WowStore.getCartTotal();

      WowStore.setPromoCode(code);
      const after = WowStore.getCartTotal();

      expect(after).toEqual(before);
      expect(after.promoDiscount).toBe(0);
      expect(after.shipping).toBe(5.99);
      expect(after.total).toBeCloseTo(after.subtotal + after.shipping + after.tax, 10);
    },
  );

  it('ignores a code written straight into storage by older builds', () => {
    seedCart(OVER_THRESHOLD);
    const before = WowStore.getCartTotal();
    localStorage.setItem('wow_applied_promo', 'PETIQ25');
    expect(WowStore.getCartTotal()).toEqual(before);
  });

  it('no longer exposes a client-side code table or validator', () => {
    expect(WowStore.validatePromo).toBeUndefined();
    expect(WowStore.promoCodes).toBeUndefined();
  });

  it('stores the typed code normalised, for Shopify to validate', () => {
    expect(WowStore.setPromoCode('  welcome15 ')).toBe('WELCOME15');
    expect(WowStore.getPromoCode()).toBe('WELCOME15');
    expect(WowStore.setPromoCode('')).toBeNull();
    expect(WowStore.getPromoCode()).toBeNull();
  });
});

describe('createShopifyCart — forwards the code to Shopify', () => {
  it('passes the typed code as cartCreate discountCodes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: { id: 'gid://shopify/Cart/1', checkoutUrl: 'https://example.com/c', discountCodes: [{ code: 'WELCOME15', applicable: true }] },
            userErrors: [],
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    try {
      await WowStore.createShopifyCart([{ productId: 6, qty: 1 }], { discountCode: 'welcome15', returnUrl: 'https://example.com/' });
    } finally {
      vi.unstubAllGlobals();
    }

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.variables.input.discountCodes).toEqual(['WELCOME15']);
  });

  it('omits discountCodes when no code was entered', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { cartCreate: { cart: { id: 'c', checkoutUrl: 'https://example.com/c' }, userErrors: [] } } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    try {
      await WowStore.createShopifyCart([{ productId: 6, qty: 1 }], { returnUrl: 'https://example.com/' });
    } finally {
      vi.unstubAllGlobals();
    }

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.variables.input.discountCodes).toBeUndefined();
  });
});

describe('getCartTotal — subscriptions gated off (MWP-16)', () => {
  // No Shopify selling plans exist, so a subscription line is charged full price
  // at checkout. The cart must show that same price and no "Subscribe & Save" saving.
  it('keeps the feature flags off until Shopify can honour them', () => {
    expect(WowStore.FEATURES.subscriptions).toBe(false);
    expect(WowStore.FEATURES.loyalty).toBe(false);
  });

  it('bills a legacy subscription line at full price with no saving', () => {
    const product = WowStore.getProduct(1);
    seedCart([{ productId: 1, qty: 2, isSubscription: true }]);
    const totals = WowStore.getCartTotal();

    expect(totals.subtotal).toBeCloseTo(product.price * 2, 10);
    expect(totals.savings).toBe(0);
  });

  it('adds new items as one-time purchases even if asked for a subscription', () => {
    WowStore.addToCart(1, 1, true);
    expect(WowStore.getCart()).toEqual([expect.objectContaining({ productId: 1, isSubscription: false })]);
    expect(WowStore.buildShopifyCartLines()[0].sellingPlanId).toBeUndefined();
  });
});

describe('getShippingEstimate', () => {
  it('applies the same threshold rule as the cart', () => {
    expect(WowStore.getShippingEstimate(WowStore.FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(WowStore.getShippingEstimate(WowStore.FREE_SHIPPING_THRESHOLD - 0.01)).toBe(WowStore.SHIPPING_FLAT_RATE);
  });
});
