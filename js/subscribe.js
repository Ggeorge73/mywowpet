/* ============================================
   WowPetStore — Subscribe & Save Page
   ============================================ */

const SubscribePage = (() => {

  function init() {
    renderProducts();
    renderSubscriptions();
    calcSavings(100);
    WowAnimations.init();
  }

  function renderProducts() {
    const grid = document.getElementById('subscribable-grid');
    const products = WowStore.getProducts({ subscribable: true, sort: 'bestselling' });
    grid.innerHTML = products.map(p => WowApp.renderProductCard(p)).join('');
    setTimeout(() => WowAnimations.init(), 100);
  }

  function renderSubscriptions() {
    const subs = WowStore.getSubscriptions();
    const container = document.getElementById('active-subs');
    const section = document.getElementById('active-subs-section');

    if (subs.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-5);">
        ${subs.map(sub => {
          const product = WowStore.getProduct(sub.productId);
          if (!product) return '';
          const freqLabels = { '2weeks': 'Every 2 weeks', '4weeks': 'Every 4 weeks', '6weeks': 'Every 6 weeks', '8weeks': 'Every 8 weeks' };
          const statusColors = { active: 'var(--color-secondary)', paused: 'var(--color-warning)', cancelled: 'var(--color-text-muted)' };
          return `
            <div style="background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); box-shadow: var(--shadow-card);">
              <div class="flex items-center gap-4 mb-4">
                <div style="width: 56px; height: 56px; background: ${WowStore.generateProductGradient(product)}; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;">
                  <img src="${WowStore.getProductImage(product)}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div class="font-semibold truncate">${product.name}</div>
                  <div class="text-sm text-muted">${product.weight}</div>
                </div>
                <span style="padding: 2px 10px; border-radius: var(--radius-full); font-size: var(--fs-xs); font-weight: var(--fw-semibold); font-family: var(--font-accent); background: ${statusColors[sub.status]}22; color: ${statusColors[sub.status]};">${sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</span>
              </div>
              <div class="flex justify-between text-sm mb-3">
                <span class="text-muted">Frequency</span>
                <span class="font-medium">${freqLabels[sub.frequency] || sub.frequency}</span>
              </div>
              <div class="flex justify-between text-sm mb-3">
                <span class="text-muted">Next delivery</span>
                <span class="font-medium">${sub.nextDelivery}</span>
              </div>
              <div class="flex justify-between text-sm mb-4">
                <span class="text-muted">Price per delivery</span>
                <span class="font-semibold price-subscribe">${WowStore.formatPrice(product.subscribePrice)}</span>
              </div>
              <div class="flex gap-2">
                ${sub.status === 'active' ? `
                  <button class="btn btn-sm btn-secondary" onclick="SubscribePage.pauseSub(${sub.id})">⏸ Pause</button>
                  <button class="btn btn-sm btn-ghost" onclick="SubscribePage.skipSub(${sub.id})">⏭ Skip</button>
                  <button class="btn btn-sm btn-ghost" style="color: var(--color-coral);" onclick="SubscribePage.cancelSub(${sub.id})">Cancel</button>
                ` : sub.status === 'paused' ? `
                  <button class="btn btn-sm btn-primary" onclick="SubscribePage.resumeSub(${sub.id})">▶ Resume</button>
                  <button class="btn btn-sm btn-ghost" style="color: var(--color-coral);" onclick="SubscribePage.cancelSub(${sub.id})">Cancel</button>
                ` : `
                  <button class="btn btn-sm btn-primary" onclick="SubscribePage.resumeSub(${sub.id})">Reactivate</button>
                `}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  function pauseSub(id) {
    const subs = WowStore.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) { sub.status = 'paused'; WowStore.saveSubscriptions(subs); }
    renderSubscriptions();
    WowApp.showToast('Subscription paused', '⏸');
  }

  function resumeSub(id) {
    const subs = WowStore.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) { sub.status = 'active'; WowStore.saveSubscriptions(subs); }
    renderSubscriptions();
    WowApp.showToast('Subscription resumed!', '▶');
  }

  function skipSub(id) {
    WowApp.showToast('Next delivery skipped!', '⏭');
  }

  function cancelSub(id) {
    const subs = WowStore.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) { sub.status = 'cancelled'; WowStore.saveSubscriptions(subs); }
    renderSubscriptions();
    WowApp.showToast('Subscription cancelled', '🗑️');
  }

  function calcSavings(monthly) {
    const el = document.getElementById('spending-display');
    const amountEl = document.getElementById('savings-amount');
    const monthlyEl = document.getElementById('savings-monthly');
    if (el) el.textContent = '$' + monthly;
    const monthlySavings = Math.round(monthly * 0.15);
    const annual = monthlySavings * 12;
    if (amountEl) amountEl.textContent = '$' + annual;
    if (monthlyEl) monthlyEl.textContent = '$' + monthlySavings;
  }

  return { init, pauseSub, resumeSub, skipSub, cancelSub, calcSavings };
})();
