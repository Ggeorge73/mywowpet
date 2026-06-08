# My Wow Pet Launch Readiness Checklist

This checklist protects the store from looking production-ready before real commerce infrastructure is connected.

## Must complete before public launch

- [ ] Replace demo checkout with a PCI-compliant payment provider such as Shopify Checkout, Stripe Checkout, PayPal, or another approved processor.
- [ ] Remove or clearly disable demo card fields before accepting real customers.
- [ ] Configure real Firebase web app credentials outside source-controlled placeholder values.
- [ ] Review and deploy Firestore security rules for users, orders, reviews, loyalty, pets, carts, and subscriptions.
- [ ] Confirm guest orders include a reliable customer email, shipping address, payment status, and fulfillment status.
- [ ] Confirm tax and shipping calculations are production-ready.
- [ ] Confirm orders cannot be marked paid unless the payment provider returns a successful authorization/capture.
- [ ] Confirm mock auth/localStorage fallback cannot be mistaken for production authentication.
- [ ] Test mobile checkout, signed-in checkout, guest checkout, cart clearing, order history, profile sync, and failed-payment behavior.
- [ ] Add production monitoring for failed orders, failed Firebase writes, checkout drop-off, and JavaScript errors.

## Notes

The current checkout flow is intentionally guarded as demo-only. It should be used for user-experience testing, not real purchase processing.