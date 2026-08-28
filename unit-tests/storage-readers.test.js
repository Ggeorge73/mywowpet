import { describe, it, expect, beforeEach } from 'vitest';
import { loadStore } from './helpers/load-store.js';

const WowStore = loadStore();

beforeEach(() => localStorage.clear());

// Values that are all valid JSON but none of them the shape the reader expects.
// Before the fix these were returned to callers as-is, so the failure surfaced far
// from its cause — a TypeError inside getCartCount or the cart renderer.
const WRONG_SHAPES = [
  ['an object', '{"productId":1}'],
  ['a bare number', '3'],
  ['a bare string', '"cart"'],
  ['a JSON null', 'null'],
  ['a boolean', 'true'],
];

const MALFORMED = [
  ['unparseable text', '{oh no'],
  ['an empty string', ''],
];

describe('getCart — shape validation', () => {
  it('returns the stored cart when it is a well-formed array', () => {
    const cart = [{ productId: 6, qty: 2, isSubscription: false }];
    localStorage.setItem('wow_cart', JSON.stringify(cart));
    expect(WowStore.getCart()).toEqual(cart);
  });

  it('returns an empty array when nothing is stored', () => {
    expect(WowStore.getCart()).toEqual([]);
  });

  it.each([...WRONG_SHAPES, ...MALFORMED])(
    'falls back to an empty array for %s',
    (_label, stored) => {
      localStorage.setItem('wow_cart', stored);
      expect(WowStore.getCart()).toEqual([]);
    },
  );

  // Regression: JSON.parse('{"productId":1}') succeeds, so the old try/catch let an
  // object through and getCartCount died on `.reduce is not a function`. Cart state
  // is persisted and synced, so one bad write bricked the cart permanently.
  it.each(WRONG_SHAPES)('keeps getCartCount working when storage holds %s', (_label, stored) => {
    localStorage.setItem('wow_cart', stored);
    expect(() => WowStore.getCartCount()).not.toThrow();
    expect(WowStore.getCartCount()).toBe(0);
  });

  it.each(WRONG_SHAPES)('keeps getCartTotal working when storage holds %s', (_label, stored) => {
    localStorage.setItem('wow_cart', stored);
    expect(() => WowStore.getCartTotal()).not.toThrow();
    expect(WowStore.getCartTotal().subtotal).toBe(0);
  });

  it('recovers on the next write rather than staying broken', () => {
    localStorage.setItem('wow_cart', '{"productId":1}');
    expect(WowStore.getCartCount()).toBe(0);

    WowStore.addToCart(6, 2);
    expect(WowStore.getCartCount()).toBe(2);
  });
});

describe('other array-backed readers', () => {
  const readers = [
    ['getPets', 'wow_pets'],
    ['getWishlist', 'wow_wishlist'],
  ];

  it.each(readers)('%s returns an array for any stored value', (fn, key) => {
    for (const [, stored] of [...WRONG_SHAPES, ...MALFORMED]) {
      localStorage.setItem(key, stored);
      expect(Array.isArray(WowStore[fn]()), `${fn} with ${stored}`).toBe(true);
    }
  });

  it.each([['getOrders', 'wow_orders'], ['getSubscriptions', 'wow_subscriptions']])(
    '%s returns an array and keeps its seed data intact',
    (fn, key) => {
      const seeded = WowStore[fn]();
      expect(Array.isArray(seeded)).toBe(true);
      expect(seeded.length).toBeGreaterThan(0);

      localStorage.setItem(key, '{"not":"a list"}');
      expect(Array.isArray(WowStore[fn]())).toBe(true);

      localStorage.setItem(key, '[]');
      expect(WowStore[fn]()).toEqual([]); // an explicit empty list is a real value
    },
  );
});

describe('record-backed readers', () => {
  it('getLoyalty always returns a usable record', () => {
    for (const [, stored] of [...WRONG_SHAPES, ...MALFORMED, ['array', '[]']]) {
      localStorage.setItem('wow_loyalty', stored);
      const loyalty = WowStore.getLoyalty();
      expect(Array.isArray(loyalty.history), `history for ${stored}`).toBe(true);
      expect(Number.isFinite(loyalty.points), `points for ${stored}`).toBe(true);
    }
  });

  it('addLoyaltyPoints survives a partial stored record', () => {
    // Regression: a record without `history` threw on `.unshift`.
    localStorage.setItem('wow_loyalty', '{"points":40}');
    expect(() => WowStore.addLoyaltyPoints(10, 'Review Bonus')).not.toThrow();

    const loyalty = WowStore.getLoyalty();
    expect(loyalty.points).toBe(50);
    expect(loyalty.history[0]).toMatchObject({ description: 'Review Bonus', points: 10 });
  });

  it('getGameHighScore falls back to a zeroed record', () => {
    localStorage.setItem('wow_game_high', '[]');
    expect(WowStore.getGameHighScore()).toEqual({ score: 0, correct: 0, played: 0 });
  });
});

describe('cart mutations', () => {
  it('merges a repeat add into the existing line', () => {
    WowStore.addToCart(6, 1);
    WowStore.addToCart(6, 2);
    expect(WowStore.getCart()).toHaveLength(1);
    expect(WowStore.getCartCount()).toBe(3);
  });

  it('keeps subscription and one-off lines separate', () => {
    WowStore.addToCart(1, 1, false);
    WowStore.addToCart(1, 1, true);
    expect(WowStore.getCart()).toHaveLength(2);
  });

  it('removes a line when its quantity drops to zero', () => {
    WowStore.addToCart(6, 2);
    WowStore.updateCartQty(6, 0);
    expect(WowStore.getCart()).toEqual([]);
  });

  it('refuses to add an unknown product', () => {
    expect(WowStore.addToCart(999999, 1)).toBeNull();
    expect(WowStore.getCartCount()).toBe(0);
  });
});
