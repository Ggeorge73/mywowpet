// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * QA-01 / QA-02 / QA-03: forms must never claim success they did not achieve.
 *
 * - Contact form: success only after the Firestore write resolves; otherwise an
 *   honest error with a mailto fallback.
 * - Footer newsletter: requires explicit marketing consent and reports real results.
 * - Cart checkout: a failed Shopify handoff shows a persistent inline error with a
 *   retry button and support link, never the raw exception text.
 */

const SUPPORT_MAILTO = 'mailto:support@mywowpet.com';

async function suppressInstallPrompt(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('wow_install_dismissed_until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    window.sessionStorage.setItem('wow_install_prompt_seen_session', '1');
  });
}

// Firebase is unreachable in tests; make that explicit and fast.
async function blockFirebase(page) {
  await page.route('https://www.gstatic.com/firebasejs/**', route => route.abort());
  await page.route('https://firestore.googleapis.com/**', route => route.abort());
}

// Minimal stand-in for the compat SDK. `writeMode` decides what a write does:
// 'ok' records it and resolves, 'denied' rejects like a rules failure.
async function stubFirebase(page, writeMode) {
  await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      window.__writes = [];
      window.firebase = {
        apps: [],
        initializeApp() { this.apps.push({}); }
      };
    `
  }));
  await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      window.firebase.auth = () => ({
        currentUser: null,
        onAuthStateChanged(callback) { callback(null); }
      });
    `
  }));
  await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      (function () {
        var mode = ${JSON.stringify(writeMode)};
        function write(collection, id, data) {
          if (mode === 'denied') {
            var err = new Error('Missing or insufficient permissions.');
            err.code = 'permission-denied';
            return Promise.reject(err);
          }
          window.__writes.push({ collection: collection, id: id, data: data });
          return Promise.resolve({ id: id || 'auto-id' });
        }
        window.firebase.firestore = () => ({
          collection(name) {
            return {
              add(data) { return write(name, null, data); },
              doc(id) { return { set(data) { return write(name, id, data); } }; }
            };
          }
        });
        window.firebase.firestore.FieldValue = { serverTimestamp: () => 'server-time' };
      })();
    `
  }));
}

async function fillContactForm(page) {
  await page.locator('#name').fill('Ada Lovelace');
  await page.locator('#email').fill('ada@example.com');
  await page.locator('#subject').selectOption('order');
  await page.locator('#orderNumber').fill('#1001');
  await page.locator('#message').fill('My order has not arrived yet.');
}

test.describe('Contact form (QA-01)', () => {
  test.beforeEach(async ({ page }) => {
    await suppressInstallPrompt(page);
  });

  test('shows an honest error with a mailto fallback when Firebase is unreachable', async ({ page }) => {
    await blockFirebase(page);
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    await fillContactForm(page);
    await page.getByRole('button', { name: 'Send Message' }).click();

    const status = page.locator('#contact-status');
    await expect(status).toBeVisible({ timeout: 20_000 });
    await expect(status).toHaveClass(/is-error/);
    await expect(status).toContainText('wasn’t sent');
    await expect(status).not.toContainText('Message sent');
    await expect(status.locator(`a[href="${SUPPORT_MAILTO}"]`)).toBeVisible();
    await expect(page.locator('.toast', { hasText: 'Message sent' })).toHaveCount(0);
    // The customer's text is kept so they can retry or copy it into an email.
    await expect(page.locator('#message')).toHaveValue('My order has not arrived yet.');
  });

  test('shows the error path when Firestore rejects the write', async ({ page }) => {
    await stubFirebase(page, 'denied');
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    await fillContactForm(page);
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.locator('#contact-status')).toContainText('wasn’t sent', { timeout: 20_000 });
    await expect(page.locator(`#contact-status a[href="${SUPPORT_MAILTO}"]`)).toBeVisible();
  });

  test('confirms only after the message is stored', async ({ page }) => {
    await stubFirebase(page, 'ok');
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    await fillContactForm(page);
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.locator('#contact-status')).toContainText('Message sent', { timeout: 20_000 });
    const writes = await page.evaluate(() => window.__writes);
    expect(writes).toEqual([{
      collection: 'contactMessages',
      id: null,
      data: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        subject: 'order',
        message: 'My order has not arrived yet.',
        orderNumber: '#1001',
        createdAt: 'server-time'
      }
    }]);
  });

  test('validates input before trying to send', async ({ page }) => {
    await stubFirebase(page, 'ok');
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#name').fill('Ada');
    await page.locator('#email').fill('not-an-email');
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.locator('#contact-status')).toContainText('valid email');
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
    expect(await page.evaluate(() => window.__writes || [])).toEqual([]);
  });
});

test.describe('Footer newsletter (QA-02)', () => {
  test.beforeEach(async ({ page }) => {
    await suppressInstallPrompt(page);
  });

  test('requires marketing consent before saving', async ({ page }) => {
    await stubFirebase(page, 'ok');
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    const form = page.locator('#footer-newsletter-form');
    await form.locator('#footer-newsletter-email').fill('pet.parent@example.com');
    await form.getByRole('button', { name: 'Join' }).click();

    await expect(page.locator('#footer-newsletter-status')).toContainText('tick the box');
    expect(await page.evaluate(() => window.__writes || [])).toEqual([]);
  });

  test('saves a consented signup to launchSignups', async ({ page }) => {
    await stubFirebase(page, 'ok');
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    const form = page.locator('#footer-newsletter-form');
    await form.locator('#footer-newsletter-email').fill('Pet.Parent@Example.com');
    await form.locator('#footer-newsletter-consent').check();
    await form.getByRole('button', { name: 'Join' }).click();

    await expect(page.locator('#footer-newsletter-status')).toContainText('You’re subscribed', { timeout: 20_000 });
    const writes = await page.evaluate(() => window.__writes);
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      collection: 'launchSignups',
      data: {
        email: 'pet.parent@example.com',
        petType: 'not-specified',
        consent: true,
        source: 'footer',
        offer: 'launch-15',
        createdAt: 'server-time'
      }
    });
    expect(writes[0].id).toMatch(/^[a-f0-9]{64}$/);
  });

  test('reports failure honestly when Firebase is unreachable', async ({ page }) => {
    await blockFirebase(page);
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    const form = page.locator('#footer-newsletter-form');
    await form.locator('#footer-newsletter-email').fill('pet.parent@example.com');
    await form.locator('#footer-newsletter-consent').check();
    await form.getByRole('button', { name: 'Join' }).click();

    const status = page.locator('#footer-newsletter-status');
    await expect(status).toContainText('couldn’t sign you up', { timeout: 20_000 });
    await expect(status).not.toContainText('subscribed');
  });

  test('shows the current year in the footer', async ({ page }) => {
    await blockFirebase(page);
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
    const year = String(new Date().getFullYear());
    await expect(page.locator('.footer-copyright')).toContainText(`© ${year} My Wow Pet`);
  });
});

test.describe('Checkout handoff failure (QA-03)', () => {
  // Once sw.js controls the page, WebKit sends its fetches past page.route,
  // so the blocked Storefront call reached real Shopify on Mobile Safari.
  test.use({ serviceWorkers: 'block' });

  test('shows a persistent inline retry UI and keeps the cart', async ({ page }) => {
    await suppressInstallPrompt(page);
    await blockFirebase(page);
    await page.route('https://*.myshopify.com/**', route => route.abort());

    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WowStore && typeof window.WowStore.getProducts === 'function');
    await page.evaluate(() => {
      const product = window.WowStore.getProducts()
        .find(item => item.inStock !== false && Boolean(item.shopifyVariantId));
      window.WowStore.addToCart(product.id, 2, false);
    });

    await page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#checkout-btn').click();

    const error = page.locator('#checkout-error');
    await expect(error).toBeVisible({ timeout: 20_000 });
    await expect(error).toHaveAttribute('role', 'alert');
    await expect(error).toContainText('couldn’t open secure checkout');
    await expect(error.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect(error.locator('a[href^="mailto:support@mywowpet.com"]')).toBeVisible();
    await expect(page.getByText('Failed to fetch')).toHaveCount(0);
    await expect(page.locator('#checkout-btn')).toBeEnabled();

    // Still there after a toast would have faded, and the cart is untouched.
    await page.waitForTimeout(3500);
    await expect(error).toBeVisible();
    expect(await page.evaluate(() => window.WowStore.getCartCount())).toBe(2);

    // Retrying runs the handoff again and fails the same honest way.
    await error.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('#checkout-error')).toContainText('couldn’t open secure checkout', { timeout: 20_000 });
    expect(page.url()).toContain('cart.html');
  });
});

test.describe('Mock auth service (pre-existing TypeError)', () => {
  for (const pagePath of ['/profile.html', '/product.html?id=1']) {
    test(`${pagePath} loads without a getCurrentUser TypeError`, async ({ page }) => {
      await suppressInstallPrompt(page);
      await blockFirebase(page);
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.WowFirebase && typeof window.WowFirebase.isMockMode === 'function', null, { timeout: 20_000 });
      await page.waitForTimeout(500);
      expect(errors.filter(message => /getCurrentUser/.test(message))).toEqual([]);
      expect(await page.evaluate(() => typeof window.WowFirebase.getCurrentUser)).toBe('function');
    });
  }
});
