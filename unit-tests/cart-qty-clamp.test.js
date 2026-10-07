import { describe, it, expect, beforeEach } from 'vitest';
import { loadStore } from './helpers/load-store.js';

const WowStore = loadStore();

beforeEach(() => localStorage.clear());

// QA-19: a tampered or stale `wow_cart` with qty -3 rendered "-3 items" and a
// negative total. Quantities are now clamped to 1..99 on every read and write.
describe('clampCartQty', () => {
  it.each([
    [1, 1],
    [5, 5],
    [99, 99],
    [100, 99],
    [1e9, 99],
    [0, 1],
    [-3, 1],
    [2.7, 2],
    [Number.NaN, 1],
    [Infinity, 1],
    ['4', 4],
    ['abc', 1],
    [null, 1],
    [undefined, 1],
  ])('clamps %s to %s', (input, expected) => {
    expect(WowStore.clampCartQty(input)).toBe(expected);
  });
});

describe('getCart — quantity guard on read', () => {
  it.each([
    ['negative', -3],
    ['zero', 0],
    ['NaN (serialised as null)', null],
    ['a string', 'lots'],
  ])('reads a %s quantity as 1', (_label, qty) => {
    localStorage.setItem('wow_cart', JSON.stringify([{ productId: 6, qty, isSubscription: false }]));
    expect(WowStore.getCart()[0].qty).toBe(1);
    expect(WowStore.getCartCount()).toBe(1);
    expect(WowStore.getCartTotal().subtotal).toBeGreaterThan(0);
  });

  it('caps an oversized quantity at 99', () => {
    localStorage.setItem('wow_cart', JSON.stringify([{ productId: 6, qty: 5000, isSubscription: false }]));
    expect(WowStore.getCartCount()).toBe(99);
  });

  it('drops rows that are not objects', () => {
    localStorage.setItem('wow_cart', JSON.stringify([null, 3, 'x', [], { productId: 6, qty: 2, isSubscription: false }]));
    expect(WowStore.getCart()).toEqual([{ productId: 6, qty: 2, isSubscription: false }]);
  });

  it('never produces a negative total', () => {
    localStorage.setItem('wow_cart', JSON.stringify([{ productId: 6, qty: -3, isSubscription: false }]));
    expect(WowStore.getCartTotal().total).toBeGreaterThan(0);
  });
});

describe('cart writes — quantity guard', () => {
  it('clamps updateCartQty above 99', () => {
    WowStore.addToCart(6, 1);
    WowStore.updateCartQty(6, 250);
    expect(WowStore.getCartCount()).toBe(99);
  });

  it('clamps a negative or NaN update to 1 instead of storing it', () => {
    WowStore.addToCart(6, 4);
    WowStore.updateCartQty(6, -3);
    expect(WowStore.getCart()[0].qty).toBe(1);
    WowStore.updateCartQty(6, Number.NaN);
    expect(WowStore.getCart()[0].qty).toBe(1);
  });

  it('still removes the line on a deliberate step down to zero', () => {
    WowStore.addToCart(6, 1);
    WowStore.updateCartQty(6, 0);
    expect(WowStore.getCart()).toEqual([]);
  });

  it('caps repeated adds at 99', () => {
    WowStore.addToCart(6, 60);
    WowStore.addToCart(6, 60);
    expect(WowStore.getCartCount()).toBe(99);
  });

  it('stores a sane quantity when addToCart is given junk', () => {
    WowStore.addToCart(6, -5);
    expect(WowStore.getCart()[0].qty).toBe(1);
  });
});
