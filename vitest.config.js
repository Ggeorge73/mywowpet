import { defineConfig } from 'vitest/config';

// Unit tests for the pure logic in js/. Anything needing a real browser stays in
// e2e-tests/ under Playwright — Vitest deliberately does not pick those up.
export default defineConfig({
  test: {
    include: ['unit-tests/**/*.test.js'],
    environment: 'jsdom',
    restoreMocks: true,
  },
});
