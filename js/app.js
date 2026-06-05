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
          <button class="product-card-quick" onclick="event.preventDefault(); event.stopPropagation(); WowApp.quickAdd(${product.id})" title="Quick add to cart">+</button>
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
          <span class="footer-copyright">© 2024 WowPetStore. All rights reserved. Made with ❤️ for pets.</span>
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
          <a href="profile.html" class="nav-action-btn" title="My Profile">👤</a>
          <a href="cart.html" class="nav-action-btn" title="Cart" id="cart-btn">
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

  // ---- Search handling ----
  function initSearch() {
    const inputs = document.querySelectorAll('#nav-search-input, #mobile-search-input');
    inputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
        }
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
    updateCartBadge();

    // Listen for cart changes
    window.addEventListener('cartUpdated', updateCartBadge);

    // Init scroll animations
    if (typeof WowAnimations !== 'undefined') {
      WowAnimations.init();
    }
  }

  return {
    init,
    showToast,
    renderProductCard,
    quickAdd,
    updateCartBadge,
    getNavHTML,
    getFooterHTML
  };
})();
