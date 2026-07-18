// @ts-check
const { test, expect } = require('@playwright/test');

async function suppressInstallPrompt(page) {
  await page.addInitScript(() => {
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem('wow_install_dismissed_until', String(dismissedUntil));
    window.sessionStorage.setItem('wow_install_prompt_seen_session', '1');
  });
}

test.describe('Support chatbot', () => {
  test.beforeEach(async ({ page }) => {
    await suppressInstallPrompt(page);
    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.locator('.wow-chat-launcher')).toBeVisible({ timeout: 15_000 });
  });

  test('answers product questions from the store catalog', async ({ page }) => {
    await page.locator('.wow-chat-launcher').click();
    await expect(page.locator('.wow-chat-panel')).toBeVisible();

    await page.locator('#wow-chat-input').fill('Recommend grain-free food for my dog');
    await page.locator('.wow-chat-form button').click();

    const latestBotMessage = page.locator('.wow-chat-message.bot').last();
    await expect(latestBotMessage).toContainText('Wilderness Grain-Free Salmon Recipe', { timeout: 10_000 });
    await expect(page.locator('.wow-chat-product')).toHaveCount(3);
    await expect(page.locator('.wow-chat-links a', { hasText: 'Shop all' })).toBeVisible();
  });

  test('offers email handoff when the answer is outside store knowledge', async ({ page }) => {
    await page.locator('.wow-chat-launcher').click();
    await expect(page.locator('.wow-chat-panel')).toBeVisible();

    await page.locator('#wow-chat-input').fill('Can you answer a custom wholesale partnership contract question?');
    await page.locator('.wow-chat-form button').click();

    await expect(page.locator('.wow-chat-handoff')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.wow-chat-handoff')).toContainText('Send this to support');
    await expect(page.locator('.wow-chat-handoff input[type="email"]')).toBeVisible();
  });
});
