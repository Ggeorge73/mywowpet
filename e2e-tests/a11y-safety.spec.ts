// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Safety, accessibility and SEO guards (QA-04, QA-05, QA-07, QA-08, QA-10, QA-11,
 * QA-15, QA-16).
 *
 * - The symptom page must never show invented clinics, fake GPS or a Google Maps
 *   attribution during an emergency, and must give real hotline numbers.
 * - The symptom page is keyword matching: no "AI" or "diagnostic" claims and no
 *   product recommendations as treatment.
 * - Shop filters and cart controls must work from the keyboard with accessible names.
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

const FAKE_MAP_TEXT = /google maps|gps|clinic a\b|trauma center|map data|\d+(\.\d+)?\s*mi\)/i;

async function describeSymptoms(page, text) {
  await page.goto('/check.html', { waitUntil: 'domcontentloaded' });
  await page.locator('#symptom-input').fill(text);
  await page.locator('#run-check-btn').click();
}

test.describe('Pet Symptom Guide safety', () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page);
  });

  test('emergency result shows real hotlines and no mock map or fake clinics', async ({ page }) => {
    await describeSymptoms(page, 'My dog ate rat poison');

    const overlay = page.locator('#emergency-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toContainText(/this may be an emergency/i);
    await expect(overlay).toContainText(/contact a veterinarian now/i);
    await expect(overlay).not.toContainText(FAKE_MAP_TEXT);
    await expect(page.locator('.emergency-map-card, .mock-map-marker, .gps-badge, .map-watermark')).toHaveCount(0);

    const aspca = overlay.locator('a[href^="tel:"]', { hasText: '(888) 426-4435' });
    await expect(aspca).toHaveAttribute('href', 'tel:+18884264435');
    await expect(overlay).toContainText(/ASPCA Animal Poison Control Center/);
    await expect(overlay).toContainText(/consultation fee may apply/i);
    await expect(overlay.locator('a[href^="tel:"]', { hasText: '(855) 764-7661' })).toHaveAttribute('href', 'tel:+18557647661');

    const findVet = overlay.getByRole('link', { name: /find an emergency vet near you/i });
    await expect(findVet).toHaveAttribute('href', 'https://www.google.com/maps/search/emergency+vet+near+me');
    await expect(findVet).toHaveAttribute('target', '_blank');
    await expect(findVet).toHaveAttribute('rel', /noopener/);

    // No shopping on an emergency result.
    await expect(page.locator('#check-shop-link')).toBeHidden();
    await expect(page.locator('#results-wrapper .product-card')).toHaveCount(0);
  });

  test('page makes no AI or diagnostic claims and shows the disclaimer', async ({ page }) => {
    await page.goto('/check.html', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Pet Symptom Guide/);
    expect(await page.title()).not.toMatch(/\bAI\b/);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).not.toMatch(/\bAI\b|diagnos/i);

    const disclaimer = page.locator('#check-disclaimer');
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText(/general information only, not veterinary advice/i);
    await expect(disclaimer).toContainText(/always consult your vet/i);

    const visibleText = await page.evaluate(() => {
      const parts = ['#nav-slot', '.page-body', '.disclaimer-sticky-footer', '#emergency-overlay', '#footer-slot'];
      return parts.map(sel => document.querySelector(sel)?.textContent || '').join('\n');
    });
    expect(visibleText).not.toMatch(/\bAI\b/);
    expect(visibleText).not.toMatch(/pet-check/i);
    expect(visibleText).not.toMatch(/diagnos(e|is|tic)/i);
  });

  test('non-emergency result recommends no products as treatment', async ({ page }) => {
    await describeSymptoms(page, 'My cat is scratching her ears');

    await expect(page.locator('#results-wrapper')).toBeVisible();
    await expect(page.locator('#emergency-overlay')).toBeHidden();
    await expect(page.locator('#results-wrapper')).not.toContainText(/recovery essentials|rehabilitation/i);
    await expect(page.locator('#results-wrapper .product-card')).toHaveCount(0);
    await expect(page.locator('#check-shop-link a')).toHaveText('Shop wellness');
  });
});

test.describe('Keyboard and accessible names', () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page);
  });

  test('shop filters are buttons reachable with Tab and togglable with Enter', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });

    const sidebar = page.locator('#filter-sidebar');
    const header = sidebar.getByRole('button', { name: /pet type/i });
    await expect(header).toHaveAttribute('aria-expanded', 'true');

    const options = sidebar.locator('.filter-option');
    expect(await options.count()).toBeGreaterThan(0);
    for (const tag of await options.evaluateAll(els => els.map(el => el.tagName))) {
      expect(tag).toBe('BUTTON');
    }

    // Tab from the group header onto the first pet-type option.
    await header.focus();
    await page.keyboard.press('Tab');
    const focusedId = await page.evaluate(() => document.activeElement?.getAttribute('data-filter-id'));
    expect(focusedId).toMatch(/^petType:/);
    const option = sidebar.locator(`[data-filter-id="${focusedId}"]`);
    await expect(option).toHaveAttribute('aria-pressed', 'false');

    await page.keyboard.press('Enter');
    await expect(option).toHaveAttribute('aria-pressed', 'true');
    // Focus stays on the option after the sidebar re-renders.
    expect(await page.evaluate(() => document.activeElement?.getAttribute('data-filter-id'))).toBe(focusedId);

    await page.keyboard.press('Enter');
    await expect(option).toHaveAttribute('aria-pressed', 'false');
  });

  test('cart remove is a keyboard-operable button with an accessible name', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('wow_cart', JSON.stringify([{ productId: 1, qty: 1, isSubscription: false }]));
    });
    await page.goto('/cart.html', { waitUntil: 'domcontentloaded' });

    const name = await page.evaluate(() => window.WowStore.getProduct(1).name);
    const remove = page.getByRole('button', { name: `Remove ${name} from cart` });
    await expect(remove).toBeVisible();
    await expect(page.getByRole('button', { name: `Increase quantity of ${name}` })).toBeVisible();
    await expect(page.getByRole('button', { name: `Decrease quantity of ${name}` })).toBeVisible();

    await remove.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#empty-cart')).toBeVisible();
  });

  test('search inputs have accessible names', async ({ page }) => {
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#nav-search-input')).toHaveAttribute('aria-label', /search/i);
    await expect(page.locator('#mobile-search-input')).toHaveAttribute('aria-label', /search/i);
    await expect(page.locator('.footer-newsletter-form input[type="email"]')).toHaveAttribute('aria-label', /email/i);
  });
});

test.describe('Product SEO and related items', () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page);
  });

  test('unknown product id is noindex', async ({ page }) => {
    await page.goto('/product.html?id=9999', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#product-detail')).toContainText(/product not found/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page).toHaveTitle(/not found/i);
  });

  test('known product sets title, description and a root-relative canonical', async ({ page }) => {
    await page.goto('/product.html?id=5', { waitUntil: 'domcontentloaded' });
    const product = await page.evaluate(() => window.WowStore.getProduct(5));
    await expect(page).toHaveTitle(`${product.name} | My Wow Pet`);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', '/product?id=5');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description && product.description.startsWith(description.replace(/\.\.\.$/, ''))).toBe(true);
  });

  test('related products for a cat item are all cat products', async ({ page }) => {
    await page.goto('/product.html?id=5', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('#related-products .product-card');
    await expect(cards.first()).toBeAttached();
    const petTypes = await cards.evaluateAll(els =>
      els.map(el => window.WowStore.getProduct(el.getAttribute('data-id')).petType));
    expect(petTypes.length).toBeGreaterThan(0);
    expect(new Set(petTypes)).toEqual(new Set(['cat']));
  });
});

test('coming-soon page has no horizontal overflow at 390px', async ({ page }) => {
  await prepare(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html', { waitUntil: 'load' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
