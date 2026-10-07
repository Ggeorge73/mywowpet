// js/contact.js is a browser script like js/store.js: evaluate it under jsdom and
// read the WowContact module it assigns to window. With no #contact-form in the
// document its init() is a no-op, so only the pure validation is exercised.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, '../../js/contact.js'), 'utf8');

export function loadContact() {
  new Function('window', 'document', source)(window, window.document);
  return window.WowContact;
}
