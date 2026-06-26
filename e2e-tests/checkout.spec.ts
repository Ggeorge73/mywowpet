// @ts-check
const { test, expect } = require('@playwright/test');
// E2E smoke tests for the mywowpet.com Firebase static storefront.
// Static Firebase-hosted app; cart state persists in localStorage under "wow_cart".
// Base URL comes from BASE_URL (default https://wow-pet-store.web.app) in playwright.config.ts.
const KNOWN_PRODUCT_ID = 6;

test.describe('Landing Page Health', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15000 });
  });
  test('homepage responds without a server error', async ({ page }) => {
    const res = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 200).toBeLessThan(400);
  });
  test('page title mentions the brand', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('wow');
  });
  test('navigation is injected and contains links', async ({ page }) => {
    const nav = page.locator('#nav-slot');
    await expect(nav).toBeAttached({ timeout: 10000 });
    await expect(nav.locator('a').first()).toBeVisible({ timeout: 15000 });
  });
  test('footer is injected with content', async ({ page }) => {
    const footer = page.locator('#footer-slot');
    await expect(footer).toBeAttached({ timeout: 10000 });
    await expect.poll(async () => ((await footer.textContent()) || '').length, { timeout: 10000 }).toBeGreaterThan(10);
  });
});
test.describe('Shop & Product Flow', () => {
  test('shop page renders a product grid', async ({ page }) => {
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    const grid = page.locator('#product-grid');
    await expect(grid).toBeAttached({ timeout: 15000 });
    const cards = grid.locator('a[href*="product.html"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });
  test('product page shows an enabled Add to Cart button', async ({ page }) => {
    await page.goto('/product.html?id=' + KNOWN_PRODUCT_ID, { waitUntil: 'domcontentloaded' });
    const addBtn = page.locator('#add-to-cart-btn');
    await expect(addBtn).toBeVisible({ timeout: 20000 });
    await expect(addBtn).toBeEnabled();
  });
  test('adding to cart persists the item in localStorage', async ({ page }) => {
    await page.goto('/product.html?id=' + KNOWN_PRODUCT_ID, { waitUntil: 'domcontentloaded' });
    const addBtn = page.locator('#add-to-cart-btn');
    await expect(addBtn).toBeVisible({ timeout: 20000 });
    await addBtn.click();
    await expect.poll(async () => page.evaluate(() => {
      try {
        const raw = window.localStorage.getItem('wow_cart');
        const items = raw ? JSON.parse(raw) : [];
        return Array.isArray(items) ? items.length : 0;
      } catch {
        return 0;
      }
    }), { timeout: 10000 }).toBeGreaterThanOrEqual(1);
  });
  test('cart page loads its container', async ({ page }) => {
    const res = await page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 200).toBeLessThan(400);
    await expect(page.locator('#cart-count-text, #cart-layout, #cart-items').first()).toBeAttached({ timeout: 15000 });
  });
});
test.describe('Resilience', () => {
  test('unknown route does not throw a 500', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist-xyz-404', { waitUntil: 'domcontentloaded' }).catch(() => null);
    if (res) expect(res.status()).not.toBe(500);
  });
});
