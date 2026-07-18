// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Production auth guard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('wow_install_prompt_seen_session', '1');
    });
  });

  test('uses the real Google identity and stores its profile metadata', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Google identity coverage runs on desktop Chromium.');

    await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.__googleAuthCalls = [];
        window.__savedGoogleUser = null;
        window.__authStub = {
          currentUser: null,
          onAuthStateChanged(callback) {
            this.authCallback = callback;
            callback(null);
          },
          async signInWithPopup(provider) {
            const user = {
              uid: 'google-real-123',
              email: 'real.pet.parent@gmail.com',
              displayName: 'Real Pet Parent',
              photoURL: 'https://example.com/google-avatar.jpg',
              providerData: [{ providerId: 'google.com' }]
            };
            window.__googleAuthCalls.push({
              providerId: provider.providerId,
              scopes: provider.scopes,
              customParameters: provider.customParameters
            });
            this.currentUser = user;
            await this.authCallback(user);
            return { user, additionalUserInfo: { isNewUser: true } };
          }
        };
        window.__dbStub = {
          collection() {
            return {
              doc() {
                return {
                  get: async () => ({ exists: false }),
                  set: async data => { window.__savedGoogleUser = data; }
                };
              }
            };
          }
        };
        window.firebase = {
          apps: [],
          initializeApp() { this.apps.push({}); }
        };
      `
    }));

    await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.firebase.auth = () => window.__authStub;
        window.firebase.auth.GoogleAuthProvider = function GoogleAuthProvider() {
          this.providerId = 'google.com';
          this.scopes = [];
          this.customParameters = {};
          this.addScope = scope => this.scopes.push(scope);
          this.setCustomParameters = parameters => { this.customParameters = parameters; };
        };
        window.firebase.auth.FacebookAuthProvider = function FacebookAuthProvider() {};
        window.firebase.auth.OAuthProvider = function OAuthProvider() {};
      `
    }));

    await page.route('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.firebase.firestore = () => window.__dbStub;
        window.firebase.firestore.FieldValue = { serverTimestamp: () => 'server-time' };
      `
    }));

    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WowFirebase?.isMockMode?.() === false, null, { timeout: 20_000 });

    await page.locator('#nav-profile-slot .nav-action-btn').click();
    await expect(page.locator('#auth-modal')).toHaveClass(/open/);
    await page.locator('.auth-social-btn.google').click();

    await expect(page.locator('#nav-user-name')).toHaveText('Real Pet Parent', { timeout: 10_000 });
    await expect(page.locator('#auth-modal')).not.toHaveClass(/open/);

    const captured = await page.evaluate(() => ({
      authCalls: window.__googleAuthCalls,
      savedUser: window.__savedGoogleUser,
      profile: JSON.parse(localStorage.getItem('wow_profile_info') || 'null'),
      fakeMockUser: localStorage.getItem('wow_mock_user')
    }));

    expect(captured.authCalls).toEqual([{
      providerId: 'google.com',
      scopes: ['email', 'profile'],
      customParameters: { prompt: 'select_account' }
    }]);
    expect(captured.savedUser).toMatchObject({
      uid: 'google-real-123',
      email: 'real.pet.parent@gmail.com',
      profile: {
        name: 'Real Pet Parent',
        photoURL: 'https://example.com/google-avatar.jpg',
        provider: 'google.com'
      }
    });
    expect(captured.profile).toMatchObject({
      name: 'Real Pet Parent',
      photoURL: 'https://example.com/google-avatar.jpg',
      provider: 'google.com'
    });
    expect(captured.fakeMockUser).toBeNull();
  });

  test('does not create a mock Google account when mock auth is disabled', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Production guard coverage runs on desktop Chromium.');

    await page.route('https://www.gstatic.com/firebasejs/**', route => route.abort());

    await page.addInitScript(() => {
      Object.defineProperty(window, 'WOWPET_SECURITY', {
        value: Object.freeze({ isProductionLike: true, allowMockAuth: false }),
        configurable: true
      });
    });

    await page.goto('/shop.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#auth-modal')).toBeAttached({ timeout: 20_000 });

    await page.waitForFunction(() => {
      return window.WowFirebase && typeof window.WowFirebase.signInWithGoogle === 'function';
    }, null, { timeout: 20_000 });

    await page.locator('#nav-profile-slot .nav-action-btn').click();
    await expect(page.locator('#auth-modal')).toHaveClass(/open/, { timeout: 10_000 });

    await page.locator('.auth-social-btn.google').click();

    await expect(page.locator('#auth-error')).toHaveClass(/show/, { timeout: 10_000 });
    await expect(page.locator('#auth-error-text')).toHaveText(/temporarily unavailable/i);
    await expect(page.locator('#auth-modal')).toHaveClass(/open/);

    await expect.poll(() => page.evaluate(() => ({
      mockAuthUser: localStorage.getItem('wow_mock_auth_user'),
      mockUser: localStorage.getItem('wow_mock_user'),
      mockDatabase: localStorage.getItem('wow_mock_database')
    }))).toEqual({
      mockAuthUser: null,
      mockUser: null,
      mockDatabase: null
    });
  });

  test('does not create a mock Google account when Firebase social auth is unavailable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Auth fallback coverage runs on desktop Chromium.');

    await page.route('https://www.gstatic.com/firebasejs/**', route => route.abort());

    await page.goto('/shop.html?devAuth=true', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#auth-modal')).toBeAttached({ timeout: 20_000 });

    await page.waitForFunction(() => {
      return window.WowFirebase && typeof window.WowFirebase.signInWithGoogle === 'function';
    }, null, { timeout: 20_000 });

    await page.locator('#nav-profile-slot .nav-action-btn').click();
    await expect(page.locator('#auth-modal')).toHaveClass(/open/, { timeout: 10_000 });

    await page.locator('.auth-social-btn.google').click();

    await expect(page.locator('#auth-error')).toHaveClass(/show/, { timeout: 10_000 });
    await expect(page.locator('#auth-error-text')).toHaveText(/temporarily unavailable/i);
    await expect(page.locator('#auth-modal')).toHaveClass(/open/);

    await expect.poll(() => page.evaluate(() => ({
      mockAuthUser: localStorage.getItem('wow_mock_auth_user'),
      mockUser: localStorage.getItem('wow_mock_user'),
      mockDatabase: localStorage.getItem('wow_mock_database')
    }))).toEqual({
      mockAuthUser: null,
      mockUser: null,
      mockDatabase: null
    });
  });
});
