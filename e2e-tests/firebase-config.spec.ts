// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Firebase client config', () => {
  test('initializes real Firebase services when SDK assets load', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('wow_install_prompt_seen_session', '1');
    });

    await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.firebase = {
          apps: [],
          initializeApp(config) {
            window.__firebaseConfig = config;
            this.apps.push({});
          }
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
        window.firebase.firestore = () => ({});
        window.firebase.firestore.FieldValue = { serverTimestamp: () => 'server-time' };
      `
    }));

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#auth-modal')).toBeAttached({ timeout: 20_000 });

    await page.waitForFunction(() => {
      return window.WowFirebase && typeof window.WowFirebase.isMockMode === 'function';
    }, null, { timeout: 20_000 });

    await expect.poll(() => page.evaluate(() => window.WowFirebase.isMockMode()), {
      timeout: 10_000
    }).toBe(false);

    await expect.poll(() => page.evaluate(() => window.__firebaseConfig)).toMatchObject({
      apiKey: 'AIzaSyDjG3ymeHrdajvn7N0L7wZAv5onhgxKpdU',
      authDomain: 'wow-pet-store.firebaseapp.com',
      projectId: 'wow-pet-store'
    });
  });
});
