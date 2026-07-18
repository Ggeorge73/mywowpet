// @ts-check
const { test, expect } = require('@playwright/test');

const mobileProjects = new Set(['Mobile Safari', 'Mobile Chrome']);

test.describe('Mobile account registration', () => {
  test.setTimeout(60_000);

  test('new users can create an account from the mobile viewport', async ({ page }, testInfo) => {
    test.skip(
      !mobileProjects.has(testInfo.project.name),
      'Registration mobile coverage runs on iOS Safari and Android Chrome projects.'
    );

    await page.route('https://www.gstatic.com/firebasejs/**', route => route.abort());
    await page.addInitScript(() => {
      window.WOWPET_SECURITY = {
        isProductionLike: false,
        allowMockAuth: true
      };
    });

    const runId = Date.now().toString(36);
    const email = `mobile-${testInfo.project.name.toLowerCase().replace(/\W+/g, '-')}-${runId}@example.com`;
    const fullName = `Mobile Tester ${testInfo.project.name}`;

    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.locator('#nav-profile-slot')).toBeAttached({ timeout: 15_000 });
    await expect(page.locator('#auth-modal')).toBeAttached({ timeout: 20_000 });
    await expect(page.locator('#nav-profile-slot .nav-action-btn')).toHaveAttribute('href', '#', { timeout: 20_000 });

    await page.locator('#nav-profile-slot .nav-action-btn').click();
    await expect(page.locator('#auth-modal')).toHaveClass(/open/, { timeout: 10_000 });

    await page.locator('#tab-signup').click();
    await expect(page.locator('#form-signup')).toHaveClass(/active/);

    await page.locator('#signup-name').fill(fullName);
    await page.locator('#signup-email').fill(email);
    await page.locator('#signup-password').fill(`PawPass-${runId}`);
    await page.locator('#btn-signup-submit').click();

    await expect(page.locator('#auth-modal')).not.toHaveClass(/open/, { timeout: 20_000 });
    await expect(page.locator('#auth-error')).not.toHaveClass(/show/);

    await expect.poll(() => {
      return page.evaluate(() => {
        const mockUser = localStorage.getItem('wow_mock_auth_user') || localStorage.getItem('wow_mock_user');
        return mockUser ? JSON.parse(mockUser).email : null;
      });
    }, { timeout: 10_000 }).toBe(email);

    await expect(page.locator('#nav-user-name')).toHaveText(fullName, { timeout: 10_000 });
  });
});
