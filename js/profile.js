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
        </div>
        <div class="profile-section active" id="section-pets"></div>
        <div class="profile-section" id="section-loyalty"></div>
        <div class="profile-section" id="section-orders"></div>
        <div class="profile-section" id="section-subscriptions"></div>
        <div class="profile-section" id="section-wishlist"></div>
      `;

      // Re-bind click event handlers for newly injected tabs
      document.querySelectorAll('.profile-tab').forEach((t, i) => {
        const tabList = ['pets', 'loyalty', 'orders', 'subscriptions', 'wishlist'];
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
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.profile-tab').forEach((t, i) => {
      const tabs = ['pets', 'loyalty', 'orders', 'subscriptions', 'wishlist'];
      t.classList.toggle('active', tabs[i] === tab);
    });
    document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${tab}`).classList.add('active');
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
            <div class="order-card">
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
              <div class="flex justify-between items-center">
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

  // Listen for login/logout events to dynamically refresh page content
  window.addEventListener('userLoggedIn', () => { init(); });
  window.addEventListener('userLoggedOut', () => { init(); });

  return { init, switchTab, openAddPet, editPet, savePet, deletePet, closeModal, redeemReward, reorder };
})();
