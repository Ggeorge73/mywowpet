# Launch cutover: coming-soon page to store home

Target launch: **Oct 30, 2026**. Eng review item **B5**.

Today `index.html` is the coming-soon / early-access page and the real store home
lives at `home.html` (restored from `d859ae0^:index.html` and updated to current
conventions: no fake ratings, social proof, flash sales, spin wheel, local
discounts or subscription pricing). Cutover is a single file swap plus the small
follow-ups below, done on a branch, rehearsed on a preview channel, then promoted.

Firebase project: `wow-pet-store` (see `.firebaserc`). Hosting serves the repo
root with `cleanUrls: true`, so `/home` already serves `home.html` today and
`/coming-soon` will serve `coming-soon.html` after the swap.

---

## 0. Before cutover day (pre-checks)

- [ ] `home.html` reviewed at `/home` on production or a preview channel.
- [ ] Shopify: storefront password removed / payments live; `WELCOME15` active.
- [ ] Feature flags in `js/store.js` (`FEATURES`) still match Shopify reality:
      `subscriptions` stays `false` until selling plans exist (MWP-16);
      `loyalty` stays `false` until rewards are redeemable at checkout.
- [ ] Shipping constants in `js/store.js` (`FREE_SHIPPING_THRESHOLD`,
      `SHIPPING_FLAT_RATE`) match the Shopify shipping rate. Static copy in
      `shipping.html`, `help.html` and `home.html` mentions $49 too.
- [ ] Launch-15 emails to the early-access list are drafted (separate task).

## 1. The swap (one commit)

```bash
git checkout -b launch/cutover
git mv index.html coming-soon.html   # keep the early-access page reachable
git mv home.html index.html          # store home becomes the root page
```

Then, in the same commit:

1. **`index.html` (new store home)**: remove the "Pre-launch this lives at
   /home.html" comment, add OG/Twitter meta (title, description, image), and a
   `<link rel="canonical" href="https://www.mywowpet.com/">`.
2. **`coming-soon.html`**: change the brand link `href="index.html"` to
   `href="coming-soon.html"` (or leave it pointing at the store home), and add
   `<meta name="robots" content="noindex">` so it does not compete with the home page.
3. **`manifest.json`**: set `"start_url": "./"` (or keep `"index.html"`, which
   is now the store), and replace the "almost here / early-access" `description`
   with store copy. In the new `index.html`, use `manifest.json` (drop the
   `?v=launch` query the coming-soon page used).
4. **`sw.js`**: bump `CACHE_NAME` (e.g. `mywowpet-v8` to `mywowpet-v9`) so clients
   drop the cached coming-soon shell. In `CORE_ASSETS`, replace `'home.html'` with
   `'coming-soon.html'`. The offline fallback (`index.html`) is now the store home.
5. **`subscribe.html`, `help.html`**: the autoship "Join the list" links use
   `mailto:support@mywowpet.com`. No change needed unless a real waitlist form exists.
6. **SEO**: add `robots.txt` and `sitemap.xml` (home, shop, product pages, help,
   shipping, returns, contact) if they are not there yet.

### E2E updates (same commit)

- `e2e-tests/coming-soon.spec.ts`: route `**/coming-soon.html` (not
  `**/index.html`), read `coming-soon.html` from disk, and `goto('/coming-soon.html')`.
- `e2e-tests/checkout.spec.ts`, "Landing Page Health": the brand, "Opening
  soon", "good stuff is almost here" and pet-portrait assertions describe the
  coming-soon page. Point them at `/coming-soon.html`, or rewrite them for the
  store home (`#featured-products` grid, hero "Shop Now" link).
- `e2e-tests/trust-guards.spec.ts`: change `/home.html` to `/index.html` (or `/`).

Run locally before pushing:

```bash
npm run lint
npm run test:unit
npx playwright test -c pw.local.config.ts   # local config, not committed
```

## 2. Rehearse on a preview channel

```bash
firebase hosting:channel:deploy launch-rehearsal --expires 7d
```

This prints a URL like `https://wow-pet-store--launch-rehearsal-<hash>.web.app`.
Against that URL:

- Run the E2E suite: `BASE_URL=<channel-url> npx playwright test`.
- Manually: `/` shows the store, `/coming-soon` shows the early-access page,
  add to cart, enter `WELCOME15` in the cart (the cart total must **not**
  change), proceed to Shopify checkout, and confirm Shopify applies 15% there.
- Install the PWA from the channel URL and confirm it opens on the store home.

## 3. Go live

Promote exactly what was rehearsed, without rebuilding:

```bash
firebase hosting:clone wow-pet-store:launch-rehearsal wow-pet-store:live
```

(Alternative: merge `launch/cutover` and run `firebase deploy --only hosting`.)

Before promoting, note the current live version ID from the Firebase console
(Hosting, Release history) so you can roll back to it.

## 4. Rollback

Any one of these restores the coming-soon home:

- **Console**: Firebase console, Hosting, Release history, pick the previous
  release, then **Roll back**.
- **CLI**: clone the previous version back to live:
  `firebase hosting:clone wow-pet-store@<PREVIOUS_VERSION_ID> wow-pet-store:live`
  (`firebase hosting:rollback` is not a command in current firebase-tools;
  check `firebase help hosting` for your CLI version.)
- **Redeploy**: `git checkout <pre-cutover-commit> && firebase deploy --only hosting`.

Because `CACHE_NAME` was bumped, returning visitors may still have the store
shell cached after a rollback. If you roll back, bump `CACHE_NAME` again in the
redeploy.

## 5. After launch

- Watch Shopify orders and the checkout handoff (`cartCreate`) error rate.
- Once real reviews come in they render automatically: stars appear only for
  products with customer reviews (`WowStore.getProductRating`).
- Flip `FEATURES.subscriptions` only after Shopify selling plans exist and each
  subscribable product has a `shopifySellingPlanId`. Flip `FEATURES.loyalty`
  only once points are redeemable at checkout.
