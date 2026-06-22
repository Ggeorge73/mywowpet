/* ============================================
   My Wow Pet — Cart Page Logic
   Local cart is retained for browsing/wishlist convenience.
   Production payment is routed through the approved secure checkout provider.
   ============================================ */

const CartPage = (() => {
  let appliedPromo = null;

  function init() {
    render();
    window.addEventListener('cartUpdated', render);
  }

  function render() {
    const cart = WowStore.getCart();
    const isEmpty = cart.length === 0;

    document.getElementById('cart-layout').style.display = isEmpty ? 'none' : '';
    document.getElementById('empty-cart').style.display = isEmpty ? '' : 'none';
    document.getElementById('cart-count-text').textContent = isEmpty ? '' : `${WowStore.getCartCount()} item${WowStore.getCartCount() !== 1 ? 's' : ''} saved in your cart`;

    if (isEmpty) return;

    // Check if upsell should show
    const hasNonSub = cart.some(item => !item.isSubscription && WowStore.getProduct(item.productId)?.subscribable);
    document.getElementById('subscribe-upsell').style.display = hasNonSub ? 'flex' : 'none';

    renderItems(cart);
    renderSummary();
  }

  function renderItems(cart) {
    const container = document.getElementById('cart-items');
    container.innerHTML = cart.map(item => {
      const product = WowStore.getProduct(item.productId);
      if (!product) return '';
      const price = item.isSubscription && product.subscribePrice ? product.subscribePrice : product.price;
      const imgSrc = WowStore.getProductImage(product);
      const gradient = WowStore.generateProductGradient(product);

      return `
        <div class="cart-item">
          <a href="product.html?id=${product.id}" class="cart-item-image" style="background: ${gradient}; border-radius: var(--radius-md); overflow: hidden;">
            <img src="${imgSrc}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">
          </a>
          <div class="cart-item-info">
            <a href="product.html?id=${product.id}" class="cart-item-title">${product.name}</a>
            <div class="cart-item-variant">${product.weight}${item.isSubscription ? ' · <span class="badge badge-subscribe">Subscribe & Save</span>' : ''}</div>
            <div class="cart-item-actions">
              <div class="qty-stepper">
                <button onclick="CartPage.updateQty(${product.id}, ${item.qty - 1}, ${item.isSubscription})">−</button>
                <div class="qty-value">${item.qty}</div>
                <button onclick="CartPage.updateQty(${product.id}, ${item.qty + 1}, ${item.isSubscription})">+</button>
              </div>
              <span class="cart-item-remove" onclick="CartPage.remove(${product.id}, ${item.isSubscription})">Remove</span>
            </div>
          </div>
          <div class="cart-item-price" style="display: none;"></div>
          <div class="cart-item-price">
            <span class="price">${WowStore.formatPrice(price * item.qty)}</span>
            ${item.isSubscription ? `<div style="font-size: var(--fs-xs); color: var(--color-sky); margin-top: 2px;">Save ${WowStore.formatPrice((product.price - product.subscribePrice) * item.qty)}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function renderSummary() {
    const totals = WowStore.getCartTotal();
    const activeCode = localStorage.getItem('wow_applied_promo');
    const appliedPromo = activeCode ? WowStore.validatePromo(activeCode) : null;
    let promoHtml = '';

    if (appliedPromo && totals.promoDiscount > 0) {
      promoHtml = `<div class="summary-row savings">
        <span>${appliedPromo.description}</span>
        <span>-${WowStore.formatPrice(totals.promoDiscount)}</span>
      </div>`;
    }

    const pointsEarned = Math.floor(totals.total * 4);

    document.getElementById('order-summary').innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Estimated Subtotal</span>
        <span>${WowStore.formatPrice(totals.subtotal)}</span>
      </div>
      ${totals.savings > 0 ? `<div class="summary-row savings">
        <span>Subscribe & Save</span>
        <span>-${WowStore.formatPrice(totals.savings)}</span>
      </div>` : ''}
      ${promoHtml}
      <div class="summary-row">
        <span>Estimated Shipping</span>
        <span>${totals.shipping === 0 ? '<span style="color: var(--color-secondary); font-weight: var(--fw-semibold);">FREE</span>' : WowStore.formatPrice(totals.shipping)}</span>
      </div>
      <div class="summary-row">
        <span>Estimated Tax</span>
        <span>${WowStore.formatPrice(totals.tax)}</span>
      </div>
      <div class="summary-row total">
        <span>Estimated Total</span>
        <span>${WowStore.formatPrice(totals.total)}</span>
      </div>

      <div class="promo-code">
        <input type="text" id="promo-input" placeholder="Promo code" value="${activeCode || ''}">
        <button onclick="CartPage.applyPromo()">Apply</button>
      </div>
      ${appliedPromo ? `<div style="font-size: var(--fs-xs); color: var(--color-secondary); margin-bottom: var(--space-4);">✓ Code applied locally: ${appliedPromo.description}</div>` : ''}

      <button id="checkout-btn" class="btn btn-primary btn-block btn-lg" onclick="CartPage.startShopifyCheckout()">Proceed to Secure Checkout</button>
      <a href="shop.html" class="btn btn-secondary btn-block btn-lg" style="margin-top: var(--space-3);">Continue Shopping</a>

      <div style="text-align: center; margin-top: var(--space-4); padding: var(--space-3); background: rgba(var(--color-primary-rgb), 0.06); border-radius: var(--radius-md);">
        <span style="font-size: var(--fs-sm); color: var(--color-primary-dark);">⭐ Estimated loyalty points: <strong>${pointsEarned}</strong></span>
      </div>

      ${totals.shipping > 0 ? `<div style="text-align: center; margin-top: var(--space-3); font-size: var(--fs-xs); color: var(--color-text-muted);">Add ${WowStore.formatPrice(49 - totals.subtotal)} more for estimated free shipping.</div>` : ''}
    `;
  }

  function updateQty(productId, newQty, isSubscription) {
    WowStore.updateCartQty(productId, newQty, isSubscription);
    WowApp.updateCartBadge();
  }

  function remove(productId, isSubscription) {
    const product = WowStore.getProduct(productId);
    WowStore.removeFromCart(productId, isSubscription);
    WowApp.updateCartBadge();
    WowApp.showToast(`${product?.name || 'Item'} removed from cart`, '🗑️');
  }

  function applyPromo() {
    const code = document.getElementById('promo-input').value.trim();
    if (!code) return;
    const promo = WowStore.validatePromo(code);
    if (promo) {
      WowApp.showToast(`Promo code applied locally: ${promo.description}`, '🎉');
      renderSummary();
    } else {
      WowApp.showToast('Invalid promo code', '❌');
    }
  }

  async function startShopifyCheckout() {
    const btn = document.getElementById('checkout-btn');
    const originalText = btn.textContent;
    btn.textContent = "Preparing Secure Checkout...";
    btn.disabled = true;

    try {
      const cartItems = WowStore.getCart();
      const shopifyLines = cartItems.map(item => {
        const product = WowStore.getProduct(item.productId);
        return {
          merchandiseId: `gid://shopify/ProductVariant/${product.shopifyId}`,
          quantity: item.qty
        };
      });

      const query = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: { lines: shopifyLines }
      };

      const response = await fetch(`https://${WowStore.shopifyConfig.domain}/api/${WowStore.shopifyConfig.apiVersion}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': WowStore.shopifyConfig.storefrontAccessToken
        },
        body: JSON.stringify({ query, variables })
      });

      const json = await response.json();
      
      if (json.errors || json.data.cartCreate.userErrors.length > 0) {
        console.error("Shopify Cart API Error:", json.errors || json.data.cartCreate.userErrors);
        WowApp.showToast("Checkout error. Please try again.", "❌");
        btn.textContent = originalText;
        btn.disabled = false;
        return;
      }

      const checkoutUrl = json.data.cartCreate.cart.checkoutUrl;
      window.location.href = checkoutUrl;

    } catch (err) {
      console.error("Checkout Request Failed:", err);
      WowApp.showToast("Network error. Please try again.", "❌");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  return { init, updateQty, remove, applyPromo, startShopifyCheckout };
})();