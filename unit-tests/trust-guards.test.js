import { describe, it, expect, beforeEach } from 'vitest';
import { loadStore } from './helpers/load-store.js';

const WowStore = loadStore();

beforeEach(() => localStorage.clear());

// H2: earlier builds seeded every visitor with 750 points, two fake 2024 orders
// and two "active" subscriptions. A new visitor must start with nothing.
describe('new-visitor state', () => {
  it('starts with 0 loyalty points and no history', () => {
    expect(WowStore.getLoyalty()).toEqual({ points: 0, history: [] });
  });

  it('starts with no orders and no subscriptions', () => {
    expect(WowStore.getOrders()).toEqual([]);
    expect(WowStore.getSubscriptions()).toEqual([]);
  });

  it('starts in the lowest tier', () => {
    expect(WowStore.getLoyaltyTier(WowStore.getLoyalty().points).name).toBe('Bronze');
  });
});

describe('legacy demo data is scrubbed where it was persisted', () => {
  it('drops the demo orders but keeps real ones', () => {
    localStorage.setItem('wow_orders', JSON.stringify([
      { id: '#1001', date: '2026-10-30', status: 'ordered', items: [], total: 10 },
      { id: '#WOW-1042', date: '2024-03-15', status: 'delivered', items: [], total: 84.72 },
      { id: '#WOW-1038', date: '2024-02-20', status: 'delivered', items: [], total: 46.13 },
    ]));
    expect(WowStore.getOrders().map(o => o.id)).toEqual(['#1001']);
  });

  it('drops the demo subscriptions', () => {
    localStorage.setItem('wow_subscriptions', JSON.stringify([
      { id: 1, productId: 1, frequency: '4weeks', status: 'active', nextDelivery: '2024-04-15', startDate: '2024-01-15' },
      { id: 2, productId: 4, frequency: '4weeks', status: 'active', nextDelivery: '2024-04-12', startDate: '2024-02-12' },
    ]));
    expect(WowStore.getSubscriptions()).toEqual([]);
  });

  it('removes the demo history and the points it accounted for', () => {
    localStorage.setItem('wow_loyalty', JSON.stringify({
      points: 760,
      history: [
        { date: '2026-10-01', description: 'Pet Nutrition IQ — Bronze Beginner', points: 10 },
        { date: '2024-03-15', description: 'Purchase — Order #1042', points: 320 },
        { date: '2024-03-01', description: 'Welcome Bonus', points: 200 },
        { date: '2024-02-20', description: 'Purchase — Order #1038', points: 180 },
        { date: '2024-02-10', description: 'Review Bonus', points: 50 },
      ],
    }));
    const loyalty = WowStore.getLoyalty();
    expect(loyalty.points).toBe(10);
    expect(loyalty.history).toHaveLength(1);
  });
});

// H1: no invented ratings, review counts or reviews.
describe('ratings come only from real reviews', () => {
  it('has no hardcoded rating or reviewCount on any product', () => {
    for (const product of WowStore.products) {
      expect(product, product.name).not.toHaveProperty('rating');
      expect(product, product.name).not.toHaveProperty('reviewCount');
    }
  });

  it('reports zero reviews for every product before anyone has reviewed it', () => {
    for (const product of WowStore.products) {
      expect(WowStore.getProductReviews(product.id)).toEqual([]);
      expect(WowStore.getProductRating(product.id)).toEqual({ average: 0, count: 0 });
    }
  });

  it('renders no stars for an unreviewed product', () => {
    const html = WowStore.renderRatingSummary(1);
    expect(html).not.toContain('class="stars"');
    expect(html).toContain('No reviews yet');
    expect(WowStore.renderRatingSummary(1, { emptyText: '' })).toBe('');
  });

  it('aggregates genuine customer reviews', () => {
    localStorage.setItem('wow_custom_reviews', JSON.stringify([
      { id: 'a', productId: 1, rating: 5, text: 'Great', date: '2026-10-01' },
      { id: 'b', productId: 1, rating: 4, text: 'Good', date: '2026-10-02' },
      { id: 'c', productId: 2, rating: 1, text: 'Other product', date: '2026-10-02' },
    ]));
    expect(WowStore.getProductRating(1)).toEqual({ average: 4.5, count: 2 });
    expect(WowStore.renderRatingSummary(1)).toContain('class="stars"');
  });

  it('strips the unbacked "Verified Buyer" label from stored reviews', () => {
    localStorage.setItem('wow_custom_reviews', JSON.stringify([
      { id: 'a', productId: 1, rating: 5, text: 'Great', pet: 'Verified Buyer', date: '2026-10-01' },
    ]));
    expect(WowStore.getProductReviews(1)[0].pet).toBe('');
  });

  it('carries no bestseller badges before there are any sales', () => {
    expect(WowStore.products.some(p => p.badge === 'bestseller')).toBe(false);
  });
});
