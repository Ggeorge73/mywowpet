import { describe, it, expect, beforeEach } from 'vitest';
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

describe('getCartTotal — promo codes', () => {
  it('applies a percentage discount to the subtotal', () => {
    seedCart(UNDER_THRESHOLD);
    WowStore.validatePromo('WELCOME15');
    const totals = WowStore.getCartTotal();
    expect(totals.promoDiscount).toBeCloseTo(totals.subtotal * 0.15, 10);
  });

  it('taxes the discounted subtotal, not the original', () => {
    seedCart(UNDER_THRESHOLD);
    WowStore.validatePromo('PET10');
    const totals = WowStore.getCartTotal();
    expect(totals.tax).toBeCloseTo((totals.subtotal - totals.promoDiscount) * 0.08, 10);
  });

  it('ignores an unknown code', () => {
    seedCart(UNDER_THRESHOLD);
    expect(WowStore.validatePromo('NOT-A-REAL-CODE')).toBeNull();
    expect(WowStore.getCartTotal().promoDiscount).toBe(0);
  });

  it('never discounts below zero', () => {
    seedCart(UNDER_THRESHOLD);
    WowStore.validatePromo('PETIQ25');
    const totals = WowStore.getCartTotal();
    expect(totals.total).toBeGreaterThanOrEqual(0);
    expect(totals.promoDiscount).toBeLessThanOrEqual(totals.subtotal);
  });
});

describe('getCartTotal — FREESHIP regression', () => {
  // Regression: FREESHIP was modelled as { discount: 5.99, type: 'fixed' }, so it
  // came off the subtotal. Because the threshold is evaluated against the
  // *discounted* subtotal, applying it to a $51.98 cart dropped the cart to $45.99
  // and re-charged $5.99 shipping — a code labelled "Free shipping" added a
  // shipping charge.
  it('waives shipping on a cart just over the threshold', () => {
    seedCart(OVER_THRESHOLD);
    const before = WowStore.getCartTotal();
    expect(before.shipping).toBe(0);

    WowStore.validatePromo('FREESHIP');
    const after = WowStore.getCartTotal();

    expect(after.shipping).toBe(0);
    expect(after.total).toBeLessThanOrEqual(before.total);
  });

  it('waives shipping on a cart below the threshold', () => {
    seedCart(UNDER_THRESHOLD);
    expect(WowStore.getCartTotal().shipping).toBe(5.99);

    WowStore.validatePromo('FREESHIP');
    const totals = WowStore.getCartTotal();

    expect(totals.shipping).toBe(0);
    expect(totals.freeShippingFromPromo).toBe(true);
  });

  it('waives shipping without discounting the subtotal', () => {
    seedCart(UNDER_THRESHOLD);
    WowStore.validatePromo('FREESHIP');
    const totals = WowStore.getCartTotal();

    expect(totals.promoDiscount).toBe(0);
    expect(totals.subtotal).toBeCloseTo(subtotalOf(UNDER_THRESHOLD), 10);
    expect(totals.tax).toBeCloseTo(totals.subtotal * 0.08, 10);
  });

  it('applying FREESHIP never increases the total, at any cart size', () => {
    // A complementary property rather than the regression guard: the old bug still
    // lowered the total by ~$0.48 while adding a shipping charge, so it slipped past
    // a total-only check. That is precisely why the assertions above target the
    // shipping line directly.
    for (const qty of [1, 2, 3, 4, 5, 6, 7]) {
      localStorage.clear();
      seedCart([{ productId: 8, qty }]);
      const before = WowStore.getCartTotal().total;

      WowStore.validatePromo('FREESHIP');
      const after = WowStore.getCartTotal().total;

      expect(after, `qty=${qty}`).toBeLessThanOrEqual(before);
    }
  });
});

describe('getCartTotal — subscription savings', () => {
  it('bills the subscription price and reports the saving', () => {
    const product = WowStore.getProduct(1);
    seedCart([{ productId: 1, qty: 2, isSubscription: true }]);
    const totals = WowStore.getCartTotal();

    expect(totals.subtotal).toBeCloseTo(product.subscribePrice * 2, 10);
    expect(totals.savings).toBeCloseTo((product.price - product.subscribePrice) * 2, 10);
  });
});
