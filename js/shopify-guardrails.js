/* ============================================
   My Wow Pet — Shopify Mapping Guardrails
   Prevents unmapped local products from silently falling back to the wrong checkout product.
   ============================================ */

(function () {
  const SHOPIFY_PRODUCT_IDS = Object.freeze({
    1: '7989696430163',
    2: '7989696462931',
    3: '7989696561235',
    4: '7989696626771',
    5: '7989696790611',
    6: '7989696921683',
    7: '7989696987219',
    8: '7989697019987',
    9: '7989697052755',
    10: '7989697085523',
    11: '7989697151059',
    12: '7989697183827',
    13: '7989697216595',
    14: '7989697249363',
    15: '7989697314899',
    16: '7989697609811',
    17: '7989697642579',
    18: '7989697675347',
    19: '7989697740883',
    20: '7989697839187',
    21: '7989697871955',
    22: '7989698199635',
    23: '7989698297939',
    24: '7989698330707'
  });

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
    console.error(`[My Wow Pet] Missing explicit Shopify product mapping for local product ID: ${productId || 'unknown'}`);
  }

  function applyProductMappingGuard() {
    if (!window.WowStore || typeof window.WowStore.getProduct !== 'function' || window.WowStore.__shopifyMappingGuarded) return;

    const originalGetProduct = window.WowStore.getProduct.bind(window.WowStore);

    window.WowStore.getProduct = function guardedGetProduct(id) {
      const product = originalGetProduct(id);
      if (!product) return product;

      const explicitShopifyId = SHOPIFY_PRODUCT_IDS[Number(product.id)] || null;
      return {
        ...product,
        shopifyId: explicitShopifyId,
        shopifyMappingMissing: !explicitShopifyId
      };
    };

    window.WowStore.getShopifyProductId = function getShopifyProductId(id) {
      return SHOPIFY_PRODUCT_IDS[Number(id)] || null;
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