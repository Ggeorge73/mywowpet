// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Regression guards for reflected (B3) and stored (B2) DOM XSS.
 * Each payload sets window.__xss if it ever executes; the page must instead show
 * the attacker-controlled text literally (or drop it when it is not a known id).
 */

const IMG_PAYLOAD = '<img src=x onerror=window.__xss=1>';
const QUOTE_PAYLOAD = "dog') ;window.__xss=1;//";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('wow_install_dismissed_until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    window.sessionStorage.setItem('wow_install_prompt_seen_session', '1');
  });
});

async function gotoShop(page, query) {
  await page.goto(`/shop.html?${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof ShopPage !== 'undefined' && document.getElementById('product-grid'));
}

async function expectNoXss(page) {
  // Give any injected onerror/onload handlers a chance to fire.
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  expect(await page.locator('img[src="x"]').count()).toBe(0);
}

test.describe('Reflected XSS guards on shop.html', () => {
  test('?search= is rendered as literal text in the chip and title', async ({ page }) => {
    await gotoShop(page, `search=${encodeURIComponent(IMG_PAYLOAD)}`);

    await expect(page.locator('#shop-title')).toHaveText(`Results for "${IMG_PAYLOAD}"`);
    const chip = page.locator('#active-filters .active-filter-chip', { hasText: 'Search:' });
    await expect(chip).toContainText(IMG_PAYLOAD);
    await expectNoXss(page);

    // The chip still works without an inline onclick built from the URL.
    await chip.click();
    await expect(page.locator('#active-filters .active-filter-chip', { hasText: 'Search:' })).toHaveCount(0);
    await expectNoXss(page);
  });

  test('?pet= with markup is dropped instead of injected', async ({ page }) => {
    await gotoShop(page, `pet=${encodeURIComponent(IMG_PAYLOAD)}`);

    await expect(page.locator('#breadcrumbs .current')).toHaveText('Shop');
    await expect(page.locator('#shop-title')).toHaveText('Shop All Products');
    await expect(page.locator('#active-filters')).not.toContainText('img');
    await expectNoXss(page);
  });

  test('?pet= with a quote breakout cannot reach an onclick attribute', async ({ page }) => {
    await gotoShop(page, `pet=${encodeURIComponent(QUOTE_PAYLOAD)}`);

    expect(await page.locator('[onclick*="__xss"]').count()).toBe(0);
    await expect(page.locator('#breadcrumbs .current')).toHaveText('Shop');
    await expectNoXss(page);
  });

  test('a valid ?pet= id still filters and can be removed via its chip', async ({ page }) => {
    const pet = await page.goto('/shop.html', { waitUntil: 'domcontentloaded' })
      .then(() => page.waitForFunction(() => window.WowStore))
      .then(() => page.evaluate(() => window.WowStore.categories[0]));

    await gotoShop(page, `pet=${encodeURIComponent(pet.id)}`);
    await expect(page.locator('#breadcrumbs .current')).toHaveText(pet.name);
    const chip = page.locator('#active-filters .active-filter-chip', { hasText: pet.name });
    await expect(chip).toHaveCount(1);
    await chip.dispatchEvent('click');
    await expect(page.locator('#active-filters .active-filter-chip', { hasText: pet.name })).toHaveCount(0);
  });

  test('nav search dropdown renders the query literally', async ({ page }) => {
    await gotoShop(page, '');
    const input = page.locator('#nav-search-input:visible, #mobile-search-input:visible').first();
    test.skip(await input.count() === 0, 'No visible search input on this viewport.');

    await input.fill('<img src=x onerror=window.__xss=1>zz');
    await expect(page.getByText('No results for "<img src=x onerror=window.__xss=1>zz"')).toBeVisible();
    await expectNoXss(page);
  });
});

test.describe('Stored XSS guards on product reviews', () => {
  test('review author, text, pet, date and avatar are rendered as text', async ({ page }) => {
    await page.addInitScript((payload) => {
      window.localStorage.setItem('wow_custom_reviews', JSON.stringify([{
        id: 'attacker_1',
        productId: 1,
        author: payload,
        rating: 5,
        text: `Great food ${payload}`,
        pet: payload,
        date: '2026-01-01',
        avatar: '<img src=x onerror=window.__xss=1>'
      }]));
    }, IMG_PAYLOAD);

    await page.goto('/product.html?id=1', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.getElementById('tab-3'));
    await page.evaluate(() => ProductPage.switchTab(3));

    const reviews = page.locator('#tab-3');
    await expect(reviews).toContainText(`Great food ${IMG_PAYLOAD}`);
    await expect(reviews.locator('strong', { hasText: IMG_PAYLOAD })).toHaveCount(1);
    await expectNoXss(page);
  });
});
