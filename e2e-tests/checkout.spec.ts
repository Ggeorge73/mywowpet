// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E smoke tests for the mywowpet.com Firebase static storefront.
 *
 * IMPORTANT: This site is a static Firebase-hosted app (index.html, shop.html,
 * product.html?id=, cart.html ...) — NOT a Shopify Liquid theme. Cart state is
 * persisted client-side via window.WowStore (localStorage). Tests target the
 * real DOM (#nav-slot, #footer-slot, #product-grid, #add-to-cart-btn).
 *
 * Base URL comes from STOREFRONT_URL (default https://wow-pet-store.web.app), set in
 * playwright.config.js.
 */

test.describe('Landing Page Health', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
  });

  test('homepage responds without a server error', async ({ page }) => {
    const res = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 200).toBeLessThan(400);
  });

  test('page title mentions the brand', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain('wow');
  });

  test('navigation is injected and contains links', async ({ page }) => {
    const nav = page.locator('#nav-slot');
    await expect(nav).toBeAttached({ timeout: 10_000 });
    // #nav-slot is populated client-side by app.js
    await expect(nav.locator('a').first()).toBeVisible({ timeout: 15_000 });
  });

  test('footer is injected with content', async ({ page }) => {
    const footer = page.locator('#footer-slot');
    await expect(footer).toBeAttached({ timeout: 10_000 });
    await page.waitForTimeout(1500);
    expect(((await footer.textContent()) || '').length).toBeGreaterThan(10);
  });

  test('hero section renders above the fold', async ({ page }) => {
    const hero = page
      .locator('[class*="hero"], [class*="banner"], section video, section:first-of-type')
      .first();
    await expect(hero).toBeVisible({ timeout: 15_000 });
  });

  test('no significant console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const significant = errors.filter(
      (e) => !/favicon|Failed to load resource|analytics|gtm|fbevents|shopify|postMessage|service worker|sw\.js/i.test(e)
    );
    expect.soft(significant, `Console errors: ${significant.join(' | ')}`).toHaveLength(0);
  });
});

test.describe('Shop & Product Flow', () => {
  test('shop page renders a product grid', async ({ page }) => {
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    const grid = page.locator('#product-grid');
    await expect(grid).toBeAttached({ timeout: 15_000 });
    const cards = grid.locator('a[href*="product.html"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('product page shows an enabled Add to Cart button', async ({ page }) => {
    // Derive a real product URL from the shop grid (no hard-coded id).
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    const firstProduct = page.locator('#product-grid a[href*="product.html"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 15_000 });
    const href = await firstProduct.getAttribute('href');
    await page.goto(href || '/product.html?id=1', { waitUntil: 'domcontentloaded' });

    const addBtn = page.locator('#add-to-cart-btn');
    await expect(addBtn).toBeVisible({ timeout: 15_000 });
    await expect(addBtn).toBeEnabled();
  });

  test('adding to cart updates the persisted cart count', async ({ page }) => {
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    const firstProduct = page.locator('#product-grid a[href*="product.html"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 15_000 });
    const href = await firstProduct.getAttribute('href');
    await page.goto(href || '/product.html?id=1', { waitUntil: 'domcontentloaded' });

    const addBtn = page.locator('#add-to-cart-btn');
    await expect(addBtn).toBeVisible({ timeout: 15_000 });
    await addBtn.click();
    await page.waitForTimeout(1200);

    const cartCount = await page.evaluate(() => {
      try {
        return (window.WowStore && typeof window.WowStore.getCartCount === 'function')
          ? window.WowStore.getCartCount()
          : 0;
      } catch { return 0; }
    });
    expect(cartCount).toBeGreaterThanOrEqual(1);
  });

  test('cart page loads its container', async ({ page }) => {
    const res = await page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 200).toBeLessThan(400);
    await expect(
      page.locator('#cart-count-text, #cart-layout, #cart-items').first()
    ).toBeAttached({ timeout: 15_000 });
  });
});

test.describe('Resilience', () => {
  test('unknown route does not throw a 500', async ({ page }) => {
    const res = await page
      .goto('/this-page-does-not-exist-xyz-404', { waitUntil: 'domcontentloaded' })
      .catch(() => null);
    if (res) expect(res.status()).not.toBe(500);
  });
});
