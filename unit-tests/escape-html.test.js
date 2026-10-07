import { describe, it, expect } from 'vitest';
import { loadStore } from './helpers/load-store.js';

const WowStore = loadStore();
const { escapeHTML } = WowStore;

describe('escapeHTML', () => {
  it('escapes every HTML-significant character', () => {
    expect(escapeHTML(`&<>"'\``)).toBe('&amp;&lt;&gt;&quot;&#39;&#96;');
  });

  it('neutralises an onerror payload from a URL param', () => {
    const payload = '<img src=x onerror=window.__xss=1>';
    expect(escapeHTML(payload)).toBe('&lt;img src=x onerror=window.__xss=1&gt;');
  });

  it('cannot break out of a quoted attribute', () => {
    const out = escapeHTML(`dog' onclick='alert(1)`);
    expect(out).not.toContain("'");
    expect(out).toBe('dog&#39; onclick=&#39;alert(1)');
  });

  it('round-trips as literal text when parsed as HTML', () => {
    const payload = '<script>window.__xss=1</script> & "pets"';
    const div = window.document.createElement('div');
    div.innerHTML = `<span title="${escapeHTML(payload)}">${escapeHTML(payload)}</span>`;
    const span = div.firstElementChild;
    expect(div.querySelector('script')).toBeNull();
    expect(span.textContent).toBe(payload);
    expect(span.getAttribute('title')).toBe(payload);
  });

  it('leaves safe text unchanged, including emoji', () => {
    expect(escapeHTML('Golden Retriever 🐕')).toBe('Golden Retriever 🐕');
  });

  it('stringifies non-strings and maps null/undefined to an empty string', () => {
    expect(escapeHTML(42)).toBe('42');
    expect(escapeHTML(false)).toBe('false');
    expect(escapeHTML(null)).toBe('');
    expect(escapeHTML(undefined)).toBe('');
  });

  it('escapes ampersands first so existing entities are not double-decoded', () => {
    expect(escapeHTML('&lt;b&gt;')).toBe('&amp;lt;b&amp;gt;');
  });
});
