import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildHeaders, publicEntries } from '../scripts/build-site.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const firebaseConfig = JSON.parse(readFileSync(resolve(ROOT, 'firebase.json'), 'utf8'));

describe('Cloudflare Pages build', () => {
  it('publishes only the public site, never repo internals', () => {
    const entries = publicEntries(ROOT);
    expect(entries).toEqual(expect.arrayContaining(['index.html', 'shop.html', 'js', 'css', 'assets', 'sw.js']));
    for (const entry of entries) {
      expect(entry).not.toMatch(/\.(md|py|ts)$|^(docs|e2e-tests|unit-tests|scripts|node_modules)$|^package|^debug_|^test_/);
    }
  });

  it('carries the firebase.json security headers into _headers', () => {
    const headers = buildHeaders(firebaseConfig);
    const csp = firebaseConfig.hosting.headers
      .flatMap((rule) => rule.headers)
      .find((header) => header.key === 'Content-Security-Policy').value;
    expect(headers).toContain(`Content-Security-Policy: ${csp}`);
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).not.toContain('immutable');
  });

  it('detaches the default Cache-Control before overriding it', () => {
    const blocks = buildHeaders(firebaseConfig).split('\n\n');
    for (const block of blocks.slice(1)) {
      expect(block).toMatch(/! Cache-Control\n\s+Cache-Control: /);
    }
  });
});
