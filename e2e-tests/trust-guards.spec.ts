// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Trust & launch guards (eng review H1, H2, H3, M5, B5).
 *
 * The store is pre-launch with no real reviews or orders, so pages must not show
 * invented star ratings, social-proof popups, flash-sale countdowns, spin-to-win
 * wheels, local discounts or subscription pricing that Shopify cannot honour.
 */

async function prepare(page) {
  await page.addInitScript(() => {
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem('wow_install_dismissed_until', String(dismissedUntil));
    window.sessionStorage.setItem('wow_install_prompt_seen_session', '1');
  });
  // Keep tests offline-safe and fast: no hero/product video downloads.
  await page.route('**/videos/*.mp4', route => route.fulfill({ status: 204, body: '' }));
}

// Selectors and copy used by the removed social-proof, flash-sale and spin-wheel
// widgets, plus generic fallbacks in case they come back under another name.
const FAKE_URGENCY_SELECTORS = [
  '#social-proof-feed',
  '#flash-sale-banner',
  '[id*="spin" i]',
  '[class*="spin-wheel" i]',
  '[class*="social-proof" i]',
  '[class*="flash-sale" i]',
];

async function expectNoFakeUrgency(page) {
  // The removed widgets injected themselves a few seconds after load.
  await page.waitForTimeout(1500);
  for (const selector of FAKE_URGENCY_SELECTORS) {
    await expect(page.locator(selector), selector).toHaveCount(0);
  }
  const globals = await page.evaluate(() => ({
    socialProof: typeof window.WowSocialProof,
    flashSale: typeof window.WowFlashSale,
    spinWheel: typeof window.WowSpinWheel,
  }));
  expect(globals).toEqual({ socialProof: 'undefined', flashSale: 'undefined', spinWheel: 'undefined' });
  await expect(page.locator('body')).not.toContainText(/just (purchased|bought)|spin to win|flash sale|PET10|FREESHIP/i);
}

test.describe('Trust guards', () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page);
  });

  test('product page shows no star rating when there are no reviews', async ({ page }) => {
    await page.goto('/product.html?id=1', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.product-title')).toBeVisible({ timeout: 15_000 });

    const rating = page.locator('#product-detail .product-rating');
    await expect(rating).toContainText('No reviews yet');
    await expect(rating.locator('.stars')).toHaveCount(0);
    await expect(page.locator('#product-detail')).not.toContainText(/\(\d+ reviews?\)/);

    // Reviews tab: no aggregate stars and no seeded reviews.
    await expect(page.locator('#product-tabs .tab', { hasText: 'Reviews' })).toContainText('(0)');
    await expect(page.locator('#tab-3')).not.toContainText('Verified Buyer');
    await expect(page.locator('#tab-3 .stars')).toHaveCount(0);
  });

  test('product page has no subscription pricing while autoship is off', async ({ page }) => {
    await page.goto('/product.html?id=1', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.product-title')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#product-detail .badge-subscribe')).toHaveCount(0);
    await expect(page.locator('#product-detail')).not.toContainText(/Save \d+%/);
  });

  test('shop cards show no ratings, subscribe prices or bestseller claims', async ({ page }) => {
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.product-card .stars')).toHaveCount(0);
    await expect(page.locator('.product-card .subscribe-price')).toHaveCount(0);
    await expect(page.locator('.product-card')).not.toContainText(['Bestseller']);
    await expect(page.locator('nav.navbar a[href="subscribe.html"]')).toHaveCount(0);
  });

  for (const path of ['/shop.html', '/product.html?id=1', '/home.html']) {
    test(`no social-proof, flash-sale or spin elements on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.locator('#nav-slot .navbar').waitFor({ state: 'attached', timeout: 15_000 });
      await expectNoFakeUrgency(page);
    });
  }

  test('home.html renders a product grid and links to shop, product and help', async ({ page }) => {
    const res = await page.goto('/home.html', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 200).toBeLessThan(400);

    const grid = page.locator('#featured-products.product-grid');
    await expect(grid.locator('.product-card').first()).toBeVisible({ timeout: 15_000 });
    expect(await grid.locator('.product-card').count()).toBeGreaterThanOrEqual(4);
    await expect(grid.locator('a[href^="product.html?id="]').first()).toBeAttached();
    await expect(page.locator('main, body').locator('a[href="shop.html"]').first()).toBeAttached();
    await expect(page.locator('a[href="help.html"]').first()).toBeAttached();

    // No invented social proof on the store home.
    await expect(page.locator('body')).not.toContainText(/\d(\.\d)?\/5 rating|happy pets|loved by pet parents/i);
    await expect(page.locator('.stars')).toHaveCount(0);
  });

  test('subscribe page shows the autoship coming-soon state with no 15% claim', async ({ page }) => {
    await page.goto('/subscribe.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#autoship-coming-soon')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#autoship-coming-soon')).toContainText('coming soon');
    await expect(page.locator('#subscribe-live')).toBeHidden();
    await expect(page.locator('#autoship-coming-soon')).not.toContainText('15%');
  });

  test('cart never applies a discount code locally', async ({ page }) => {
    await page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WowStore && typeof window.WowStore.getProducts === 'function');
    await page.evaluate(() => {
      const product = window.WowStore.getProducts().find(p => p.shopifyVariantId && p.inStock !== false);
      window.WowStore.addToCart(product.id, 1, false);
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#order-summary .summary-row.total')).toBeVisible({ timeout: 15_000 });

    const totalBefore = await page.locator('#order-summary .summary-row.total').innerText();
    await page.locator('#promo-input').fill('welcome15');
    await page.locator('.promo-code button').click();

    await expect(page.locator('#promo-note')).toContainText('WELCOME15');
    await expect(page.locator('#order-summary .summary-row.total')).toHaveText(totalBefore);
    await expect(page.locator('#order-summary .summary-row.savings')).toHaveCount(0);
  });

  test('a new visitor sees no demo loyalty points, orders or subscriptions', async ({ page }) => {
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WowStore && typeof window.WowStore.getLoyalty === 'function');
    const state = await page.evaluate(() => ({
      points: window.WowStore.getLoyalty().points,
      orders: window.WowStore.getOrders().length,
      subscriptions: window.WowStore.getSubscriptions().length,
    }));
    expect(state).toEqual({ points: 0, orders: 0, subscriptions: 0 });
  });
});
