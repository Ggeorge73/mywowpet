/* ============================================
   My Wow Pet — Cart Page Logic
   Local cart is retained for browsing/wishlist convenience.
   Production payment is routed through the approved secure checkout provider.
   ============================================ */

const CartPage = (() => {

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

    // Check if upsell should show (only once Shopify selling plans exist)
    const hasNonSub = WowStore.FEATURES.subscriptions && cart.some(item => !item.isSubscription && WowStore.getProduct(item.productId)?.subscribable);
    document.getElementById('subscribe-upsell').style.display = hasNonSub ? 'flex' : 'none';

    renderItems(cart);
    renderSummary();
  }

  function renderItems(cart) {
    const container = document.getElementById('cart-items');
    container.innerHTML = cart.map(item => {
      const product = WowStore.getProduct(item.productId);
      if (!product) return '';
      // Mirrors WowStore.getCartTotal: subscription pricing only while the feature is live.
      const isSubscription = WowStore.FEATURES.subscriptions && item.isSubscription && product.subscribePrice;
      const price = isSubscription ? product.subscribePrice : product.price;
      const imgSrc = WowStore.getProductImage(product);
      const gradient = WowStore.generateProductGradient(product);

      return `
        <div class="cart-item">
          <a href="product.html?id=${product.id}" class="cart-item-image" style="background: ${gradient}; border-radius: var(--radius-md); overflow: hidden;">
            <img src="${imgSrc}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">
          </a>
          <div class="cart-item-info">
            <a href="product.html?id=${product.id}" class="cart-item-title">${product.name}</a>
            <div class="cart-item-variant">${product.weight}${isSubscription ? ' · <span class="badge badge-subscribe">Subscribe & Save</span>' : ''}</div>
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
            ${isSubscription ? `<div style="font-size: var(--fs-xs); color: var(--color-sky); margin-top: 2px;">Save ${WowStore.formatPrice((product.price - product.subscribePrice) * item.qty)}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function renderSummary() {
    const cart = WowStore.getCart();
    const totals = WowStore.getCartTotal();
    // The code is only carried to Shopify; it never changes the prices shown here.
    const activeCode = WowStore.getPromoCode();

    const pointsEarned = Math.floor(totals.total * 4);
    const missingShopifyItems = WowStore.getMissingShopifyCartItems(cart);
    const checkoutDisabled = missingShopifyItems.length > 0;

    document.getElementById('order-summary').innerHTML = `
      <h3>Cart Summary</h3>
      <div style="margin-bottom: var(--space-4); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid rgba(34, 197, 94, 0.35); background: rgba(34, 197, 94, 0.10); font-size: var(--fs-sm); line-height: var(--lh-relaxed);">
        <strong>Secure checkout:</strong> Final pricing, discounts, taxes, shipping, payment, and order creation are confirmed securely before payment.
      </div>
      <div class="summary-row">
        <span>Estimated Subtotal</span>
        <span>${WowStore.formatPrice(totals.subtotal)}</span>
      </div>
      ${totals.savings > 0 ? `<div class="summary-row savings">
        <span>Subscribe & Save</span>
        <span>-${WowStore.formatPrice(totals.savings)}</span>
      </div>` : ''}
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
        <input type="text" id="promo-input" placeholder="Discount code (e.g. WELCOME15)" value="${activeCode || ''}" maxlength="64" autocomplete="off">
        <button onclick="CartPage.applyPromo()">Apply</button>
      </div>
      <div id="promo-note" style="font-size: var(--fs-xs); color: var(--color-text-muted); margin-bottom: var(--space-4);">
        ${activeCode ? `Code <strong>${activeCode}</strong> will be sent to secure checkout, where it is validated and any discount is applied.` : 'Discount codes such as WELCOME15 are validated and applied at secure checkout.'}
      </div>

      ${checkoutDisabled ? `<div style="font-size: var(--fs-sm); color: var(--color-error); margin-bottom: var(--space-4);">One or more items cannot be checked out yet.</div>` : ''}
      <button id="checkout-btn" class="btn btn-primary btn-block btn-lg" onclick="CartPage.startShopifyCheckout()" ${checkoutDisabled ? 'disabled' : ''}>Proceed to Secure Checkout</button>
      <div id="checkout-error" role="alert" hidden style="margin-top: var(--space-3); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--color-error); background: rgba(229, 57, 53, 0.08); font-size: var(--fs-sm); line-height: var(--lh-relaxed);"></div>
      <a href="shop.html" class="btn btn-secondary btn-block btn-lg" style="margin-top: var(--space-3);">Continue Shopping</a>

      ${WowStore.FEATURES.loyalty ? `<div style="text-align: center; margin-top: var(--space-4); padding: var(--space-3); background: rgba(var(--color-primary-rgb), 0.06); border-radius: var(--radius-md);">
        <span style="font-size: var(--fs-sm); color: var(--color-primary-dark);">⭐ Estimated loyalty points: <strong>${pointsEarned}</strong></span>
      </div>` : ''}

      ${totals.shipping > 0 ? `<div style="text-align: center; margin-top: var(--space-3); font-size: var(--fs-xs); color: var(--color-text-muted);">Add ${WowStore.formatPrice(Math.max(0, WowStore.FREE_SHIPPING_THRESHOLD - totals.subtotal))} more for estimated free shipping.</div>` : ''}
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
    // No local validation or price change: Shopify is the source of truth for codes.
    const code = WowStore.setPromoCode(document.getElementById('promo-input').value);
    if (code) {
      WowApp.showToast(`${code} will be checked and applied at secure checkout.`, '🎟️');
    } else {
      WowApp.showToast('Discount code removed.', '🎟️');
    }
    renderSummary();
  }

  // Shown in place of the raw exception text: the shopper only needs to know their
  // cart is safe, that they can retry, and how to reach a person.
  const CHECKOUT_ERROR_MESSAGE = 'We couldn’t open secure checkout just now. Your cart is saved. Please check your connection and try again.';

  function showCheckoutError() {
    const box = document.getElementById('checkout-error');
    if (!box) return;
    box.innerHTML = `
      <p style="margin: 0 0 var(--space-2);"><strong>Checkout didn’t start.</strong> ${CHECKOUT_ERROR_MESSAGE}</p>
      <button type="button" class="btn btn-secondary btn-block" id="checkout-retry-btn" onclick="CartPage.startShopifyCheckout()">Try again</button>
      <p style="margin: var(--space-2) 0 0;">Still stuck? Email <a href="mailto:support@mywowpet.com?subject=Checkout%20problem" style="color: inherit; text-decoration: underline;">support@mywowpet.com</a> and we’ll help you complete your order.</p>`;
    box.hidden = false;
  }

  function hideCheckoutError() {
    const box = document.getElementById('checkout-error');
    if (!box) return;
    box.hidden = true;
    box.innerHTML = '';
  }

  async function startShopifyCheckout() {
    const btn = document.getElementById('checkout-btn');
    const originalText = btn ? btn.textContent : '';
    hideCheckoutError();
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Preparing Secure Checkout...';
    }

    try {
      const cart = WowStore.getCart();
      const missing = WowStore.getMissingShopifyCartItems(cart);
      if (missing.length) {
        throw new Error('One or more cart items cannot be prepared for secure checkout.');
      }

      const activeCode = WowStore.getPromoCode();
      const user = typeof WowFirebase !== 'undefined' && WowFirebase.getCurrentUser ? WowFirebase.getCurrentUser() : null;
      const returnUrl = WowStore.getCustomStorefrontUrl('/');
      const shopifyCart = await WowStore.createShopifyCart(cart, {
        discountCode: activeCode || null,
        email: user?.email || localStorage.getItem('wow_checkout_email') || null,
        returnUrl
      });

      localStorage.setItem('wow_shopify_cart_id', shopifyCart.id);
      const checkoutHref = WowStore.buildShopifyCheckoutUrl(shopifyCart.checkoutUrl, returnUrl);

      // Shopify reports whether the code it was given actually applies. Tell the
      // shopper before handing off rather than letting them find out at payment.
      const rejected = (shopifyCart.discountCodes || []).filter(dc => dc && dc.applicable === false);
      if (rejected.length) {
        WowApp.showToast(`Code ${rejected.map(dc => dc.code).join(', ')} isn't valid for this order. You can try another code at checkout.`, '⚠️', 4000);
        setTimeout(() => { window.location.href = checkoutHref; }, 2500);
        return;
      }
      window.location.href = checkoutHref;
    } catch (err) {
      console.error('[My Wow Pet] Secure checkout handoff failed:', err);
      showCheckoutError();
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  }

  return { init, updateQty, remove, applyPromo, startShopifyCheckout };
})();
