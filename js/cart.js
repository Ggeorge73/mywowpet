/* ============================================
   My Wow Pet — Cart Page Logic
   Local cart is retained for browsing/wishlist convenience only.
   Real payments must use the Shopify Buy Button checkout on product pages.
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
    document.getElementById('cart-count-text').textContent = isEmpty ? '' : `${WowStore.getCartCount()} item${WowStore.getCartCount() !== 1 ? 's' : ''} saved in your local cart`;

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
    const firstCartProduct = WowStore.getCart()[0] ? WowStore.getProduct(WowStore.getCart()[0].productId) : null;
    const shopifyStartUrl = firstCartProduct ? `product.html?id=${firstCartProduct.id}` : 'shop.html';

    document.getElementById('order-summary').innerHTML = `
      <h3>Saved Cart Summary</h3>
      <div style="margin-bottom: var(--space-4); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid rgba(245, 158, 11, 0.45); background: rgba(245, 158, 11, 0.10); font-size: var(--fs-sm); line-height: var(--lh-relaxed);">
        <strong>Shopify checkout only:</strong> Payments are handled through the Shopify Buy Button on product pages. This local cart is for browsing convenience and no longer routes to the custom checkout page.
      </div>
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

      <a href="${shopifyStartUrl}" class="btn btn-primary btn-block btn-lg">Checkout with Shopify</a>
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

  return { init, updateQty, remove, applyPromo };
})();