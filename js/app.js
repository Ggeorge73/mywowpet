/* ============================================
   My Wow Pet — Global App Logic
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
            <div class="footer-logo">🐾 My Wow <span class="logo-accent">Pet</span></div>
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
          <span class="footer-copyright">© 2025 My Wow Pet. All rights reserved. Made with ❤️ for pets.</span>
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
          My Wow <span class="logo-accent">Pet</span>
        </a>
        <div class="nav-links">
          <a href="shop.html" class="nav-link ${activePage === 'shop' ? 'active' : ''}">Shop</a>
          <a href="check.html" class="nav-link ${activePage === 'check' ? 'active' : ''}">🩺 Pet-Check AI</a>
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
          <div id="nav-profile-slot" style="display: inline-block;">
            <a href="profile.html" class="nav-action-btn" title="My Profile">👤</a>
          </div>
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
      <a href="check.html" class="mobile-nav-link"><span class="link-icon">🩺</span> Pet-Check AI</a>
      <a href="journey.html" class="mobile-nav-link"><span class="link-icon">🪐</span> Solar Journey</a>
      <a href="game.html" class="mobile-nav-link"><span class="link-icon">🧠</span> Play & Learn</a>
      <a href="subscribe.html" class="mobile-nav-link"><span class="link-icon">🔄</span> Subscribe & Save</a>
      <a href="profile.html" id="mobile-profile-link" class="mobile-nav-link"><span class="link-icon">👤</span> My Profile</a>
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

  // ---- Script Loader Helpers ----
  function loadScript(src, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const baseSrc = src.startsWith('/') ? src.substring(1) : src;
      if (document.querySelector(`script[src="${src}"], script[src="${baseSrc}"], script[src="/${baseSrc}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      
      const timer = setTimeout(() => {
        s.onload = s.onerror = null;
        s.remove();
        reject(new Error(`Script load timeout: ${src}`));
      }, timeoutMs);

      s.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      s.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Failed to load script: ${src}`));
      };
      document.body.appendChild(s);
    });
  }

  function loadStyle(href) {
    const baseHref = href.startsWith('/') ? href.substring(1) : href;
    if (document.querySelector(`link[href="${href}"], link[href="${baseHref}"], link[href="/${baseHref}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  async function loadFirebaseAssets() {
    loadStyle("/css/auth-modal.css");
    injectAuthModal(); // Inject auth modal synchronously before scripts load!
    
    try {
      await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
      await Promise.all([
        loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"),
        loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js")
      ]);
      await loadScript("/js/firebase-db.js");
      
      WowFirebase.init();
      setupAuthListeners();
    } catch (err) {
      console.warn("🐾 [My Wow Pet] Failed to load Firebase assets, setting up fallback mock auth service:", err);
      setupMockAuthService();
    }
  }

  function setupMockAuthService() {
    window.WowFirebase = (() => {
      let authCallback = null;
      let mockUser = null;
      
      try {
        const savedUser = localStorage.getItem('wow_mock_auth_user');
        if (savedUser) {
          mockUser = JSON.parse(savedUser);
        }
      } catch (e) {}

      function triggerAuthChange() {
        if (authCallback) authCallback(mockUser);
        window.dispatchEvent(new CustomEvent(mockUser ? 'userLoggedIn' : 'userLoggedOut'));
      }

      setTimeout(() => {
        triggerAuthChange();
      }, 100);

      return {
        init: () => {},
        signInWithEmail: (email, password) => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (email && password) {
                const name = email.split('@')[0];
                mockUser = {
                  uid: 'mock_uid_' + Math.random().toString(36).substring(2, 9),
                  email: email,
                  displayName: name.charAt(0).toUpperCase() + name.slice(1)
                };
                localStorage.setItem('wow_mock_auth_user', JSON.stringify(mockUser));
                triggerAuthChange();
                resolve({ user: mockUser });
              } else {
                reject(new Error("Invalid email or password."));
              }
            }, 600);
          });
        },
        signUpWithEmail: (email, password, name) => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (email && password && name) {
                mockUser = {
                  uid: 'mock_uid_' + Math.random().toString(36).substring(2, 9),
                  email: email,
                  displayName: name
                };
                localStorage.setItem('wow_mock_auth_user', JSON.stringify(mockUser));
                triggerAuthChange();
                resolve({ user: mockUser });
              } else {
                reject(new Error("Please fill out all fields."));
              }
            }, 600);
          });
        },
        sendPasswordReset: (email) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 500);
          });
        },
        signInWithGoogle: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              mockUser = {
                uid: 'mock_google_' + Math.random().toString(36).substring(2, 9),
                email: 'google.parent@gmail.com',
                displayName: 'Google Pet Parent'
              };
              localStorage.setItem('wow_mock_auth_user', JSON.stringify(mockUser));
              triggerAuthChange();
              resolve({ user: mockUser });
            }, 500);
          });
        },
        signInWithFacebook: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              mockUser = {
                uid: 'mock_fb_' + Math.random().toString(36).substring(2, 9),
                email: 'fb.parent@facebook.com',
                displayName: 'FB Pet Parent'
              };
              localStorage.setItem('wow_mock_auth_user', JSON.stringify(mockUser));
              triggerAuthChange();
              resolve({ user: mockUser });
            }, 500);
          });
        },
        signInWithApple: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              mockUser = {
                uid: 'mock_apple_' + Math.random().toString(36).substring(2, 9),
                email: 'apple.parent@apple.com',
                displayName: 'Apple Pet Parent'
              };
              localStorage.setItem('wow_mock_auth_user', JSON.stringify(mockUser));
              triggerAuthChange();
              resolve({ user: mockUser });
            }, 500);
          });
        },
        logout: () => {
          mockUser = null;
          localStorage.removeItem('wow_mock_auth_user');
          triggerAuthChange();
          return Promise.resolve();
        },
        onAuthStateChanged: (callback) => {
          authCallback = callback;
          callback(mockUser);
        },
        isMockMode: () => true,
        syncUserData: () => Promise.resolve(),
        syncMockDataLocally: () => {},
        writeOrderToRootDb: () => Promise.resolve(),
        writeReview: () => Promise.resolve(),
        fetchReviews: () => Promise.resolve([])
      };
    })();
    setupAuthListeners();
  }

  function injectAuthModal() {
    if (document.getElementById('auth-modal')) return;
    const modalHTML = `
    <div class="modal-overlay" id="auth-modal">
      <div class="modal auth-modal">
        <div class="modal-header" style="border-bottom:none; padding-bottom:0;">
          <button class="modal-close" onclick="WowApp.closeAuthModal()" style="margin-left:auto;">&#x2715;</button>
        </div>
        <div class="auth-header-logo">
          <span>&#x1F43E;</span> My Wow <span class="logo-accent">Pet</span>
        </div>
        
        <div class="auth-tabs">
          <button class="auth-tab active" id="tab-signin" onclick="WowApp.switchAuthTab('signin')">Sign In</button>
          <button class="auth-tab" id="tab-signup" onclick="WowApp.switchAuthTab('signup')">Create Account</button>
        </div>

        <div class="auth-error-msg" id="auth-error">
          <span>&#x26A0;&#xFE0F;</span> <span id="auth-error-text"></span>
        </div>

        <form class="auth-form active" id="form-signin" onsubmit="WowApp.handleAuthSubmit(event, 'signin')">
          <div class="auth-input-wrapper">
            <span class="input-icon">&#x2709;&#xFE0F;</span>
            <input type="email" placeholder="Email Address" id="signin-email" required>
          </div>
          <div class="auth-input-wrapper">
            <span class="input-icon">&#x1F512;</span>
            <input type="password" placeholder="Password" id="signin-password" required>
          </div>
          <div class="auth-form-footer">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" id="signin-remember"> Remember me
            </label>
            <button type="button" class="auth-forgot-link" onclick="WowApp.toggleForgotPassword(true)">Forgot Password?</button>
          </div>
          <button type="submit" class="auth-btn-submit" id="btn-signin-submit">
            <span>Sign In</span>
          </button>
        </form>

        <form class="auth-form" id="form-signup" onsubmit="WowApp.handleAuthSubmit(event, 'signup')">
          <div class="auth-input-wrapper">
            <span class="input-icon">&#x1F464;</span>
            <input type="text" placeholder="Full Name" id="signup-name" required>
          </div>
          <div class="auth-input-wrapper">
            <span class="input-icon">&#x2709;&#xFE0F;</span>
            <input type="email" placeholder="Email Address" id="signup-email" required>
          </div>
          <div class="auth-input-wrapper">
            <span class="input-icon">&#x1F512;</span>
            <input type="password" placeholder="Password" id="signup-password" required minlength="6">
          </div>
          <button type="submit" class="auth-btn-submit" id="btn-signup-submit">
            <span>Create Account</span>
          </button>
        </form>

        <form class="auth-form" id="form-forgot" onsubmit="WowApp.handlePasswordReset(event)">
          <h3 style="font-size:var(--fs-base); margin-bottom:var(--space-2); text-align:center;">Reset Password</h3>
          <p style="color:var(--color-text-muted); font-size:var(--fs-xs); margin-bottom:var(--space-4); text-align:center; line-height:var(--lh-relaxed);">Enter your email address and we'll send you a link to reset your password.</p>
          <div class="auth-input-wrapper">
            <span class="input-icon">&#x2709;&#xFE0F;</span>
            <input type="email" placeholder="Email Address" id="forgot-email" required>
          </div>
          <button type="submit" class="auth-btn-submit" id="btn-forgot-submit" style="margin-bottom:var(--space-3);">
            <span>Send Reset Link</span>
          </button>
          <button type="button" class="btn btn-ghost" style="width:100%; font-size:var(--fs-xs);" onclick="WowApp.toggleForgotPassword(false)">Back to Sign In</button>
        </form>

        <div id="auth-social-divider" class="auth-divider">or sign in with</div>

        <div id="auth-social-buttons" class="auth-social-container">
          <button class="auth-social-btn google" onclick="WowApp.handleSocialAuth('google')">
            <span class="social-icon">G</span> Sign in with Google
          </button>
          <button class="auth-social-btn facebook" onclick="WowApp.handleSocialAuth('facebook')">
            <span class="social-icon">&#x1F4D8;</span> Sign in with Facebook
          </button>
          <button class="auth-social-btn apple" onclick="WowApp.handleSocialAuth('apple')">
            <span class="social-icon">&#x1F34E;</span> Sign in with Apple
          </button>
        </div>

        <div class="auth-switch-msg" id="auth-switch-prompt" style="padding-bottom: var(--space-6);">
          Don't have an account? <button onclick="WowApp.switchAuthTab('signup')">Create one</button>
        </div>
      </div>
    </div>`;
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
  }

  function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('open');
      switchAuthTab('signin');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      document.getElementById('auth-error').classList.remove('show');
      document.getElementById('form-signin').reset();
      document.getElementById('form-signup').reset();
      document.getElementById('form-forgot').reset();
    }
  }

  function switchAuthTab(tab) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) errorEl.classList.remove('show');
    
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const formSignin = document.getElementById('form-signin');
    const formSignup = document.getElementById('form-signup');
    const formForgot = document.getElementById('form-forgot');
    const socialDivider = document.getElementById('auth-social-divider');
    const socialButtons = document.getElementById('auth-social-buttons');
    const switchPrompt = document.getElementById('auth-switch-prompt');

    if (tabSignin) tabSignin.classList.toggle('active', tab === 'signin');
    if (tabSignup) tabSignup.classList.toggle('active', tab === 'signup');
    if (formSignin) formSignin.classList.toggle('active', tab === 'signin');
    if (formSignup) formSignup.classList.toggle('active', tab === 'signup');
    if (formForgot) formForgot.classList.toggle('active', tab === 'forgot');
    
    if (socialDivider) socialDivider.style.display = tab === 'forgot' ? 'none' : 'flex';
    if (socialButtons) socialButtons.style.display = tab === 'forgot' ? 'none' : 'flex';
    
    if (switchPrompt) {
      if (tab === 'signin') {
        switchPrompt.innerHTML = `Don't have an account? <button type="button" onclick="WowApp.switchAuthTab('signup')">Create one</button>`;
        switchPrompt.style.display = 'block';
      } else if (tab === 'signup') {
        switchPrompt.innerHTML = `Already have an account? <button type="button" onclick="WowApp.switchAuthTab('signin')">Sign In</button>`;
        switchPrompt.style.display = 'block';
      } else {
        switchPrompt.style.display = 'none';
      }
    }
  }

  function toggleForgotPassword(show) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) errorEl.classList.remove('show');
    
    const formSignin = document.getElementById('form-signin');
    const formSignup = document.getElementById('form-signup');
    const formForgot = document.getElementById('form-forgot');

    if (show) {
      if (formSignin) formSignin.classList.remove('active');
      if (formSignup) formSignup.classList.remove('active');
      if (formForgot) formForgot.classList.add('active');
      switchAuthTab('forgot');
    } else {
      switchAuthTab('signin');
    }
  }

  async function handleAuthSubmit(event, action) {
    event.preventDefault();
    const errorEl = document.getElementById('auth-error');
    const errorText = document.getElementById('auth-error-text');
    const submitBtn = document.getElementById(`btn-${action}-submit`);
    
    if (errorEl) errorEl.classList.remove('show');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.original = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="auth-loading-spinner"></span> <span>Loading...</span>`;
    }
    
    try {
      if (action === 'signin') {
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        await WowFirebase.signInWithEmail(email, password);
        showToast('Successfully signed in!', '🎉');
      } else if (action === 'signup') {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        await WowFirebase.signUpWithEmail(email, password, name);
        showToast(`Welcome to the pack, ${name}! 🎉`, '🐾');
      }
      closeAuthModal();
    } catch (err) {
      if (errorText) errorText.textContent = err.message || 'An error occurred. Please try again.';
      if (errorEl) errorEl.classList.add('show');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.original;
      }
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();
    const errorEl = document.getElementById('auth-error');
    const errorText = document.getElementById('auth-error-text');
    const submitBtn = document.getElementById('btn-forgot-submit');
    const email = document.getElementById('forgot-email').value;
    
    if (errorEl) errorEl.classList.remove('show');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.original = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="auth-loading-spinner"></span> <span>Loading...</span>`;
    }
    
    try {
      await WowFirebase.sendPasswordReset(email);
      showToast('Password reset link sent to your email!', '✉️');
      toggleForgotPassword(false);
    } catch (err) {
      if (errorText) errorText.textContent = err.message || 'Failed to send reset link. Please try again.';
      if (errorEl) errorEl.classList.add('show');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.original;
      }
    }
  }

  async function handleSocialAuth(provider) {
    const errorEl = document.getElementById('auth-error');
    const errorText = document.getElementById('auth-error-text');
    if (errorEl) errorEl.classList.remove('show');
    
    try {
      let result;
      if (provider === 'google') {
        result = await WowFirebase.signInWithGoogle();
      } else if (provider === 'facebook') {
        result = await WowFirebase.signInWithFacebook();
      } else if (provider === 'apple') {
        result = await WowFirebase.signInWithApple();
      }
      const name = result?.user?.displayName || 'Pet Parent';
      showToast(`Welcome back, ${name}! 🎉`, '🐾');
      closeAuthModal();
    } catch (err) {
      if (errorText) errorText.textContent = err.message || 'Social sign-in failed. Please try again.';
      if (errorEl) errorEl.classList.add('show');
    }
  }

  function setupAuthListeners() {
    WowFirebase.onAuthStateChanged((user) => {
      updateNavProfileSlot(user);
    });
  }

  function updateNavProfileSlot(user) {
    const slot = document.getElementById('nav-profile-slot');
    const mobileLink = document.getElementById('mobile-profile-link');
    
    if (slot) {
      if (user) {
        const name = user.displayName || 'Pet Parent';
        slot.innerHTML = `
          <div class="profile-dropdown-container">
            <a href="profile.html" class="nav-action-btn" title="My Profile">👤</a>
            <div class="profile-dropdown-menu">
              <div class="profile-dropdown-header">Hello, <span id="nav-user-name">${name}</span></div>
              <a href="profile.html">🐾 My Profile</a>
              <a href="profile.html#subscriptions">🔄 Subscriptions</a>
              <button onclick="WowFirebase.logout()">🚪 Sign Out</button>
            </div>
          </div>
        `;
      } else {
        slot.innerHTML = `
          <a href="#" onclick="event.preventDefault(); WowApp.showAuthModal();" class="nav-action-btn" title="Sign In">👤</a>
        `;
      }
    }
    
    if (mobileLink) {
      if (user) {
        mobileLink.href = "profile.html";
        mobileLink.onclick = null;
      } else {
        mobileLink.href = "#";
        mobileLink.onclick = (e) => {
          e.preventDefault();
          const btn = document.querySelector('.mobile-menu-btn');
          const menu = document.querySelector('.mobile-menu');
          if (btn && menu) {
            btn.classList.remove('active');
            menu.classList.remove('open');
            document.body.style.overflow = '';
          }
          showAuthModal();
        };
      }
    }
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

    // Load Firebase assets dynamically
    loadFirebaseAssets();
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
    renderRecentlyViewed,
    showAuthModal,
    closeAuthModal,
    switchAuthTab,
    handleAuthSubmit,
    handleSocialAuth,
    handlePasswordReset,
    toggleForgotPassword
  };
})();
