/* ============================================
   WowPetStore — Profile Page Logic
   ============================================ */

const ProfilePage = (() => {
  let activeTab = 'pets';

  // Default demo pets
  const defaultPets = [
    { id: 1, name: 'Buddy', species: 'dog', breed: 'Golden Retriever', birthday: '2020-06-15', emoji: '🐕', notes: 'Grain-free diet, loves salmon' },
    { id: 2, name: 'Whiskers', species: 'cat', breed: 'Tabby', birthday: '2021-03-22', emoji: '🐈', notes: 'Indoor cat, sensitive stomach' }
  ];

  function init() {
    // Check if user is logged in
    const user = typeof WowFirebase !== 'undefined' ? WowFirebase.getCurrentUser() : null;
    
    const header = document.querySelector('.profile-header');
    const tabs = document.getElementById('profile-tabs');
    const body = document.querySelector('.page-body .container');

    if (!user) {
      if (header) header.style.display = 'none';
      if (tabs) tabs.style.display = 'none';
      
      document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
      
      if (body) {
        body.innerHTML = `
          <div class="empty-state" style="max-width: 480px; margin: 60px auto; padding: var(--space-10); background: var(--glass-bg); backdrop-filter: blur(15px); border-radius: var(--radius-xl); border: 1px solid var(--glass-border); box-shadow: var(--shadow-xl); text-align: center;">
            <div class="empty-state-icon" style="font-size: 64px; margin-bottom: var(--space-4);">🔒</div>
            <h2 style="font-size: var(--fs-2xl); margin-bottom: var(--space-2); font-weight: var(--fw-bold);">Members-Only Profile</h2>
            <p style="color: var(--color-text-muted); font-size: var(--fs-sm); margin-bottom: var(--space-6); line-height: var(--lh-relaxed);">
              Join the pack or sign in to view your pet profiles, track your loyalty tier, manage subscriptions, and see order history.
            </p>
            <button class="btn btn-primary btn-lg" onclick="WowApp.showAuthModal()" style="width: 100%; font-family: var(--font-accent); font-weight: var(--fw-bold);">
              Sign In / Create Account
            </button>
          </div>
        `;
      }
      return;
    }

    // User is logged in: Restore header and layout structure
    if (header) header.style.display = 'block';
    
    if (body) {
      body.innerHTML = `
        <!-- Tabs -->
        <div class="profile-tabs" id="profile-tabs">
          <div class="profile-tab active" onclick="ProfilePage.switchTab('pets')">&#x1F43E; My Pets</div>
          <div class="profile-tab" onclick="ProfilePage.switchTab('loyalty')">&#x2B50; Loyalty</div>
          <div class="profile-tab" onclick="ProfilePage.switchTab('orders')">&#x1F4E6; Orders</div>
          <div class="profile-tab" onclick="ProfilePage.switchTab('subscriptions')">&#x1F504; Subscriptions</div>
          <div class="profile-tab" onclick="ProfilePage.switchTab('wishlist')">&#x2764;&#xFE0F; Wishlist</div>
          <div class="profile-tab" onclick="ProfilePage.switchTab('settings')">&#x2699;&#xFE0F; Settings</div>
        </div>
        <div class="profile-section active" id="section-pets"></div>
        <div class="profile-section" id="section-loyalty"></div>
        <div class="profile-section" id="section-orders"></div>
        <div class="profile-section" id="section-subscriptions"></div>
        <div class="profile-section" id="section-wishlist"></div>
        <div class="profile-section" id="section-settings"></div>
      `;

      // Re-bind click event handlers for newly injected tabs
      document.querySelectorAll('.profile-tab').forEach((t, i) => {
        const tabList = ['pets', 'loyalty', 'orders', 'subscriptions', 'wishlist', 'settings'];
        t.onclick = () => switchTab(tabList[i]);
      });
    }

    // Populate user profile info in header
    const nameEl = header ? header.querySelector('h1') : null;
    if (nameEl) nameEl.textContent = user.displayName || 'Pet Parent';
    
    const metaEl = header ? header.querySelector('.profile-meta span:first-child') : null;
    if (metaEl) {
      metaEl.innerHTML = `&#x2709;&#xFE0F; ${user.email}`;
    }

    // Inject Sign Out button in the header if it doesn't exist
    let signOutBtn = header ? header.querySelector('.btn-sign-out') : null;
    if (header && !signOutBtn) {
      const headerContent = header.querySelector('.profile-header-content');
      if (headerContent) {
        headerContent.insertAdjacentHTML('beforeend', `
          <button class="btn btn-outline btn-sign-out" onclick="WowFirebase.logout()" style="margin-left: auto; border-color: rgba(255,255,255,0.3); color: white; background: transparent; padding: 6px 16px; border-radius: var(--radius-md); font-family: var(--font-accent); cursor: pointer; transition: all var(--duration-fast);">
            🚪 Sign Out
          </button>
        `);
      }
    }

    // Seed demo pets if none exist
    if (WowStore.getPets().length === 0) {
      defaultPets.forEach(p => WowStore.savePet(p));
    }

    renderTierBadge();
    renderPets();
    renderLoyalty();
    renderOrders();
    renderSubscriptions();
    renderWishlist();
    renderSettings();
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.profile-tab').forEach((t, i) => {
      const tabs = ['pets', 'loyalty', 'orders', 'subscriptions', 'wishlist', 'settings'];
      t.classList.toggle('active', tabs[i] === tab);
    });
    document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(`section-${tab}`);
    if (section) section.classList.add('active');
  }

  function renderTierBadge() {
    const loyalty = WowStore.getLoyalty();
    const tier = WowStore.getLoyaltyTier(loyalty.points);
    document.getElementById('tier-badge').innerHTML = `${tier.icon} ${tier.name} Member`;
  }

  // ---- Pets ----
  function renderPets() {
    const pets = WowStore.getPets();
    const container = document.getElementById('section-pets');

    container.innerHTML = `
      <div class="pets-grid">
        ${pets.map(pet => {
          const bday = getBirthdayCountdown(pet.birthday);
          return `
            <div class="pet-card">
              <div class="pet-card-avatar">${pet.emoji}</div>
              <div class="pet-card-info">
                <div class="pet-card-name">${pet.name}</div>
                <div class="pet-card-details">${pet.breed} · ${pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}</div>
                ${pet.birthday ? `<div class="pet-card-birthday">🎂 ${bday}</div>` : ''}
                ${pet.notes ? `<div style="font-size: var(--fs-xs); color: var(--color-text-muted); margin-top: var(--space-1);">📝 ${pet.notes}</div>` : ''}
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                <button class="btn btn-sm btn-ghost" onclick="ProfilePage.editPet(${pet.id})">✏️</button>
                <button class="btn btn-sm btn-ghost" style="color: var(--color-coral);" onclick="ProfilePage.deletePet(${pet.id})">🗑️</button>
              </div>
            </div>`;
        }).join('')}
        <div class="add-pet-card" onclick="ProfilePage.openAddPet()">
          <div class="add-icon">+</div>
          <span>Add a Pet</span>
        </div>
      </div>`;
  }

  function getBirthdayCountdown(birthday) {
    if (!birthday) return '';
    const today = new Date();
    const bday = new Date(birthday);
    const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
    if (thisYear < today) thisYear.setFullYear(thisYear.getFullYear() + 1);
    const diff = Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "🎉 Birthday is TODAY!";
    if (diff <= 7) return `Birthday in ${diff} day${diff > 1 ? 's' : ''}! 🎈`;
    return `Birthday: ${bday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  function openAddPet() {
    document.getElementById('pet-modal-title').textContent = 'Add a Pet';
    document.getElementById('pet-name').value = '';
    document.getElementById('pet-species').value = 'dog';
    document.getElementById('pet-breed').value = '';
    document.getElementById('pet-birthday').value = '';
    document.getElementById('pet-emoji').value = '🐕';
    document.getElementById('pet-notes').value = '';
    document.getElementById('pet-edit-id').value = '';
    document.getElementById('pet-modal').classList.add('open');
  }

  function editPet(id) {
    const pet = WowStore.getPets().find(p => p.id === id);
    if (!pet) return;
    document.getElementById('pet-modal-title').textContent = 'Edit Pet';
    document.getElementById('pet-name').value = pet.name;
    document.getElementById('pet-species').value = pet.species;
    document.getElementById('pet-breed').value = pet.breed || '';
    document.getElementById('pet-birthday').value = pet.birthday || '';
    document.getElementById('pet-emoji').value = pet.emoji || '🐕';
    document.getElementById('pet-notes').value = pet.notes || '';
    document.getElementById('pet-edit-id').value = pet.id;
    document.getElementById('pet-modal').classList.add('open');
  }

  function savePet() {
    const name = document.getElementById('pet-name').value.trim();
    if (!name) { WowApp.showToast('Please enter a pet name', '⚠️'); return; }

    const pet = {
      name,
      species: document.getElementById('pet-species').value,
      breed: document.getElementById('pet-breed').value.trim(),
      birthday: document.getElementById('pet-birthday').value,
      emoji: document.getElementById('pet-emoji').value,
      notes: document.getElementById('pet-notes').value.trim()
    };

    const editId = document.getElementById('pet-edit-id').value;
    if (editId) pet.id = parseInt(editId);

    WowStore.savePet(pet);
    closeModal();
    renderPets();
    WowApp.showToast(editId ? 'Pet updated!' : `${name} added to your family! 🎉`, '🐾');
  }

  function deletePet(id) {
    const pet = WowStore.getPets().find(p => p.id === id);
    WowStore.removePet(id);
    renderPets();
    WowApp.showToast(`${pet?.name || 'Pet'} removed`, '🗑️');
  }

  function closeModal() {
    document.getElementById('pet-modal').classList.remove('open');
  }

  // ---- Loyalty ----
  function renderLoyalty() {
    const loyalty = WowStore.getLoyalty();
    const tier = WowStore.getLoyaltyTier(loyalty.points);
    const nextTier = WowStore.getNextTier(loyalty.points);
    const progress = nextTier ? ((loyalty.points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100 : 100;

    const rewards = [
      { icon: '🎫', name: '$5 Off', cost: 500 },
      { icon: '🚚', name: 'Free Shipping', cost: 300 },
      { icon: '🎁', name: 'Mystery Box', cost: 1000 },
      { icon: '🦴', name: 'Free Treats', cost: 250 },
      { icon: '💊', name: 'Free Supplement', cost: 750 },
      { icon: '⭐', name: 'Double Points Day', cost: 400 }
    ];

    document.getElementById('section-loyalty').innerHTML = `
      <div class="loyalty-stats">
        <div class="loyalty-stat-card">
          <div class="loyalty-stat-value">${loyalty.points.toLocaleString()}</div>
          <div class="loyalty-stat-label">Current Points</div>
        </div>
        <div class="loyalty-stat-card">
          <div class="loyalty-stat-value">${tier.icon}</div>
          <div class="loyalty-stat-label">${tier.name} Tier</div>
        </div>
        <div class="loyalty-stat-card">
          <div class="loyalty-stat-value">${nextTier ? (nextTier.minPoints - loyalty.points).toLocaleString() : '—'}</div>
          <div class="loyalty-stat-label">${nextTier ? `To ${nextTier.name}` : 'Max Tier!'}</div>
        </div>
        <div class="loyalty-stat-card">
          <div class="loyalty-stat-value">${loyalty.history.reduce((s, h) => s + h.points, 0).toLocaleString()}</div>
          <div class="loyalty-stat-label">Lifetime Points</div>
        </div>
      </div>

      <div style="background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); box-shadow: var(--shadow-card); margin-bottom: var(--space-8);">
        <h4 style="margin-bottom: var(--space-4);">Tier Progress</h4>
        <div class="loyalty-bar">
          <div class="loyalty-bar-fill" style="width: ${Math.min(progress, 100)}%;"></div>
        </div>
        <div class="loyalty-tiers">
          ${WowStore.loyaltyTiers.map(t => `
            <div class="loyalty-tier ${loyalty.points >= t.minPoints ? 'active' : ''}">
              <span class="loyalty-tier-icon">${t.icon}</span>
              <span>${t.name}</span>
              <span class="text-sm">${t.minPoints} pts</span>
            </div>
          `).join('')}
        </div>
      </div>

      <h4 style="margin-bottom: var(--space-4);">Available Rewards</h4>
      <div class="rewards-grid" style="margin-bottom: var(--space-8);">
        ${rewards.map(r => `
          <div class="reward-card">
            <div class="reward-icon">${r.icon}</div>
            <div class="reward-name">${r.name}</div>
            <div class="reward-cost">${r.cost} points</div>
            <button class="btn btn-sm ${loyalty.points >= r.cost ? 'btn-primary' : 'btn-secondary'}" style="margin-top: var(--space-3); width: 100%;" ${loyalty.points < r.cost ? 'disabled' : ''} onclick="ProfilePage.redeemReward('${r.name}', ${r.cost})">
              ${loyalty.points >= r.cost ? 'Redeem' : `Need ${r.cost - loyalty.points} more`}
            </button>
          </div>
        `).join('')}
      </div>

      <h4 style="margin-bottom: var(--space-4);">Points History</h4>
      <div style="background: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-card);">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: var(--color-bg-alt);">
              <th style="padding: var(--space-3) var(--space-4); text-align: left; font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: var(--ls-wider); color: var(--color-text-muted);">Date</th>
              <th style="padding: var(--space-3) var(--space-4); text-align: left; font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: var(--ls-wider); color: var(--color-text-muted);">Description</th>
              <th style="padding: var(--space-3) var(--space-4); text-align: right; font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: var(--ls-wider); color: var(--color-text-muted);">Points</th>
            </tr>
          </thead>
          <tbody>
            ${loyalty.history.map(h => `
              <tr style="border-top: 1px solid var(--color-border-light);">
                <td style="padding: var(--space-3) var(--space-4); font-size: var(--fs-sm); color: var(--color-text-muted);">${h.date}</td>
                <td style="padding: var(--space-3) var(--space-4); font-size: var(--fs-sm);">${h.description}</td>
                <td style="padding: var(--space-3) var(--space-4); font-size: var(--fs-sm); text-align: right; color: var(--color-secondary); font-weight: var(--fw-semibold);">+${h.points}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function redeemReward(name, cost) {
    const loyalty = WowStore.getLoyalty();
    if (loyalty.points < cost) return;
    WowStore.addLoyaltyPoints(-cost, `Redeemed: ${name}`);
    renderLoyalty();
    renderTierBadge();
    WowApp.showToast(`${name} redeemed! Check your email for details.`, '🎉');
  }

  // ---- Orders ----
  function renderOrders() {
    const orders = WowStore.getOrders();
    const container = document.getElementById('section-orders');

    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📦</div><h3>No Orders Yet</h3><p>Your order history will appear here.</p><a href="shop.html" class="btn btn-primary">Start Shopping</a></div>`;
      return;
    }

    container.innerHTML = `
      <div class="order-list">
        ${orders.map(order => {
          const statusClass = order.status === 'delivered' ? 'delivered' : 'shipping';
          return `
            <div class="order-card" onclick="ProfilePage.openOrderDetails('${order.id}')" style="cursor: pointer; transition: transform var(--duration-fast), box-shadow var(--duration-fast);" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseleave="this.style.transform=''; this.style.boxShadow='';">
              <div class="order-card-header">
                <span class="order-id">${order.id}</span>
                <span class="order-date">${order.date}</span>
                <span class="order-status ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </div>
              <div class="order-items-preview">
                ${order.items.slice(0, 4).map(item => {
                  const product = WowStore.getProduct(item.productId);
                  if (!product) return '';
                  return `<div class="order-item-thumb" style="background: ${WowStore.generateProductGradient(product)}; overflow: hidden;"><img src="${WowStore.getProductImage(product)}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;"></div>`;
                }).join('')}
                ${order.items.length > 4 ? `<div class="order-item-thumb" style="background: var(--color-bg-alt); display: flex; align-items: center; justify-content: center; font-size: var(--fs-xs); color: var(--color-text-muted);">+${order.items.length - 4}</div>` : ''}
              </div>
              <div class="flex justify-between items-center" onclick="event.stopPropagation();">
                <span class="order-total">Total: ${WowStore.formatPrice(order.total)}</span>
                <div class="flex gap-2">
                  <span class="text-sm" style="color: var(--color-primary);">⭐ +${order.pointsEarned} pts</span>
                  <button class="btn btn-sm btn-secondary" onclick="ProfilePage.reorder(${JSON.stringify(order.items).replace(/"/g, '&quot;')})">🔄 Reorder</button>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  function reorder(items) {
    items.forEach(item => WowStore.addToCart(item.productId, item.qty, false));
    WowApp.updateCartBadge();
    WowApp.showToast('Items added to cart!', '🛒');
  }

  // ---- Subscriptions ----
  function renderSubscriptions() {
    const subs = WowStore.getSubscriptions();
    const container = document.getElementById('section-subscriptions');

    if (subs.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔄</div><h3>No Active Subscriptions</h3><p>Set up recurring deliveries and save 15% on every order.</p><a href="subscribe.html" class="btn btn-primary">Start Subscribing</a></div>`;
      return;
    }

    const freqLabels = { '2weeks': 'Every 2 weeks', '4weeks': 'Every 4 weeks', '6weeks': 'Every 6 weeks', '8weeks': 'Every 8 weeks' };

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-5);">
        ${subs.map(sub => {
          const product = WowStore.getProduct(sub.productId);
          if (!product) return '';
          return `
            <div style="background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); box-shadow: var(--shadow-card);">
              <div class="flex items-center gap-4 mb-4">
                <div style="width: 56px; height: 56px; background: ${WowStore.generateProductGradient(product)}; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;">
                  <img src="${WowStore.getProductImage(product)}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div class="font-semibold truncate">${product.name}</div>
                  <div class="text-sm text-muted">${freqLabels[sub.frequency]} · ${WowStore.formatPrice(product.subscribePrice)}</div>
                </div>
              </div>
              <div class="text-sm text-muted">Next delivery: <strong>${sub.nextDelivery}</strong></div>
              <a href="subscribe.html" class="btn btn-sm btn-secondary" style="margin-top: var(--space-3);">Manage →</a>
            </div>`;
        }).join('')}
      </div>`;
  }

  // ---- Wishlist ----
  function renderWishlist() {
    const wishlistIds = WowStore.getWishlist();
    const container = document.getElementById('section-wishlist');

    if (wishlistIds.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❤️</div><h3>Your Wishlist is Empty</h3><p>Save products you love and come back to them anytime.</p><a href="shop.html" class="btn btn-primary">Browse Products</a></div>`;
      return;
    }

    const products = wishlistIds.map(id => WowStore.getProduct(id)).filter(Boolean);
    container.innerHTML = `<div class="product-grid">${products.map(p => WowApp.renderProductCard(p)).join('')}</div>`;
  }

  // ---- Order Details Modal ----
  function openOrderDetails(orderId) {
    const orders = WowStore.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('order-modal');
    const body = document.getElementById('order-modal-body');
    if (!modal || !body) return;

    const statuses = ['ordered', 'processing', 'shipping', 'delivered'];
    let statusIndex = statuses.indexOf(order.status);
    if (statusIndex === -1) statusIndex = 2; // fallback to shipping

    const steps = [
      { label: 'Ordered', icon: '📝' },
      { label: 'Processing', icon: '⚙️' },
      { label: 'Shipped', icon: '🚚' },
      { label: 'Delivered', icon: '🎁' }
    ];

    const timelineHtml = `
      <div class="order-timeline-container">
        <div class="font-semibold text-center mb-1" style="font-family: var(--font-accent); font-size: 13px;">Status: <span style="color: var(--color-secondary); font-weight: bold;">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
        <div class="order-timeline">
          <div class="order-timeline-progress" style="width: ${(statusIndex / (steps.length - 1)) * 100}%;"></div>
          ${steps.map((step, idx) => {
            let stateClass = '';
            let circleContent = step.icon;
            if (idx < statusIndex) {
              stateClass = 'completed';
              circleContent = '✓';
            } else if (idx === statusIndex) {
              stateClass = 'active';
            }
            return `
              <div class="timeline-step ${stateClass}">
                <div class="timeline-step-circle">${circleContent}</div>
                <div class="timeline-step-label">${step.label}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const itemsHtml = order.items.map(item => {
      const product = WowStore.getProduct(item.productId);
      if (!product) return '';
      return `
        <div class="flex items-center gap-4 py-3" style="border-bottom: 1px solid var(--color-border-light);">
          <div style="width: 52px; height: 52px; background: ${WowStore.generateProductGradient(product)}; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;">
            <img src="${WowStore.getProductImage(product)}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div style="flex: 1; min-width: 0;">
            <div class="font-semibold truncate text-sm">${product.name}</div>
            <div class="text-xs text-muted">Qty: ${item.qty} · ${WowStore.formatPrice(item.price || product.price)}</div>
          </div>
          <span class="font-semibold text-sm">${WowStore.formatPrice((item.price || product.price) * item.qty)}</span>
        </div>
      `;
    }).join('');

    const subtotal = order.items.reduce((s, item) => s + (item.price || 0) * item.qty, 0);
    const shipping = subtotal >= 49 ? 0 : 5.99;
    const tax = subtotal * 0.08;

    let profile = { name: 'Pet Parent', phone: '', address: '123 Pet Lane, San Francisco, CA 94105' };
    try {
      const saved = JSON.parse(localStorage.getItem('wow_profile_info'));
      if (saved) {
        profile = {
          name: saved.name || 'Pet Parent',
          phone: saved.phone || '',
          address: `${saved.address || ''}, ${saved.city || ''}, ${saved.state || ''} ${saved.zip || ''}`
        };
      }
    } catch(e) {}

    body.innerHTML = `
      ${timelineHtml}
      
      <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: var(--space-6); margin-top: var(--space-6); padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-light);">
        <!-- Invoice Details -->
        <div>
          <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: var(--ls-wide); color: var(--color-text-muted); margin-bottom: var(--space-3); font-family: var(--font-accent);">Order Summary</h4>
          <div class="summary-row text-xs" style="display:flex; justify-content:between; margin-bottom:4px; font-family:var(--font-accent); color:var(--color-text-secondary);"><span>Subtotal</span><span style="margin-left:auto;">${WowStore.formatPrice(subtotal)}</span></div>
          <div class="summary-row text-xs" style="display:flex; justify-content:between; margin-bottom:4px; font-family:var(--font-accent); color:var(--color-text-secondary);"><span>Shipping</span><span style="margin-left:auto;">${shipping === 0 ? 'FREE' : WowStore.formatPrice(shipping)}</span></div>
          <div class="summary-row text-xs" style="display:flex; justify-content:between; margin-bottom:4px; font-family:var(--font-accent); color:var(--color-text-secondary);"><span>Tax</span><span style="margin-left:auto;">${WowStore.formatPrice(tax)}</span></div>
          <div class="summary-row text-sm font-bold" style="display:flex; justify-content:between; border-top: 1px solid var(--color-border-light); padding-top:4px; margin-top:4px; font-family:var(--font-accent); font-size: 14px;"><span>Total</span><span style="margin-left:auto;">${WowStore.formatPrice(order.total || total)}</span></div>
          
          <div style="margin-top: var(--space-4); padding: var(--space-2); background: rgba(var(--color-primary-rgb), 0.08); border-radius: var(--radius-md); text-align: center;">
            <span style="font-size: 11px; color: var(--color-primary-dark); font-family: var(--font-accent);">⭐ Points Earned: <strong>+${order.pointsEarned}</strong></span>
          </div>
        </div>

        <!-- Shipping Details -->
        <div style="border-left: 1px solid var(--color-border-light); padding-left: var(--space-6);">
          <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: var(--ls-wide); color: var(--color-text-muted); margin-bottom: var(--space-3); font-family: var(--font-accent);">Shipping Address</h4>
          <div class="text-xs font-semibold mb-1" style="font-family: var(--font-accent);">${profile.name}</div>
          <p class="text-xs text-muted mb-2" style="line-height: var(--lh-relaxed); font-family: var(--font-accent);">${profile.address}</p>
          ${profile.phone ? `<div class="text-xs text-muted mb-3" style="font-family: var(--font-accent);">📞 ${profile.phone}</div>` : ''}
          
          <div style="padding: 6px var(--space-3); background: var(--color-bg-alt); border-radius: var(--radius-md); font-size: 10px; font-family: var(--font-accent); line-height: 1.4;">
            🚚 <strong>Carrier:</strong> FedEx Express<br>
            📦 <strong>Tracking:</strong> WOW-${orderId.replace(/\D/g, '') || '940382'}
          </div>
        </div>
      </div>

      <div style="margin-top: var(--space-4);">
        <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: var(--ls-wide); color: var(--color-text-muted); margin-bottom: var(--space-2); font-family: var(--font-accent);">Items Ordered</h4>
        <div style="max-height: 160px; overflow-y: auto;">
          ${itemsHtml}
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap: var(--space-3); margin-top: var(--space-5); padding-top: var(--space-3); border-top: 1px solid var(--color-border-light);">
        <button class="btn btn-secondary btn-sm" onclick="ProfilePage.closeOrderModal()">Close</button>
        <button class="btn btn-primary btn-sm" onclick="ProfilePage.reorder(${JSON.stringify(order.items).replace(/"/g, '&quot;')}); ProfilePage.closeOrderModal();">🔄 Buy Again</button>
      </div>
    `;

    document.getElementById('order-modal-title').textContent = `Order Details ${order.id}`;
    modal.classList.add('open');
  }

  function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) modal.classList.remove('open');
  }

  // ---- Settings Tab ----
  function renderSettings() {
    const container = document.getElementById('section-settings');
    if (!container) return;
    
    let profile = { name: '', phone: '', address: '', city: '', state: '', zip: '' };
    try {
      const saved = JSON.parse(localStorage.getItem('wow_profile_info'));
      if (saved) profile = { ...profile, ...saved };
    } catch (e) {}

    const user = typeof WowFirebase !== 'undefined' ? WowFirebase.getCurrentUser() : null;
    if (!profile.name && user) {
      profile.name = user.displayName || '';
    }

    container.innerHTML = `
      <div style="background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); box-shadow: var(--shadow-card); max-width: 600px; margin: 0 auto;">
        <h4 style="margin-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--space-2);">⚙️ Profile Settings</h4>
        <form id="settings-form" onsubmit="ProfilePage.saveSettings(event)">
          <div class="input-group mb-4">
            <label for="settings-name">Full Name</label>
            <input type="text" id="settings-name" value="${profile.name}" placeholder="Your Name" required style="width:100%; padding:var(--space-2) var(--space-3); border:1.5px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text);">
          </div>
          <div class="input-group mb-4">
            <label for="settings-phone">Phone Number</label>
            <input type="tel" id="settings-phone" value="${profile.phone}" placeholder="(555) 123-4567" style="width:100%; padding:var(--space-2) var(--space-3); border:1.5px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text);">
          </div>
          <div class="input-group mb-4">
            <label for="settings-address">Street Address</label>
            <input type="text" id="settings-address" value="${profile.address}" placeholder="123 Pet Lane" style="width:100%; padding:var(--space-2) var(--space-3); border:1.5px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text);">
          </div>
          <div class="form-row two-col" style="margin-bottom: var(--space-4); display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4);">
            <div class="input-group">
              <label for="settings-city">City</label>
              <input type="text" id="settings-city" value="${profile.city}" placeholder="San Francisco" style="width:100%; padding:var(--space-2) var(--space-3); border:1.5px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text);">
            </div>
            <div class="input-group">
              <label for="settings-state">State</label>
              <select id="settings-state" style="width:100%; padding:var(--space-2) var(--space-3); border:1.5px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text);">
                <option value="">Select...</option>
                ${['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'WA', 'CO'].map(st => {
                  const labelMap = { CA: 'California', NY: 'New York', TX: 'Texas', FL: 'Florida', IL: 'Illinois', PA: 'Pennsylvania', OH: 'Ohio', GA: 'Georgia', WA: 'Washington', CO: 'Colorado' };
                  return `<option value="${st}" ${profile.state === st ? 'selected' : ''}>${labelMap[st]}</option>`;
                }).join('')}
              </select>
            </div>
          </div>
          <div class="form-row two-col" style="margin-bottom: var(--space-5); display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4);">
            <div class="input-group">
              <label for="settings-zip">ZIP Code</label>
              <input type="text" id="settings-zip" value="${profile.zip}" placeholder="94105" style="width:100%; padding:var(--space-2) var(--space-3); border:1.5px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text);">
            </div>
            <div></div>
          </div>
          <button type="submit" class="btn btn-primary" id="btn-save-settings" style="width: 100%;">Save Profile Details</button>
        </form>
      </div>
    `;
  }

  async function saveSettings(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('btn-save-settings');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    try {
      const profileInfo = {
        name: document.getElementById('settings-name').value.trim(),
        phone: document.getElementById('settings-phone').value.trim(),
        address: document.getElementById('settings-address').value.trim(),
        city: document.getElementById('settings-city').value.trim(),
        state: document.getElementById('settings-state').value,
        zip: document.getElementById('settings-zip').value.trim()
      };

      localStorage.setItem('wow_profile_info', JSON.stringify(profileInfo));
      
      const user = typeof WowFirebase !== 'undefined' ? WowFirebase.getCurrentUser() : null;
      if (user && profileInfo.name && user.displayName !== profileInfo.name) {
        if (!WowFirebase.isMockMode()) {
          await user.updateProfile({ displayName: profileInfo.name });
        } else {
          user.displayName = profileInfo.name;
          localStorage.setItem('wow_mock_user', JSON.stringify(user));
        }
        
        const nameEl = document.querySelector('.profile-header h1');
        if (nameEl) nameEl.textContent = profileInfo.name;
        const navNameEl = document.getElementById('nav-user-name');
        if (navNameEl) navNameEl.textContent = profileInfo.name;
      }

      if (typeof WowStore !== 'undefined') {
        WowStore.triggerSync();
      }

      WowApp.showToast('Profile updated successfully!', '🎉');
    } catch (err) {
      console.error("Failed to save profile:", err);
      WowApp.showToast('Error saving profile.', '⚠️');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile Details';
      }
    }
  }

  // Listen for login/logout events to dynamically refresh page content
  window.addEventListener('userLoggedIn', () => { init(); });
  window.addEventListener('userLoggedOut', () => { init(); });

  return { init, switchTab, openAddPet, editPet, savePet, deletePet, closeModal, redeemReward, reorder, openOrderDetails, closeOrderModal, saveSettings };
})();
