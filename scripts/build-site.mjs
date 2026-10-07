#!/usr/bin/env node
// Builds the deployable static site into dist/ for Cloudflare Pages.
//
// Cloudflare Pages has no ignore list (unlike firebase.json), so publishing the
// repo root would expose docs, tests, runbooks and tooling. This copies only
// the public allowlist below and writes a Cloudflare `_headers` file whose
// security headers come from firebase.json, so both hosts share one CSP.
//
// Cloudflare Pages settings: build command `npm run build`, output dir `dist`.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');

export const PUBLIC_DIRS = ['assets', 'css', 'js'];
export const PUBLIC_FILES = ['manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml'];

export function publicEntries(root = ROOT) {
  const html = readdirSync(root).filter((name) => name.endsWith('.html'));
  return [...html, ...PUBLIC_FILES, ...PUBLIC_DIRS].filter((name) => existsSync(join(root, name)));
}

export function buildHeaders(firebaseConfig) {
  const securityRule = firebaseConfig.hosting.headers.find((rule) =>
    rule.headers.some((header) => header.key === 'Content-Security-Policy')
  );
  if (!securityRule) throw new Error('firebase.json has no Content-Security-Policy rule');

  const security = securityRule.headers.map((header) => `  ${header.key}: ${header.value}`);
  // Cloudflare merges every matching rule, so later rules detach ("! Header")
  // the default Cache-Control before setting their own.
  return [
    '/*',
    ...security,
    '  Cache-Control: no-cache',
    '',
    '/assets/*',
    '  ! Cache-Control',
    '  Cache-Control: public, max-age=604800',
    '',
    ...['/css/*', '/js/*', '/manifest.json'].flatMap((path) => [
      path,
      '  ! Cache-Control',
      '  Cache-Control: public, max-age=0, must-revalidate',
      '',
    ]),
  ].join('\n');
}

function build() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT);
  for (const entry of publicEntries()) {
    cpSync(join(ROOT, entry), join(OUT, entry), { recursive: true });
  }
  const firebaseConfig = JSON.parse(readFileSync(join(ROOT, 'firebase.json'), 'utf8'));
  writeFileSync(join(OUT, '_headers'), buildHeaders(firebaseConfig));
  console.log(`Built ${publicEntries().length} entries into dist/`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build();
}
