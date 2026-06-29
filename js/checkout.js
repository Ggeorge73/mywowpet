/* ============================================
   My Wow Pet - Retired Checkout Module
   Production checkout is created through Shopify Storefront Cart API.
   ============================================ */

const CheckoutPage = (() => {
  function init() {
    window.location.href = 'cart.html';
  }

  function startShopifyCheckout() {
    window.location.href = 'cart.html';
  }

  return {
    init,
    nextStep: startShopifyCheckout,
    prevStep: startShopifyCheckout,
    placeOrder: startShopifyCheckout,
    continueAsGuest: startShopifyCheckout
  };
})();
