import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Guards firebase.json against two launch blockers: shipping repo internals with
// `"public": "."` (B4) and pinning unhashed js/css/sw.js with a 1-year immutable
// cache (B1).

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(path.resolve(here, '../firebase.json'), 'utf8'));
const hosting = config.hosting;

// Minimal glob -> RegExp covering the syntax firebase.json uses:
// `**/`, `**`, `*`, `?` and the `@(a|b)` extglob. Paths are relative to the
// public dir with no leading slash.
function globToRegExp(glob) {
  let src = '';
  let i = 0;
  const g = glob.replace(/^\//, '');
  while (i < g.length) {
    if (g.startsWith('**/', i)) { src += '(?:.*/)?'; i += 3; continue; }
    if (g.startsWith('**', i)) { src += '.*'; i += 2; continue; }
    if (g.startsWith('@(', i)) {
      const end = g.indexOf(')', i);
      const alts = g.slice(i + 2, end).split('|').map((a) => a.replace(/[.+^${}()[\]\\]/g, '\\$&'));
      src += `(?:${alts.join('|')})`;
      i = end + 1;
      continue;
    }
    const ch = g[i];
    if (ch === '*') src += '[^/]*';
    else if (ch === '?') src += '[^/]';
    else src += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    i += 1;
  }
  return new RegExp(`^${src}$`);
}

// A file is skipped when it or any parent directory matches an ignore pattern
// (an ignored directory is never walked).
function isIgnored(file) {
  const parts = file.split('/');
  const candidates = parts.map((_, i) => parts.slice(0, i + 1).join('/'));
  return hosting.ignore.some((pattern) => {
    const re = globToRegExp(pattern);
    return candidates.some((candidate) => re.test(candidate));
  });
}

function cacheControlFor(path) {
  let value;
  for (const rule of hosting.headers) {
    if (!globToRegExp(rule.source).test(path)) continue;
    const header = rule.headers.find((h) => h.key.toLowerCase() === 'cache-control');
    if (header) value = header.value; // last matching rule wins
  }
  return value;
}

describe('firebase hosting: files that must not be public', () => {
  it.each([
    'README.md',
    'CICD_README.md',
    'DevSecOps_Runbook.md',
    'MYWOWPET_TECH_BOOK.md',
    'docs/security-hardening-checklist.md',
    'docs/csp-hardening-todo.md',
    'e2e-tests/checkout.spec.ts',
    'unit-tests/hosting-config.test.js',
    'test-results/run/trace.zip',
    'playwright-report/index.html',
    'results.xml',
    'debug_runner.py',
    'smoke_test_runner.py',
    'debug_shopify_checkout.js',
    'dump_add_to_cart_buttons.js',
    'test_site.js',
    'test_account_url.js',
    'package.json',
    'package-lock.json',
    'eslint.config.js',
    'vitest.config.js',
    'playwright.config.ts',
    'pw.local.config.ts',
    'serve.json',
    'firestore.rules',
    'firebase.json',
    '.github/workflows/ci.yml',
    'node_modules/vitest/package.json',
  ])('ignores %s', (path) => {
    expect(isIgnored(path)).toBe(true);
  });

  it.each([
    'index.html',
    'shop.html',
    '404.html',
    'sw.js',
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
    'js/app.js',
    'css/base.css',
    'assets/images/hero.jpg',
  ])('still serves %s', (path) => {
    expect(isIgnored(path)).toBe(false);
  });
});

describe('firebase hosting: cache headers', () => {
  it('never marks any rule immutable while file names are unhashed', () => {
    const values = hosting.headers
      .flatMap((rule) => rule.headers)
      .filter((h) => h.key.toLowerCase() === 'cache-control')
      .map((h) => h.value);
    for (const value of values) expect(value).not.toMatch(/immutable/);
  });

  it('serves sw.js with no-cache', () => {
    expect(cacheControlFor('sw.js')).toBe('no-cache');
  });

  it.each(['js/app.js', 'js/store.js', 'css/base.css', 'manifest.json'])(
    'makes browsers revalidate %s',
    (path) => {
      const value = cacheControlFor(path);
      expect(value).toBeDefined();
      expect(value).toMatch(/no-cache|max-age=0/);
    },
  );

  it.each(['index.html', 'shop', 'product'])('serves HTML route %s with no-cache', (path) => {
    expect(cacheControlFor(path)).toBe('no-cache');
  });

  it('lets images keep a bounded max-age', () => {
    expect(cacheControlFor('assets/images/hero.jpg')).toBe('public, max-age=604800');
  });
});
