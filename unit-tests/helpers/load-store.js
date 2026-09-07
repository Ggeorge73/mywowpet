// js/store.js is a browser script, not a module: it builds an IIFE and assigns the
// result to window.WowStore. Evaluating it under jsdom therefore gives us the real
// module with no source changes and no logic duplicated into the tests.
//
// The module holds no state of its own beyond localStorage, so one load per file is
// enough; tests reset storage between cases rather than re-evaluating the script.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, '../../js/store.js'), 'utf8');

export function loadStore() {
  // Pass the browser globals store.js closes over explicitly rather than relying on
  // them being ambient, so the helper does not depend on the test environment's
  // global wiring.
  new Function('window', 'localStorage', 'document', source)(
    window,
    window.localStorage,
    window.document,
  );
  return window.WowStore;
}
