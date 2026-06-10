# CSP Hardening TODO

The current Firebase Hosting Content Security Policy allows `script-src 'unsafe-inline'` and `style-src 'unsafe-inline'` for compatibility with the existing static HTML and inline script/style patterns.

This is an intentional interim tradeoff, not the desired final security posture.

## Future hardening steps

- Move inline scripts into external JavaScript files where practical.
- Replace remaining inline scripts with CSP nonces or hashes.
- Move inline styles into CSS files where practical.
- Remove `script-src 'unsafe-inline'` after inline scripts are migrated.
- Remove or reduce `style-src 'unsafe-inline'` after inline styles are migrated.
- Test Shopify Buy Button, Firebase auth, product pages, cart, and profile pages after tightening CSP.
