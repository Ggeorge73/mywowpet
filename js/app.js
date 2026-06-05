/* ============================================
   WowPetStore — Global App Logic
   Nav, search, toasts, cart badge, announcements
   ============================================ */

const WowApp = (() => {

  // ---- Announcement Bar Rotation ----
  function initAnnouncements() {
    const texts = document.querySelectorAll('.announcement-text');
    if (!texts.length) return;
    let current = 0;
    texts.forEach((t, i) => {
      t.style.opacity = i === 0 ? '1' : '0';
      t.style.transform = i === 0 ? 'translateY(0)' : 'translateY(100%)';
    });
    setInterval(() => {
      texts[current].style.opacity = '0';
      texts[current].style.transform = 'translateY(-100%)';
      current = (current + 1) % texts.length;
      texts[current].style.opacity = '1';
      texts[current].style.transform = 'translateY(0)';
    }, 4000);
  }

  // ---- Navbar Scroll ----
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      if (scroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = scroll;
    }, { passive: true });
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('active');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Cart Badge ----
  function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-count');
    const count = WowStore.getCartCount();
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  // ---- Toast Notifications ----
  function showToast(message, icon = '✓', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span>${message}</span>
      <button class="toast-close" onclick="this.parentElement.classList.remove('show'); setTimeout(() => this.parentElement.remove(), 300)">✕</button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ---- Product Card HTML Generator ----
  function renderProductCard(product) {
    const imgSrc = WowStore.getProductImage(product);
    const gradient = WowStore.generateProductGradient(product);
    const badgeHtml = product.badge ?
      `<div class="product-card-badges">
        <span class="badge ${product.badge === 'bestseller' ? 'badge-primary' : product.badge === 'new' ? 'badge-new' : 'badge-sale'}">${product.badge === 'bestseller' ? '★ Bestseller' : product.badge === 'new' ? '✦ New' : product.badge}</span>
      </div>` : '';

    const subscribePriceHtml = product.subscribable ?
      `<span class="subscribe-price">Subscribe ${WowStore.formatPrice(product.subscribePrice)}</span>` : '';

    return `
      <div class="product-card fade-in" data-id="${product.id}">
        <a href="product.html?id=${product.id}" class="product-card-image" style="background: ${gradient};" onmouseenter="this.querySelector('video')?.play()" onmouseleave="this.querySelector('video')?.pause()">
          ${badgeHtml}
          <video src="${WowStore.getProductVideo(product)}" muted loop playsinline preload="metadata" poster="${imgSrc}" style="width:100%;height:100%;object-fit:cover;"></video>
          <div class="product-card-actions">
            <button class="product-card-quick" onclick="event.preventDefault(); event.stopPropagation(); WowApp.quickAdd(${product.id})" title="Quick add to cart">+</button>
            <button class="product-card-quickview" onclick="event.preventDefault(); event.stopPropagation(); WowQuickView.open(${product.id})" title="Quick view">👁</button>
          </div>
        </a>
        <div class="product-card-body">
          <span class="product-card-category">${product.brand}</span>
          <a href="product.html?id=${product.id}" class="product-card-title">${product.name}</a>
          <div class="product-card-rating">
            ${WowStore.renderStars(product.rating)}
            <span class="count">(${product.reviewCount})</span>
          </div>
          <div class="product-card-footer">
            <div class="product-card-price">
              <span class="price">${WowStore.formatPrice(product.price)}</span>
              ${subscribePriceHtml}
            </div>
            <button class="product-card-add" onclick="WowApp.quickAdd(${product.id})" title="Add to cart">+</button>
          </div>
        </div>
      </div>
    `;
  }

  // ---- Quick Add to Cart ----
  function quickAdd(productId) {
    const product = WowStore.getProduct(productId);
    if (!product) return;
    WowStore.addToCart(productId, 1, false);
    updateCartBadge();
    showToast(`${product.name} added to cart!`, '🛒');
  }

  // ---- Footer HTML ----
  function getFooterHTML() {
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo">🐾 Wow<span class="logo-accent">Pet</span>Store</div>
            <p class="footer-desc">Premium pet products curated for the modern pet parent. Because your fur babies deserve the absolute best.</p>
            <div class="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="TikTok">🎵</a>
            </div>
          </div>
          <div class="footer-column">
            <h4>Shop</h4>
            <div class="footer-links">
              <a href="shop.html?pet=dog">Dogs</a>
              <a href="shop.html?pet=cat">Cats</a>
              <a href="shop.html?pet=small-pet">Small Pets</a>
              <a href="shop.html?pet=bird">Birds</a>
              <a href="subscribe.html">Subscribe & Save</a>
            </div>
          </div>
          <div class="footer-column">
            <h4>Support</h4>
            <div class="footer-links">
              <a href="#">Help Center</a>
              <a href="#">Shipping Info</a>
              <a href="#">Returns</a>
              <a href="#">Track Order</a>
              <a href="#">Contact Us</a>
            </div>
          </div>
          <div class="footer-column">
            <h4>Stay Connected</h4>
            <p class="footer-desc" style="margin-bottom: var(--space-4);">Get 15% off your first order!</p>
            <div class="footer-newsletter">
              <form class="footer-newsletter-form" onsubmit="event.preventDefault(); WowApp.showToast('Thanks for subscribing! Check your inbox for 15% off.', '🎉'); this.reset();">
                <input type="email" placeholder="Your email" required>
                <button type="submit">Join</button>
              </form>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span class="footer-copyright">© 2025 WowPetStore. All rights reserved. Made with ❤️ for pets.</span>
          <div class="footer-payment-icons">
            <span title="Visa">💳</span>
            <span title="Mastercard">💳</span>
            <span title="Amex">💳</span>
            <span title="PayPal">🅿️</span>
            <span title="Apple Pay">🍎</span>
          </div>
        </div>
      </div>
    </footer>`;
  }

  // ---- Navbar HTML ----
  function getNavHTML(activePage = '') {
    return `
    <div class="announcement-bar">
      <span class="announcement-text">🚚 <span class="highlight">FREE SHIPPING</span> on orders over $49</span>
      <span class="announcement-text">🎉 New customers get <span class="highlight">15% OFF</span> — use code WELCOME15</span>
      <span class="announcement-text">🔄 <span class="highlight">SUBSCRIBE & SAVE</span> up to 15% on every delivery</span>
    </div>
    <nav class="navbar" id="navbar">
      <div class="container">
        <a href="index.html" class="nav-logo">
          <span class="logo-icon">🐾</span>
          Wow<span class="logo-accent">Pet</span>Store
        </a>
        <div class="nav-links">
          <a href="shop.html" class="nav-link ${activePage === 'shop' ? 'active' : ''}">Shop</a>
          <a href="journey.html" class="nav-link ${activePage === 'journey' ? 'active' : ''}">🪐 Journey</a>
          <a href="game.html" class="nav-link ${activePage === 'game' ? 'active' : ''}">🧠 Play & Learn</a>
          <a href="subscribe.html" class="nav-link ${activePage === 'subscribe' ? 'active' : ''}">Subscribe & Save</a>
          <a href="profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">My Pets</a>
        </div>
        <div class="nav-search">
          <span class="search-icon">🔍</span>
          <input type="search" placeholder="Search products..." id="nav-search-input" autocomplete="off">
        </div>
        <div class="nav-actions">
          <button class="nav-action-btn" id="dark-mode-btn" onclick="WowApp.toggleDarkMode()" title="Toggle dark mode" style="font-size:18px;">🌙</button>
          <a href="profile.html" class="nav-action-btn" title="My Profile" style="position:relative;">👤</a>
          <a href="cart.html" class="nav-action-btn" title="Cart" id="cart-btn" style="position:relative;">
            🛒
            <span class="cart-count" style="display: none;">0</span>
          </a>
          <button class="mobile-menu-btn" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
    <div class="mobile-menu" id="mobile-menu">
      <div class="mobile-search">
        <span class="search-icon">🔍</span>
        <input type="search" placeholder="Search products..." id="mobile-search-input" autocomplete="off">
      </div>
      <a href="shop.html?pet=dog" class="mobile-nav-link"><span class="link-icon">🐕</span> Dogs</a>
      <a href="shop.html?pet=cat" class="mobile-nav-link"><span class="link-icon">🐈</span> Cats</a>
      <a href="shop.html?pet=small-pet" class="mobile-nav-link"><span class="link-icon">🐹</span> Small Pets</a>
      <a href="shop.html?pet=bird" class="mobile-nav-link"><span class="link-icon">🦜</span> Birds</a>
      <a href="journey.html" class="mobile-nav-link"><span class="link-icon">🪐</span> Solar Journey</a>
      <a href="game.html" class="mobile-nav-link"><span class="link-icon">🧠</span> Play & Learn</a>
      <a href="subscribe.html" class="mobile-nav-link"><span class="link-icon">🔄</span> Subscribe & Save</a>
      <a href="profile.html" class="mobile-nav-link"><span class="link-icon">👤</span> My Profile</a>
      <a href="cart.html" class="mobile-nav-link"><span class="link-icon">🛒</span> Cart</a>
    </div>`;
  }

  // ---- Dark Mode ----
  function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? '' : 'dark');
    localStorage.setItem('wow_theme', isDark ? 'light' : 'dark');
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.textContent = isDark ? '🌙' : '☀️';
  }

  function initDarkMode() {
    const saved = localStorage.getItem('wow_theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const btn = document.getElementById('dark-mode-btn');
      if (btn) btn.textContent = '☀️';
    }
  }

  // ---- Recently Viewed ----
  function trackRecentlyViewed(productId) {
    try {
      let recent = JSON.parse(localStorage.getItem('wow_recently_viewed') || '[]');
      recent = recent.filter(id => id !== productId);
      recent.unshift(productId);
      recent = recent.slice(0, 8);
      localStorage.setItem('wow_recently_viewed', JSON.stringify(recent));
    } catch(e) {}
  }

  function renderRecentlyViewed(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
      const recent = JSON.parse(localStorage.getItem('wow_recently_viewed') || '[]');
      const currentId = new URLSearchParams(window.location.search).get('id');
      const filtered = recent.filter(id => String(id) !== String(currentId)).slice(0, 6);
      if (!filtered.length) { container.closest('section, .section')?.style && (container.closest('section, .section').style.display = 'none'); return; }
      const products = filtered.map(id => WowStore.getProduct(parseInt(id))).filter(Boolean);
      container.innerHTML = products.map(p => renderProductCard(p)).join('');
      if (typeof WowAnimations !== 'undefined') WowAnimations.init();
    } catch(e) {}
  }

  // ---- Live Search Autocomplete ----
  function initSearch() {
    const inputs = document.querySelectorAll('#nav-search-input, #mobile-search-input');
    inputs.forEach(input => {
      let dropdown = null;
      let debounceTimer = null;

      function removeDropdown() {
        if (dropdown) { dropdown.remove(); dropdown = null; }
      }

      function createDropdown(results, query) {
        removeDropdown();
        if (!results.length && !query) return;
        dropdown = document.createElement('div');
        dropdown.style.cssText = `
          position:absolute;top:calc(100% + 8px);left:0;right:0;
          background:var(--color-surface,#fff);
          border:1px solid var(--color-border,#e8e2d8);
          border-radius:16px;z-index:600;
          box-shadow:0 16px 48px rgba(0,0,0,0.15);
          overflow:hidden;max-height:400px;overflow-y:auto;
        `;
        if (!results.length) {
          dropdown.innerHTML = `<div style="padding:16px 20px;color:var(--color-text-muted);font-size:14px;">No results for "${query}"</div>`;
        } else {
          dropdown.innerHTML = results.slice(0,6).map(p => `
            <a href="product.html?id=${p.id}" style="
              display:flex;align-items:center;gap:14px;padding:12px 16px;
              text-decoration:none;color:var(--color-text);
              transition:background 0.15s ease;
              border-bottom:1px solid var(--color-border-light,#f0ebe3);
            " onmouseenter="this.style.background='var(--color-bg-alt)'" onmouseleave="this.style.background=''">
              <div style="width:44px;height:44px;border-radius:10px;overflow:hidden;flex-shrink:0;background:${WowStore.generateProductGradient(p)};">
                <img src="${WowStore.getProductImage(p)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                <div style="font-size:12px;color:var(--color-text-muted);margin-top:2px;">${p.brand} • ${WowStore.formatPrice(p.price)}</div>
              </div>
            </a>
          `).join('') + `
            <a href="shop.html?search=${encodeURIComponent(query)}" style="
              display:block;padding:12px 16px;text-align:center;
              font-size:13px;color:var(--color-primary);font-weight:600;
              text-decoration:none;background:var(--color-bg-alt,#f3ede3);
            ">See all results for "${query}" →</a>
          `;
        }
        const wrapper = input.closest('.nav-search, .mobile-search');
        if (wrapper) { wrapper.style.position = 'relative'; wrapper.appendChild(dropdown); }
      }

      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const q = input.value.trim();
        if (q.length < 2) { removeDropdown(); return; }
        debounceTimer = setTimeout(() => {
          const results = WowStore.getProducts().filter(p =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.brand.toLowerCase().includes(q.toLowerCase()) ||
            p.tags.some(t => t.includes(q.toLowerCase()))
          );
          createDropdown(results, q);
        }, 200);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          removeDropdown();
          window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
        }
        if (e.key === 'Escape') removeDropdown();
      });

      document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && (!dropdown || !dropdown.contains(e.target))) removeDropdown();
      });
    });
  }

  // ---- Init ----
  function init(activePage = '') {
    // Inject nav & footer
    const navSlot = document.getElementById('nav-slot');
    if (navSlot) navSlot.innerHTML = getNavHTML(activePage);

    const footerSlot = document.getElementById('footer-slot');
    if (footerSlot) footerSlot.innerHTML = getFooterHTML();

    initAnnouncements();
    initNavbar();
    initMobileMenu();
    initSearch();
    initDarkMode();
    updateCartBadge();

    // Listen for cart changes
    window.addEventListener('cartUpdated', updateCartBadge);

    // Init scroll animations
    if (typeof WowAnimations !== 'undefined') WowAnimations.init();

    // Engagement features
    if (typeof WowFlashSale !== 'undefined') WowFlashSale.init();
    if (typeof WowSocialProof !== 'undefined') WowSocialProof.init();
    if (typeof WowStreak !== 'undefined') WowStreak.init();
    if (typeof WowSpinWheel !== 'undefined') WowSpinWheel.init();
  }

  return {
    init,
    showToast,
    renderProductCard,
    quickAdd,
    updateCartBadge,
    getNavHTML,
    getFooterHTML,
    toggleDarkMode,
    trackRecentlyViewed,
    renderRecentlyViewed
  };
})();
