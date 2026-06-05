/* ============================================
   WowPetStore — Cart Page Logic
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
    document.getElementById('cart-count-text').textContent = isEmpty ? '' : `${WowStore.getCartCount()} item${WowStore.getCartCount() !== 1 ? 's' : ''} in your cart`;

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
    let promoDiscount = 0;
    let promoHtml = '';

    if (appliedPromo) {
      if (appliedPromo.type === 'percent') {
        promoDiscount = totals.subtotal * appliedPromo.discount;
      } else {
        promoDiscount = appliedPromo.discount;
      }
      promoHtml = `<div class="summary-row savings">
        <span>${appliedPromo.description}</span>
        <span>-${WowStore.formatPrice(promoDiscount)}</span>
      </div>`;
    }

    const finalTotal = totals.total - promoDiscount;
    const pointsEarned = Math.floor(finalTotal * 4);

    document.getElementById('order-summary').innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${WowStore.formatPrice(totals.subtotal)}</span>
      </div>
      ${totals.savings > 0 ? `<div class="summary-row savings">
        <span>Subscribe & Save</span>
        <span>-${WowStore.formatPrice(totals.savings)}</span>
      </div>` : ''}
      ${promoHtml}
      <div class="summary-row">
        <span>Shipping</span>
        <span>${totals.shipping === 0 ? '<span style="color: var(--color-secondary); font-weight: var(--fw-semibold);">FREE</span>' : WowStore.formatPrice(totals.shipping)}</span>
      </div>
      <div class="summary-row">
        <span>Estimated Tax</span>
        <span>${WowStore.formatPrice(totals.tax)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${WowStore.formatPrice(finalTotal)}</span>
      </div>

      <div class="promo-code">
        <input type="text" id="promo-input" placeholder="Promo code" value="${appliedPromo ? '' : ''}">
        <button onclick="CartPage.applyPromo()">Apply</button>
      </div>
      ${appliedPromo ? `<div style="font-size: var(--fs-xs); color: var(--color-secondary); margin-bottom: var(--space-4);">✓ Code applied: ${appliedPromo.description}</div>` : ''}

      <a href="checkout.html" class="btn btn-primary btn-block btn-lg">Proceed to Checkout</a>

      <div style="text-align: center; margin-top: var(--space-4); padding: var(--space-3); background: rgba(var(--color-primary-rgb), 0.06); border-radius: var(--radius-md);">
        <span style="font-size: var(--fs-sm); color: var(--color-primary-dark);">⭐ You'll earn <strong>${pointsEarned}</strong> loyalty points</span>
      </div>

      ${totals.shipping > 0 ? `<div style="text-align: center; margin-top: var(--space-3); font-size: var(--fs-xs); color: var(--color-text-muted);">Add ${WowStore.formatPrice(49 - totals.subtotal)} more for free shipping!</div>` : ''}
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
      appliedPromo = promo;
      WowApp.showToast(`Promo code applied: ${promo.description}`, '🎉');
      renderSummary();
    } else {
      WowApp.showToast('Invalid promo code', '❌');
    }
  }

  return { init, updateQty, remove, applyPromo };
})();
