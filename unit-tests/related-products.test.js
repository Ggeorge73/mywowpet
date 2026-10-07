import { describe, it, expect } from 'vitest';
import { loadStore } from './helpers/load-store.js';

const WowStore = loadStore();

const productsFor = (petType) => WowStore.products.filter((p) => p.petType === petType);

describe('getRelatedProducts', () => {
  it('only suggests products for the same pet type (cat food never suggests puppy food or bird seed)', () => {
    const catFood = WowStore.products.find((p) => p.petType === 'cat' && p.category === 'food');
    const related = WowStore.getRelatedProducts(catFood.id, 6);
    expect(related.length).toBeGreaterThan(0);
    for (const p of related) {
      expect(p.petType).toBe('cat');
    }
  });

  it('never includes the current product', () => {
    for (const product of WowStore.products) {
      const related = WowStore.getRelatedProducts(product.id, 6);
      expect(related.map((p) => p.id)).not.toContain(product.id);
    }
  });

  it('lists same-category items for that pet first', () => {
    const catFood = WowStore.products.find((p) => p.petType === 'cat' && p.category === 'food');
    const related = WowStore.getRelatedProducts(catFood.id, 6);
    const firstOther = related.findIndex((p) => p.category !== 'food');
    if (firstOther !== -1) {
      expect(related.slice(firstOther).every((p) => p.category !== 'food')).toBe(true);
    }
  });

  it('is deterministic between calls', () => {
    const id = productsFor('dog')[0].id;
    expect(WowStore.getRelatedProducts(id, 4)).toEqual(WowStore.getRelatedProducts(id, 4));
  });

  it('respects the limit', () => {
    const id = productsFor('dog')[0].id;
    expect(WowStore.getRelatedProducts(id, 3)).toHaveLength(3);
  });

  it('falls back to the same category only when no other product exists for that pet', () => {
    const lonely = WowStore.products.find((p) => productsFor(p.petType).length === 1);
    if (!lonely) return; // every pet type has company in the current catalog
    const related = WowStore.getRelatedProducts(lonely.id, 6);
    for (const p of related) {
      expect(p.category).toBe(lonely.category);
    }
  });

  it('returns an empty list for an unknown product', () => {
    expect(WowStore.getRelatedProducts(9999)).toEqual([]);
  });
});
