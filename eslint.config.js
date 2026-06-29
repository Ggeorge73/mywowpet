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
    ignores: [
      "node_modules/",
      "playwright-report/",
      "test-results/",
      "sw.js",
    ],
  },
];
