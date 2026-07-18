// @ts-check
const { test, expect } = require('@playwright/test');

async function suppressInstallPrompt(page) {
  await page.addInitScript(() => {
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem('wow_install_dismissed_until', String(dismissedUntil));
    window.sessionStorage.setItem('wow_install_prompt_seen_session', '1');
  });
}

async function openPurchasableProduct(page) {
  await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.WowStore && typeof window.WowStore.getProducts === 'function');

  const productId = await page.evaluate(() => {
    const product = window.WowStore
      .getProducts()
      .find((item) => item.inStock !== false && Boolean(item.shopifyVariantId));
    return product ? String(product.id) : null;
  });

  expect(productId).toBeTruthy();
  await page.goto(`/product.html?id=${productId}`, { waitUntil: 'domcontentloaded' });
  if (!new URL(page.url()).searchParams.has('id')) {
    await page.goto(`/product?id=${productId}`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.locator('text=Product Not Found')).toHaveCount(0);
}

/**
 * E2E smoke tests for the mywowpet.com Firebase static storefront.
 *
 * IMPORTANT: This site is a static Firebase-hosted app (index.html, shop.html,
 * product.html?id=, cart.html ...) — NOT a Shopify Liquid theme. Cart state is
 * persisted client-side via window.WowStore (localStorage). Tests target the
 * real DOM (#early-access-form, #product-grid, #add-to-cart-btn).
 *
 * Base URL comes from STOREFRONT_URL (default https://wow-pet-store.web.app), set in
 * playwright.config.js.
 */

test.describe('Landing Page Health', () => {
  test.beforeEach(async ({ page }) => {
    await suppressInstallPrompt(page);
    await page.route('**/videos/*.mp4', route => route.fulfill({ status: 204, body: '' }));
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
  });

  test('homepage responds without a server error', async ({ page }) => {
    const res = await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 200).toBeLessThan(400);
  });

  test('page title mentions the brand', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain('wow');
  });

  test('launch brand and opening status are visible', async ({ page }) => {
    await expect(page.locator('.brand')).toContainText('My Wow Pet');
    await expect(page.locator('.opening-note')).toContainText('Opening soon');
  });

  test('launch offer and signup form are ready', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /good stuff is almost here/i })).toBeVisible();
    await expect(page.locator('#early-access-form')).toBeVisible();
    await expect(page.locator('#signup-email')).toHaveAttribute('type', 'email');
    await expect(page.getByRole('button', { name: /save my spot/i })).toBeVisible();
  });

  test('pet portrait renders a happy motion video', async ({ page }) => {
    const portrait = page.locator('.pet-portrait video');
    await expect(portrait).toBeVisible({ timeout: 15_000 });
    await expect(portrait).toHaveAttribute('autoplay', '');
    await expect(portrait).toHaveAttribute('muted', '');
    await expect(portrait.locator('source')).toHaveAttribute('src', /\/videos\/hero\.mp4$/);
  });

  test('no significant console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/index.html', { waitUntil: 'load' });
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
    await suppressInstallPrompt(page);
    await openPurchasableProduct(page);

    const addBtn = page.locator('#add-to-cart-btn');
    await expect(addBtn).toBeVisible({ timeout: 15_000 });
    await expect(addBtn).toBeEnabled();
  });

  test('adding to cart updates the persisted cart count', async ({ page }) => {
    await suppressInstallPrompt(page);
    await openPurchasableProduct(page);

    const addBtn = page.locator('#add-to-cart-btn');
    await expect(addBtn).toBeVisible({ timeout: 15_000 });
    await addBtn.click({ force: true });
    await page.waitForTimeout(1500);

    await expect.poll(() => {
      return page.evaluate(() => {
        try {
          // Primary: use the exposed WowStore API
          if (window.WowStore && typeof window.WowStore.getCartCount === 'function') {
            const count = window.WowStore.getCartCount();
            if (count > 0) return count;
          }
          // Fallback: read directly from localStorage
          const raw = localStorage.getItem('wow_cart');
          if (raw) {
            const cart = JSON.parse(raw);
            return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
          }
          return 0;
        } catch { return 0; }
      });
    }, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  });

  test('cart page loads its container', async ({ page }) => {
    const res = await page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 200).toBeLessThan(400);
    await expect(
      page.locator('#cart-count-text, #cart-layout, #cart-items').first()
    ).toBeAttached({ timeout: 15_000 });
  });
});

test.describe('Shopify Checkout Handoff', () => {
  test('cart creation includes the custom storefront return URL', async ({ page }) => {
    let capturedBody;

    await page.route('https://id0dxt-4y.myshopify.com/api/**/graphql.json', async (route) => {
      capturedBody = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            cartCreate: {
              cart: {
                id: 'gid://shopify/Cart/test',
                checkoutUrl: 'https://id0dxt-4y.myshopify.com/checkouts/cn/test',
                discountCodes: [],
                cost: {
                  subtotalAmount: { amount: '18.99', currencyCode: 'USD' },
                  totalAmount: { amount: '18.99', currencyCode: 'USD' }
                }
              },
              userErrors: []
            }
          }
        })
      });
    });

    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WowStore && typeof window.WowStore.createShopifyCart === 'function');

    await page.evaluate(() => window.WowStore.createShopifyCart(
      [{ productId: 6, qty: 3 }],
      { returnUrl: 'https://mywowpet.com/' }
    ));

    expect(capturedBody?.variables?.input?.attributes).toEqual(expect.arrayContaining([
      { key: 'source', value: 'my-wow-pet-custom-storefront' },
      { key: 'source_url', value: 'https://mywowpet.com/' },
      { key: 'return_url', value: 'https://mywowpet.com/' }
    ]));
  });

  test('checkout URL preserves Shopify checkout and adds the custom return target', async ({ page }) => {
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WowStore && typeof window.WowStore.buildShopifyCheckoutUrl === 'function');

    const checkoutUrl = await page.evaluate(() => window.WowStore.buildShopifyCheckoutUrl(
      'https://id0dxt-4y.myshopify.com/checkouts/cn/test?existing=1',
      'https://mywowpet.com/'
    ));
    const parsed = new URL(checkoutUrl);

    expect(parsed.origin).toBe('https://id0dxt-4y.myshopify.com');
    expect(parsed.pathname).toBe('/checkouts/cn/test');
    expect(parsed.searchParams.get('existing')).toBe('1');
    expect(parsed.searchParams.get('return_url')).toBe('https://mywowpet.com/');
    expect(parsed.searchParams.get('return_to')).toBe('https://mywowpet.com/');
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
