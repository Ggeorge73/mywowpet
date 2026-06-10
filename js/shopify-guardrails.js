/* ============================================
   My Wow Pet — Shopify Mapping Guardrails
   Uses product.shopifyId from WowStore as the single mapping source.
   ============================================ */

(function () {
  const LEGACY_FALLBACK_SHOPIFY_ID = '7989696430163';

  function isExplicitShopifyMapping(product) {
    if (!product || !product.shopifyId) return false;

    // Product 1 is the real owner of the legacy fallback ID. If any other
    // product receives that ID, it came from the old fallback and must be blocked.
    if (String(product.shopifyId) === LEGACY_FALLBACK_SHOPIFY_ID && Number(product.id) !== 1) return false;

    return true;
  }

  function renderUnavailable(node, productId) {
    if (!node) return;
    node.innerHTML = `
      <div role="alert" style="padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid rgba(229, 57, 53, 0.35); background: rgba(229, 57, 53, 0.08); color: var(--color-text);">
        <strong>Checkout temporarily unavailable</strong>
        <p style="margin: var(--space-2) 0 0; font-size: var(--fs-sm); line-height: var(--lh-relaxed);">
          This product is not currently available for secure checkout. Please choose another item or contact support.
        </p>
      </div>
    `;
    console.error(`[My Wow Pet] Missing Shopify mapping for local product ID: ${productId || 'unknown'}`);
  }

  function applyProductMappingGuard() {
    if (!window.WowStore || typeof window.WowStore.getProduct !== 'function' || window.WowStore.__shopifyMappingGuarded) return;

    const originalGetProduct = window.WowStore.getProduct.bind(window.WowStore);

    window.WowStore.getProduct = function guardedGetProduct(id) {
      const product = originalGetProduct(id);
      if (!product) return product;

      const explicitShopifyId = isExplicitShopifyMapping(product) ? product.shopifyId : null;
      return {
        ...product,
        shopifyId: explicitShopifyId,
        shopifyMappingMissing: !explicitShopifyId
      };
    };

    window.WowStore.getShopifyProductId = function getShopifyProductId(id) {
      const product = originalGetProduct(id);
      return isExplicitShopifyMapping(product) ? product.shopifyId : null;
    };

    window.WowStore.__shopifyMappingGuarded = true;
  }

  function patchShopifyBuyButton() {
    if (!window.ShopifyBuy || !window.ShopifyBuy.UI || typeof window.ShopifyBuy.UI.onReady !== 'function' || window.ShopifyBuy.__myWowPetGuarded) return;

    const originalOnReady = window.ShopifyBuy.UI.onReady.bind(window.ShopifyBuy.UI);

    window.ShopifyBuy.UI.onReady = function guardedOnReady(client) {
      return originalOnReady(client).then(function (ui) {
        if (!ui || typeof ui.createComponent !== 'function' || ui.__myWowPetGuarded) return ui;

        const originalCreateComponent = ui.createComponent.bind(ui);

        ui.createComponent = function guardedCreateComponent(type, options) {
          if (type === 'product' && (!options || !options.id)) {
            renderUnavailable(options && options.node, options && options.id);
            return Promise.resolve(null);
          }
          return originalCreateComponent(type, options);
        };

        ui.__myWowPetGuarded = true;
        return ui;
      });
    };

    window.ShopifyBuy.__myWowPetGuarded = true;
  }

  applyProductMappingGuard();
  patchShopifyBuyButton();

  document.addEventListener('DOMContentLoaded', function () {
    applyProductMappingGuard();
    patchShopifyBuyButton();
  });
})();