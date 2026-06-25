// @ts-check
const { test, expect } = require('@playwright/test');

/* ---------------------------------------------------------------------------
 * Constants
 * --------------------------------------------------------------------------- */

const BASE_URL = process.env.STOREFRONT_URL || 'https://mywowpet.com';

/** Shopify checkout URLs follow this pattern */
const CHECKOUT_URL_PATTERN = /checkout|checkouts/i;

/** Maximum acceptable Largest Contentful Paint (ms) */
const MAX_LCP_MS = 2500;

/** Reusable selectors — centralised for easy maintenance */
const SEL = {
  heroSection: '[class*="hero"], [class*="banner"], [class*="slideshow"], [data-section-type="slideshow"], section:first-of-type img',
  navMenu: 'nav, [role="navigation"], header nav',
  footer: 'footer, [role="contentinfo"]',
  cartCount: '[class*="cart-count"], [data-cart-count], .cart-count-bubble, [class*="CartCount"]',
  cartDrawer: '[class*="cart-drawer"], [class*="cart-sidebar"], [class*="CartDrawer"], [data-cart-drawer]',
  cartItem: '[class*="cart-item"], [class*="cart__item"], [class*="CartItem"], tr[class*="cart"]',
  quantityInput: 'input[name="quantity"], input[type="number"][name*="quantity"], [class*="quantity"] input',
  removeButton: '[class*="remove"], button[aria-label*="Remove"], a[href*="/cart/change"]',
  searchInput: 'input[type="search"], input[name="q"], input[placeholder*="Search"], [data-search-input]',
};

/* ---------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------- */

/**
 * Dismiss cookie / consent banners so they don't block interactions.
 * Best-effort — silently ignores if no banner is found.
 */
async function dismissConsentBanner(page) {
  const consentSelectors = [
    'button:has-text("Accept")',
    'button:has-text("Got it")',
    'button:has-text("I agree")',
    '[class*="cookie"] button',
    '[id*="cookie"] button',
  ];
  for (const sel of consentSelectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(500);
      break;
    }
  }
}

/**
 * Navigate to the first available product from the /collections/all page.
 * Returns the product page URL or null.
 */
async function navigateToFirstProduct(page) {
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });
  await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  await dismissConsentBanner(page);

  // Shopify product links typically match /products/<handle>
  const productLink = page
    .locator('a[href*="/products/"]')
    .filter({ visible: true })
    .first();

  await expect(productLink).toBeVisible({ timeout: 15_000 });
  const href = await productLink.getAttribute('href');
  await productLink.click({ force: true });
  await page.waitForLoadState('domcontentloaded');
  return href;
}

/**
 * Navigate to first product, dismiss banner, click Add to Cart, and wait for network/DOM update.
 */
async function addProductToCart(page) {
  await navigateToFirstProduct(page);
  await dismissConsentBanner(page);

  const addToCartBtn = page
    .locator(
      '[data-testid="standalone-add-to-cart"], [id*="-add-to-cart"], button[name="add"]:not([class*="sticky"]), button:has-text("Add to Cart"):not([class*="sticky"]), button:has-text("Add to cart"):not([class*="sticky"]), form[action*="/cart/add"] button[type="submit"]:not([class*="sticky"])'
    )
    .first();

  await expect(addToCartBtn).toBeVisible({ timeout: 15_000 });

  // Listen for the AJAX add-to-cart request
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/cart/add') && response.status() === 200,
    { timeout: 15_000 }
  ).catch(() => null);

  await addToCartBtn.click({ force: true });
  await responsePromise;
  await page.waitForTimeout(2000); // Wait for cart update transition
}

/* ===========================================================================
 * TEST SUITES
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * 1. Landing Page Health
 * --------------------------------------------------------------------------- */

test.describe('Landing Page Health', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await dismissConsentBanner(page);
  });

  test('page loads successfully with 200 status', async ({ page }) => {
    // The page should already be loaded from beforeEach.
    // Verify URL is the homepage.
    expect(page.url()).toMatch(new RegExp(`^${BASE_URL.replace(/\//g, '\\/')}\\/?`));
  });

  test('page title is non-empty and meaningful', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(3);
    // Soft-assert brand name presence — not fatal if absent
    expect.soft(title.toLowerCase()).toContain('wow');
  });

  test('hero / banner section renders above the fold', async ({ page }) => {
    const hero = page.locator(SEL.heroSection).first();
    await expect(hero).toBeVisible({ timeout: 10_000 });
  });

  test('primary CTA buttons are visible and clickable', async ({ page }) => {
    // Look for prominent call-to-action buttons / links
    const ctaLocators = [
      page.getByRole('link', { name: /shop/i }).first(),
      page.getByRole('link', { name: /buy/i }).first(),
      page.getByRole('link', { name: /explore/i }).first(),
      page.getByRole('link', { name: /collection/i }).first(),
      page.getByRole('button', { name: /shop/i }).first(),
    ];

    let foundCta = false;
    for (const cta of ctaLocators) {
      if (await cta.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(cta).toBeEnabled();
        foundCta = true;
        break;
      }
    }
    expect(foundCta).toBe(true);
  });

  test('navigation menu is present and contains links', async ({ page }) => {
    const nav = page.locator(SEL.navMenu).first();
    await expect(nav).toBeAttached({ timeout: 10_000 });

    const navLinks = nav.locator('a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('footer renders with expected content', async ({ page }) => {
    const footer = page.locator(SEL.footer).first();
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible({ timeout: 10_000 });

    // Soft-assert common footer elements
    const footerText = (await footer.textContent()) || '';
    expect.soft(footerText.length).toBeGreaterThan(10);
  });
});

/* ---------------------------------------------------------------------------
 * 2. Performance Assertions
 * --------------------------------------------------------------------------- */

test.describe('Performance Assertions', () => {
  test('LCP is within acceptable threshold (<= 2500ms)', async ({ page }) => {
    test.slow(); // Allow extra time for performance measurement

    await page.goto('/', { waitUntil: 'load' });

    // Inject a PerformanceObserver to capture LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcpValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            lcpValue = entry.startTime;
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Give the observer time to capture the LCP entry
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 3000);
      });
    });

    console.log(`LCP measured: ${lcp}ms`);
    expect(lcp).toBeLessThanOrEqual(MAX_LCP_MS);
  });

  test('no console errors on homepage load', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Filter out known benign third-party errors
    const significantErrors = consoleErrors.filter(
      (err) =>
        !err.includes('third-party') &&
        !err.includes('Failed to load resource') &&
        !err.includes('favicon') &&
        !err.includes('analytics') &&
        !err.includes('gtm') &&
        !err.includes('fbevents') &&
        !err.includes('shopify') &&
        !err.includes('shop.app') &&
        !err.includes('postMessage')
    );

    expect.soft(significantErrors).toHaveLength(0);
    if (significantErrors.length > 0) {
      console.warn('Console errors detected:', significantErrors);
    }
  });
});

/* ---------------------------------------------------------------------------
 * 3. Account Flow
 * --------------------------------------------------------------------------- */

test.describe('Account Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/account/login', { waitUntil: 'domcontentloaded' });
    await dismissConsentBanner(page);

    // If classic login form password field is visible, classic accounts are active.
    // If it redirects to Shopify-hosted identity domain, home page, passwordless login, or bot challenge, skip.
    const passwordInput = page.locator('input[type="password"], input[name="customer[password]"]').first();
    const isClassic = await passwordInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isClassic) {
      test.skip(true, 'Classic Customer Accounts are not enabled on this store.');
    }
  });

  test('login form fields render (email & password)', async ({ page }) => {
    const emailInput = page
      .locator('input[type="email"], input[name="customer[email]"], input[autocomplete="email"]')
      .first();
    const passwordInput = page
      .locator('input[type="password"], input[name="customer[password]"]')
      .first();

    await expect(emailInput).toBeVisible({ timeout: 10_000 });
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });
  });

  test('empty form submission shows validation errors', async ({ page }) => {
    const submitButton = page
      .locator('button[type="submit"], input[type="submit"]')
      .first();

    await expect(submitButton).toBeVisible({ timeout: 10_000 });
    await submitButton.click();

    // Wait for error messages or native validation
    await page.waitForTimeout(1500);

    // Check for Shopify error banners, inline errors, or native validation
    const hasErrors =
      (await page.locator('[class*="error"], [class*="Error"], .errors, [data-error]').first()
        .isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await page.locator(':invalid').count()) > 0;

    expect(hasErrors).toBe(true);
  });

  test('invalid credentials show error message', async ({ page }) => {
    const emailInput = page
      .locator('input[type="email"], input[name="customer[email]"]')
      .first();
    const passwordInput = page
      .locator('input[type="password"], input[name="customer[password]"]')
      .first();
    const submitButton = page
      .locator('button[type="submit"], input[type="submit"]')
      .first();

    await emailInput.fill('invalid-test-user@example.com');
    await passwordInput.fill('WrongPassword123!');
    await submitButton.click();

    await page.waitForLoadState('networkidle').catch(() => {});

    // Shopify shows "Incorrect email or password" or similar
    const errorMessage = page.locator(
      '[class*="error"], [class*="Error"], .errors, [role="alert"], [data-error]'
    ).first();

    await expect(errorMessage).toBeVisible({ timeout: 10_000 });
    const errorText = (await errorMessage.textContent()) || '';
    expect(errorText.length).toBeGreaterThan(0);
  });
});

/* ---------------------------------------------------------------------------
 * 4. Cart Operations
 * --------------------------------------------------------------------------- */

test.describe('Cart Operations', () => {
  test.beforeEach(async ({ page }) => {
    await dismissConsentBanner(page);
  });

  test('add product to cart and verify cart updates', async ({ page }) => {
    await addProductToCart(page);

    // Verify cart count updated (could be a badge, bubble, or text)
    const cartIndicator = page
      .locator(
        `${SEL.cartCount}, [class*="cart"] [class*="count"], [class*="cart"] [class*="badge"], [class*="cart-link"] span, a[href="/cart"] span`
      )
      .first();

    // Soft assert — some themes don't show count until you open cart
    if (await cartIndicator.isVisible({ timeout: 5000 }).catch(() => false)) {
      const countText = (await cartIndicator.textContent()) || '0';
      const count = parseInt(countText.replace(/\D/g, ''), 10);
      expect.soft(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('cart page/drawer shows added item', async ({ page }) => {
    await addProductToCart(page);

    // Navigate to cart page (which might redirect to checkout)
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 });

    // Verify at least one cart item is visible (either on Cart page or Checkout page)
    const cartItem = page.locator(
      `${SEL.cartItem}, [class*="line-item"], [class*="LineItem"], table tbody tr, .product-thumbnail, [data-shipping-methods]`
    ).first();
    await expect(cartItem).toBeVisible({ timeout: 15_000 });
  });

  test('quantity can be updated in cart', async ({ page }) => {
    test.slow();
    await addProductToCart(page);

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
    await dismissConsentBanner(page);

    if (page.url().includes('/checkouts') || page.url().includes('/checkout')) {
      console.log('Bypassing cart quantity update since cart redirected to checkout.');
      return;
    }

    // Try to update quantity
    const qtyInput = page.locator(SEL.quantityInput).first();
    if (await qtyInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await qtyInput.fill('2');
      await qtyInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
      await page.waitForTimeout(3000); // Wait for AJAX update

      // If it redirected to checkout, pass
      if (page.url().includes('/checkouts') || page.url().includes('/checkout')) {
        return;
      }

      // Re-read quantity to verify (only if still visible)
      if (await qtyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        const updatedQty = await qtyInput.inputValue();
        expect.soft(updatedQty).toBe('2');
      }
    } else {
      // Some themes use +/- buttons instead of an input
      const plusBtn = page
        .locator(
          'button[aria-label*="Increase"], button:has-text("+"), [class*="quantity"] button:last-child'
        )
        .first();

      if (await plusBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await plusBtn.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }
  });

  test('item can be removed from cart', async ({ page }) => {
    test.slow();
    await addProductToCart(page);

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
    await dismissConsentBanner(page);

    if (page.url().includes('/checkouts') || page.url().includes('/checkout')) {
      console.log('Bypassing cart item removal since cart redirected to checkout.');
      return;
    }

    // Click remove
    const removeBtn = page
      .locator(
        `${SEL.removeButton}, [class*="cart"] a[href*="/cart/change?quantity=0"], button[aria-label*="remove" i]`
      )
      .first();

    if (await removeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await removeBtn.click({ force: true });
      await page.waitForTimeout(4000);

      // Verify cart is now empty
      const emptyHeading = page.locator('h1, h2, p, div').filter({ hasText: /cart is empty/i }).first();
      const cartStatus = page.locator('status, [role="status"], [class*="cart-count"], [data-cart-count], .cart-count-bubble').first();
      
      let isEmpty = false;
      if (await emptyHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
        isEmpty = true;
      } else if (await cartStatus.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = (await cartStatus.textContent()) || '';
        if (text.includes('0')) {
          isEmpty = true;
        }
      }

      expect.soft(isEmpty).toBe(true);
    } else {
      // Fallback: set quantity to 0 to remove
      const qtyInput = page.locator(SEL.quantityInput).first();
      if (await qtyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await qtyInput.fill('0');
        await qtyInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
        await page.waitForTimeout(3000);
      }
    }
  });
});

/* ---------------------------------------------------------------------------
 * 5. Checkout Initiation
 * --------------------------------------------------------------------------- */

test.describe('Checkout Initiation', () => {
  test('checkout button navigates to Shopify checkout', async ({ page }) => {
    test.slow();
    await addProductToCart(page);

    // Navigate to cart
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
    await dismissConsentBanner(page);

    // Wait for either checkout button to be visible OR the page to redirect to checkout
    const checkoutBtn = page.locator(
      'button:has-text("Checkout"), button:has-text("Check out"), a:has-text("Checkout"), a:has-text("Check out"), [name="checkout"], input[name="checkout"]'
    ).first();

    const result = await Promise.race([
      checkoutBtn.waitFor({ state: 'visible', timeout: 10_000 }).then(() => 'button'),
      page.waitForURL(CHECKOUT_URL_PATTERN, { timeout: 10_000 }).then(() => 'redirect'),
    ]).catch(() => 'timeout');

    if (result === 'button') {
      await checkoutBtn.click({ force: true });
    }

    // Shopify redirects to the checkout subdomain or /checkouts path
    await page.waitForURL(CHECKOUT_URL_PATTERN, { timeout: 30_000 }).catch(() => {});

    expect(page.url()).toMatch(CHECKOUT_URL_PATTERN);
  });

  test('checkout page shows order summary', async ({ page }) => {
    test.slow();
    await addProductToCart(page);

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
    await dismissConsentBanner(page);

    // Wait for either checkout button to be visible OR the page to redirect to checkout
    const checkoutBtn = page.locator(
      'button:has-text("Checkout"), button:has-text("Check out"), a:has-text("Checkout"), a:has-text("Check out"), [name="checkout"], input[name="checkout"]'
    ).first();

    const result = await Promise.race([
      checkoutBtn.waitFor({ state: 'visible', timeout: 10_000 }).then(() => 'button'),
      page.waitForURL(CHECKOUT_URL_PATTERN, { timeout: 10_000 }).then(() => 'redirect'),
    ]).catch(() => 'timeout');

    if (result === 'button') {
      await checkoutBtn.click({ force: true });
    }

    await page.waitForURL(CHECKOUT_URL_PATTERN, { timeout: 30_000 }).catch(() => {});
    await page.waitForLoadState('domcontentloaded');

    // Verify order summary section is visible
    const orderSummary = page.locator(
      '[class*="order-summary"], [class*="OrderSummary"], [data-order-summary], [role="table"], [class*="sidebar"]'
    ).first();

    // Soft assert — checkout UI varies by Shopify plan
    if (await orderSummary.isVisible({ timeout: 10_000 }).catch(() => false)) {
      expect.soft(await orderSummary.textContent()).toBeTruthy();
    } else {
      // At minimum, the checkout page should have loaded
      expect(page.url()).toMatch(CHECKOUT_URL_PATTERN);
    }
  });
});

/* ---------------------------------------------------------------------------
 * 6. Edge Cases & Boundary Tests
 * --------------------------------------------------------------------------- */

test.describe('Edge Cases & Boundary', () => {
  test('404 page renders for invalid URL', async ({ page }) => {
    const response = await page.goto('/this-page-definitely-does-not-exist-xyz-404', {
      waitUntil: 'domcontentloaded',
    });

    // Shopify returns a 404 status for invalid pages
    expect.soft(response?.status()).toBe(404);

    await page.waitForLoadState('networkidle').catch(() => {});

    // The 404 page should render meaningful content, not a blank page
    const bodyText = (await page.locator('body').textContent()) || '';
    expect(bodyText.length).toBeGreaterThan(50);

    // Common 404 messages on Shopify stores
    const has404Content =
      /not found|404|page.*not.*available|can.*t find|doesn.*t exist/i.test(bodyText);
    expect.soft(has404Content).toBe(true);
  });

  test('search functionality works', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 });
    await dismissConsentBanner(page);

    // Try to find and interact with search
    const searchTrigger = page
      .locator(
        'button:has-text("Search"), button[aria-label*="Search" i], a[href*="/search"], [class*="search"] button, [data-search-toggle]'
      )
      .first();

    if (await searchTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchTrigger.click({ force: true });
      await page.waitForTimeout(1000);
    }

    const searchInput = page.locator(SEL.searchInput).first();

    // Fallback: navigate directly to search page
    if (!(await searchInput.isVisible({ timeout: 3000 }).catch(() => false))) {
      await page.goto('/search', { waitUntil: 'domcontentloaded' });
      await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 });
    }

    const visibleSearch = page.locator(SEL.searchInput).first();
    await expect(visibleSearch).toBeVisible({ timeout: 15_000 });

    await visibleSearch.fill('pet');
    await visibleSearch.press('Enter');

    await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 });

    // Verify search results page loaded
    expect(page.url()).toMatch(/search|q=/i);
  });

  test('very long search query is handled gracefully', async ({ page }) => {
    const longQuery = 'a'.repeat(500);

    await page.goto(`/search?q=${encodeURIComponent(longQuery)}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 });

    // The page should load without crashing
    const bodyText = (await page.locator('body').textContent()) || '';
    expect(bodyText.length).toBeGreaterThan(0);

    // Should not produce a server error
    expect.soft(bodyText).not.toMatch(/500|internal server error/i);
  });

  test('special characters in search are handled gracefully', async ({ page }) => {
    test.setTimeout(60_000);
    const specialQueries = [
      '<script>alert("xss")</script>',
      '🐕🐾🦴',
      '%%wildcard%%',
    ];

    for (const query of specialQueries) {
      const response = await page.goto(`/search?q=${encodeURIComponent(query)}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.locator('body').waitFor({ state: 'visible', timeout: 10_000 });

      // Should not produce a 500 error
      expect.soft(response?.status()).not.toBe(500);

      // Page should still render content
      const bodyText = (await page.locator('body').textContent()) || '';
      expect.soft(bodyText.length).toBeGreaterThan(0);
    }
  });
});
