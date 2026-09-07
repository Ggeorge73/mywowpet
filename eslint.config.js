import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["e2e-tests/**/*.ts", "e2e-tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off", // Playwright globals handled by TS
    },
  },
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser APIs
        document: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        location: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        alert: "readonly",
        confirm: "readonly",
        URLSearchParams: "readonly",
        HTMLElement: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        FormData: "readonly",
        URL: "readonly",
        history: "readonly",
        IntersectionObserver: "readonly",
        MutationObserver: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        performance: "readonly",
        Image: "readonly",
        Audio: "readonly",
        // Cross-file app globals (loaded via separate <script> tags in HTML)
        WowStore: "writable",
        WowApp: "writable",
        WowFirebase: "writable",
        WowAnimations: "writable",
        WowQuickView: "writable",
        WowSocialProof: "writable",
        WowSpinWheel: "writable",
        WowStreak: "writable",
        WowFlashSale: "writable",
        SubscribePage: "writable",
        CartPage: "writable",
        PetCheckPage: "writable",
        CheckoutPage: "writable",
        ProductPage: "writable",
        ProfilePage: "writable",
        PetGame: "writable",
        // Firebase SDK globals
        firebase: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-empty": "warn",
      "no-redeclare": "off", // Cross-file globals are defined and referenced across <script> tags
    },
  },
  {
    files: ["unit-tests/**/*.js", "vitest.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Vitest globals, plus the jsdom environment the store module is loaded into.
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        window: "readonly",
        localStorage: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      // load-store.js evaluates js/store.js as a browser script on purpose; that is
      // the mechanism that lets the tests exercise the real module unmodified.
      "no-new-func": "off",
    },
  },
  {
    ignores: [
      "node_modules/",
      "playwright-report/",
      "test-results/",
      "sw.js",
    ],
  },
];
