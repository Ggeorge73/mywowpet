// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration for Shopify Storefront E2E Tests
 *
 * Environment Variables:
 *   STOREFRONT_URL  – Base URL of the storefront (default: https://mywowpet.com)
 *   CI              – Set to "true" in CI pipelines to enable retries & JUnit output
 */

const isCI = !!process.env.CI;

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',

  /* Maximum time one test can run */
  timeout: 30_000,

  /* Shared settings for all projects */
  expect: {
    timeout: 10_000,
  },

  /* Run tests in parallel in CI, serial locally for easier debugging */
  fullyParallel: true,
  workers: isCI ? 2 : 1,

  /* Fail the build on CI if test.only is left in source */
  forbidOnly: isCI,

  /* Retry flaky tests in CI */
  retries: isCI ? 2 : 0,

  /* Reporters */
  reporter: isCI
    ? [
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit-results.xml' }],
        ['list'],
      ]
    : [
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
        ['list'],
      ],

  /* Shared settings applied to every project */
  use: {
    baseURL: process.env.STOREFRONT_URL || 'https://mywowpet.com',

    /* Collect trace on first retry for easier debugging */
    trace: 'on-first-retry',

    /* Screenshot on failure only */
    screenshot: 'only-on-failure',

    /* Record video on first retry */
    video: 'on-first-retry',

    /* Navigation / action timeouts */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    /* Extra HTTP headers (avoid bot detection) */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },

    /* Bypass cookie banners / consent walls where possible */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for cross-browser coverage */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  /*
   * Web server config — commented out because we are testing a live site.
   * Uncomment and adjust if running against a local dev server.
   *
   * webServer: {
   *   command: 'npm run dev',
   *   url: 'http://localhost:3000',
   *   reuseExistingServer: !isCI,
   *   timeout: 120_000,
   * },
   */
});
