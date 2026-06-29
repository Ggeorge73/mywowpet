# My Wow Pet Launch Readiness Checklist

This checklist protects the store by enforcing one production payment path: Shopify Checkout.

## Shopify checkout readiness

- [x] Confirm every shoppable product has the correct Shopify product/variant mapping for Storefront API cart creation.
- [x] Confirm product pages use the custom storefront UI and add Shopify-mapped variants to the saved cart.
- [x] Confirm the saved cart creates a Shopify cart through Storefront API.
- [x] Confirm the Shopify cart `checkoutUrl` routes to Shopify Checkout.
- [ ] Confirm Shopify Payments/Shopify Pay, taxes, shipping, fulfillment, and order notifications are configured inside Shopify Admin.
- [ ] Confirm successful paid orders appear in Shopify Admin and are not duplicated in the local app cart/order history.

## Custom checkout retirement

- [x] Remove the custom cart's direct route to `checkout.html`.
- [x] Replace the old custom checkout page with Shopify-only guidance.
- [x] Remove card collection from the active site checkout path.
- [x] Search the site before launch to confirm no active CTA still says `Place Order` outside Shopify.
- [x] Confirm no real customer is asked to enter card data anywhere except Shopify Checkout.

## App/backend readiness

- [ ] Configure real Firebase web app credentials outside source-controlled placeholder values, if Firebase will support profiles, reviews, loyalty, or saved carts.
- [ ] Review and deploy Firestore security rules for users, reviews, loyalty, pets, saved carts, and subscriptions.
- [ ] Confirm mock auth/localStorage fallback cannot be mistaken for production authentication.
- [ ] Decide whether the local cart remains as a saved-cart/wishlist feature or should be removed entirely.
- [ ] Add production monitoring for failed Shopify checkout handoffs, failed Firebase writes, and JavaScript errors.

## Notes

The production payment path should be Shopify only. The custom checkout page is now a legacy fallback page and should not process or simulate payment.
