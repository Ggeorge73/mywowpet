// @ts-check
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test.describe('Coming-soon early access', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/index.html', route => {
      const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')
        .replace(/\s+integrity="[^"]+"/g, '')
        .replace(/\s+crossorigin="anonymous"/g, '');
      return route.fulfill({ contentType: 'text/html', body: html });
    });

    await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.__launchSignup = null;
        window.firebase = {
          apps: [],
          initializeApp(config) {
            window.__firebaseConfig = config;
            this.apps.push({});
          }
        };
      `
    }));

    await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.firebase.firestore = () => ({
          collection(name) {
            return {
              doc(id) {
                return {
                  async set(data) { window.__launchSignup = { name, id, data }; }
                };
              }
            };
          }
        });
        window.firebase.firestore.FieldValue = { serverTimestamp: () => 'server-time' };
      `
    }));

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('captures a consented early-access signup', async ({ page }) => {
    await page.locator('#signup-email').fill('Pet.Parent@Example.com');
    await page.locator('#pet-type').selectOption('dog-and-cat');
    await page.locator('#marketing-consent').check();
    await page.getByRole('button', { name: /save my spot/i }).click();

    await expect(page.locator('#form-status')).toContainText('You’re in the pack');

    const signup = await page.evaluate(() => window.__launchSignup);
    expect(signup).toMatchObject({
      name: 'launchSignups',
      data: {
        email: 'pet.parent@example.com',
        petType: 'dog-and-cat',
        consent: true,
        source: 'coming-soon',
        offer: 'launch-15',
        createdAt: 'server-time'
      }
    });
    expect(signup.id).toMatch(/^[a-f0-9]{64}$/);
  });

  test('requires marketing consent before saving', async ({ page }) => {
    await page.locator('#signup-email').fill('pet.parent@example.com');
    await page.getByRole('button', { name: /save my spot/i }).click();

    await expect(page.locator('#form-status')).toContainText('Please confirm');
    expect(await page.evaluate(() => window.__launchSignup)).toBeNull();
  });
});
