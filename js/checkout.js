/* ============================================
   WowPetStore — Checkout Page Logic
   ============================================ */

const CheckoutPage = (() => {
  let currentStep = 0;
  const totalSteps = 4;

  function init() {
    if (WowStore.getCartCount() === 0) {
      window.location.href = 'cart.html';
      return;
    }

    const user = typeof WowFirebase !== 'undefined' ? WowFirebase.getCurrentUser() : null;
    if (!user) {
      document.getElementById('progress-steps').style.display = 'none';
      document.getElementById('checkout-steps').innerHTML = `
        <div class="empty-state" style="padding: var(--space-8); text-align: center; background: var(--glass-bg); border-radius: var(--radius-xl); border: 1px solid var(--glass-border); box-shadow: var(--shadow-lg);">
          <div class="empty-state-icon" style="font-size: 48px; margin-bottom: var(--space-4);">🔒</div>
          <h3 style="font-size: var(--fs-xl); margin-bottom: var(--space-2); font-weight: var(--fw-bold);">Sign In to Checkout</h3>
          <p class="text-muted mb-6" style="font-size: var(--fs-sm); line-height: var(--lh-relaxed);">Please sign in or create an account to complete your checkout. We will save your shipping details and link loyalty points directly to your profile.</p>
          <button class="btn btn-primary btn-lg" onclick="WowApp.showAuthModal()" style="width: 100%; font-family: var(--font-accent); font-weight: var(--fw-bold);">Sign In / Create Account</button>
        </div>
      `;
      // Reload on successful sign in
      window.addEventListener('userLoggedIn', () => {
        window.location.reload();
      }, { once: true });
      return;
    }

    // Pre-fill profile info if exists
    document.getElementById('progress-steps').style.display = 'flex';
    const emailField = document.getElementById('email');
    if (emailField) emailField.value = user.email || '';

    try {
      const profile = JSON.parse(localStorage.getItem('wow_profile_info'));
      if (profile) {
        if (profile.name) {
          const names = profile.name.split(' ');
          const fName = document.getElementById('firstName');
          const lName = document.getElementById('lastName');
          if (fName) fName.value = names[0] || '';
          if (lName) lName.value = names.slice(1).join(' ') || '';
        }
        if (profile.phone) {
          const phField = document.getElementById('phone');
          if (phField) phField.value = profile.phone;
        }
        if (profile.address) {
          const addrField = document.getElementById('address');
          if (addrField) addrField.value = profile.address;
        }
        if (profile.city) {
          const cityField = document.getElementById('city');
          if (cityField) cityField.value = profile.city;
        }
        if (profile.state) {
          const stateField = document.getElementById('state');
          if (stateField) stateField.value = profile.state;
        }
        if (profile.zip) {
          const zipField = document.getElementById('zip');
          if (zipField) zipField.value = profile.zip;
        }
      }
    } catch (e) {}

    renderSummary();
    formatCardInput();
  }

  function renderSummary() {
    const cart = WowStore.getCart();
    const totals = WowStore.getCartTotal();
    const pointsEarned = Math.floor(totals.total * 4);

    const itemsHtml = cart.map(item => {
      const product = WowStore.getProduct(item.productId);
      if (!product) return '';
      const price = item.isSubscription && product.subscribePrice ? product.subscribePrice : product.price;
      return `
        <div class="flex items-center gap-3" style="padding: var(--space-2) 0;">
          <div style="width: 48px; height: 48px; background: ${WowStore.generateProductGradient(product)}; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;">
            <img src="${WowStore.getProductImage(product)}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div style="flex: 1; min-width: 0;">
            <div class="text-sm font-semibold truncate">${product.name}</div>
            <div class="text-sm text-muted">Qty: ${item.qty}${item.isSubscription ? ' · Sub' : ''}</div>
          </div>
          <span class="text-sm font-semibold">${WowStore.formatPrice(price * item.qty)}</span>
        </div>`;
    }).join('');

    document.getElementById('checkout-summary').innerHTML = `
      <h3>Order Summary</h3>
      <div style="max-height: 300px; overflow-y: auto; margin-bottom: var(--space-4);">
        ${itemsHtml}
      </div>
      <div style="border-top: 1px solid var(--color-border-light); padding-top: var(--space-4);">
        <div class="summary-row"><span>Subtotal</span><span>${WowStore.formatPrice(totals.subtotal)}</span></div>
        ${totals.savings > 0 ? `<div class="summary-row savings"><span>Savings</span><span>-${WowStore.formatPrice(totals.savings)}</span></div>` : ''}
        <div class="summary-row"><span>Shipping</span><span>${totals.shipping === 0 ? '<span style="color: var(--color-secondary);">FREE</span>' : WowStore.formatPrice(totals.shipping)}</span></div>
        <div class="summary-row"><span>Tax</span><span>${WowStore.formatPrice(totals.tax)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${WowStore.formatPrice(totals.total)}</span></div>
      </div>
      <div style="text-align: center; margin-top: var(--space-4); padding: var(--space-3); background: rgba(var(--color-primary-rgb), 0.06); border-radius: var(--radius-md);">
        <span style="font-size: var(--fs-sm); color: var(--color-primary-dark);">⭐ You'll earn <strong>${pointsEarned}</strong> points</span>
      </div>`;
  }

  function nextStep() {
    if (!validateStep(currentStep)) return;

    if (currentStep === totalSteps - 2) {
      renderReview();
    }

    const steps = document.querySelectorAll('.checkout-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-step-line');

    // Mark current as completed
    progressSteps[currentStep].classList.remove('active');
    progressSteps[currentStep].classList.add('completed');
    progressSteps[currentStep].querySelector('.progress-step-circle').textContent = '✓';
    if (progressLines[currentStep]) progressLines[currentStep].classList.add('completed');

    // Hide current, show next
    steps[currentStep].style.display = 'none';
    currentStep++;
    steps[currentStep].style.display = 'block';
    progressSteps[currentStep].classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    const steps = document.querySelectorAll('.checkout-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-step-line');

    progressSteps[currentStep].classList.remove('active');
    steps[currentStep].style.display = 'none';

    currentStep--;
    progressSteps[currentStep].classList.remove('completed');
    progressSteps[currentStep].classList.add('active');
    progressSteps[currentStep].querySelector('.progress-step-circle').textContent = currentStep + 1;
    if (progressLines[currentStep]) progressLines[currentStep].classList.remove('completed');
    steps[currentStep].style.display = 'block';
  }

  function validateStep(step) {
    const fields = {
      0: ['email', 'phone'],
      1: ['firstName', 'lastName', 'address', 'city', 'state', 'zip'],
      2: ['cardName', 'cardNumber', 'expiry', 'cvv']
    };

    const required = fields[step] || [];
    let valid = true;

    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const val = el.value.trim();
      if (!val) {
        el.style.borderColor = 'var(--color-error)';
        el.style.boxShadow = '0 0 0 3px rgba(229, 57, 53, 0.15)';
        valid = false;
        el.addEventListener('input', () => {
          el.style.borderColor = '';
          el.style.boxShadow = '';
        }, { once: true });
      }
    });

    if (!valid) {
      WowApp.showToast('Please fill in all required fields', '⚠️');
    }
    return valid;
  }

  function renderReview() {
    const cart = WowStore.getCart();
    const totals = WowStore.getCartTotal();

    document.getElementById('review-items').innerHTML = cart.map(item => {
      const product = WowStore.getProduct(item.productId);
      if (!product) return '';
      const price = item.isSubscription && product.subscribePrice ? product.subscribePrice : product.price;
      return `
        <div class="flex items-center gap-4" style="padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border-light);">
          <div style="width: 56px; height: 56px; background: ${WowStore.generateProductGradient(product)}; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;">
            <img src="${WowStore.getProductImage(product)}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div style="flex: 1;">
            <div class="font-semibold">${product.name}</div>
            <div class="text-sm text-muted">Qty: ${item.qty} · ${product.weight}${item.isSubscription ? ' · <span class="badge badge-subscribe">Subscribe</span>' : ''}</div>
          </div>
          <span class="font-semibold">${WowStore.formatPrice(price * item.qty)}</span>
        </div>`;
    }).join('');

    document.getElementById('review-totals').innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>${WowStore.formatPrice(totals.subtotal)}</span></div>
      ${totals.savings > 0 ? `<div class="summary-row savings"><span>Savings</span><span>-${WowStore.formatPrice(totals.savings)}</span></div>` : ''}
      <div class="summary-row"><span>Shipping</span><span>${totals.shipping === 0 ? 'FREE' : WowStore.formatPrice(totals.shipping)}</span></div>
      <div class="summary-row"><span>Tax</span><span>${WowStore.formatPrice(totals.tax)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${WowStore.formatPrice(totals.total)}</span></div>`;

    // Pre-fill shipping info
    const shippingInfo = document.getElementById('review-items');
    const nameEl = document.getElementById('firstName');
    if (nameEl) {
      const shipping = `${nameEl.value} ${document.getElementById('lastName').value}, ${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('state').value} ${document.getElementById('zip').value}`;
      shippingInfo.insertAdjacentHTML('beforebegin', `
        <div style="padding: var(--space-4); background: var(--color-bg); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
          <div class="text-sm font-semibold mb-2">Shipping to:</div>
          <div class="text-sm text-muted">${shipping}</div>
        </div>`);
    }
  }

  function placeOrder() {
    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const totals = WowStore.getCartTotal();
    const pointsEarned = Math.floor(totals.total * 4);
    const orderNum = '#WOW-' + (1000 + Math.floor(Math.random() * 9000));

    // Save shipping profile details
    try {
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
      const city = document.getElementById('city').value;
      const state = document.getElementById('state').value;
      const zip = document.getElementById('zip').value;
      
      const profileInfo = {
        name: `${firstName} ${lastName}`.trim(),
        phone,
        address,
        city,
        state,
        zip
      };
      localStorage.setItem('wow_profile_info', JSON.stringify(profileInfo));
      localStorage.setItem('wow_checkout_email', document.getElementById('email').value);
    } catch(e) {}

    const cart = WowStore.getCart();
    const order = {
      id: orderNum,
      date: new Date().toISOString().split('T')[0],
      status: 'shipping',
      items: cart.map(item => {
        const product = WowStore.getProduct(item.productId);
        return {
          productId: item.productId,
          qty: item.qty,
          price: item.isSubscription && product?.subscribePrice ? product.subscribePrice : product?.price,
          isSubscription: item.isSubscription
        };
      }),
      total: totals.total,
      pointsEarned
    };

    // Save order
    WowStore.addOrder(order);

    // Save transaction to root orders collection
    if (typeof WowFirebase !== 'undefined') {
      WowFirebase.writeOrderToRootDb(order);
    }

    // Add loyalty points
    WowStore.addLoyaltyPoints(pointsEarned, `Purchase — Order ${orderNum}`);

    // Clear cart
    WowStore.clearCart();

    // Show success after brief delay
    setTimeout(() => {
      document.getElementById('checkout-page').style.display = 'none';
      document.getElementById('checkout-success').style.display = 'block';
      document.getElementById('order-number-display').textContent = orderNum;
      document.getElementById('loyalty-earned-display').innerHTML = `⭐ You earned <strong>${pointsEarned}</strong> loyalty points!`;
      WowApp.updateCartBadge();
      WowAnimations.confetti();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  }

  function formatCardInput() {
    const cardInput = document.getElementById('cardNumber');
    if (cardInput) {
      cardInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = val;
      });
    }
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
        e.target.value = val;
      });
    }
  }

  return { init, nextStep, prevStep, placeOrder };
})();
