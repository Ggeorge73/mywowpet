/* ============================================
   WowPetStore — Product Detail Page
   ============================================ */

const ProductPage = (() => {
  let product = null;
  let isSubscribe = false;
  let frequency = '4weeks';
  let qty = 1;

  function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    product = WowStore.getProduct(id);

    if (!product) {
      document.getElementById('product-detail').innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>Product Not Found</h3>
          <p>Sorry, we couldn't find that product.</p>
          <a href="shop.html" class="btn btn-primary">Browse All Products</a>
        </div>`;
      document.getElementById('product-tabs-section').style.display = 'none';
      document.getElementById('fbt-container').style.display = 'none';
      document.getElementById('related-section').style.display = 'none';
      return;
    }

    document.title = `${product.name} | WowPetStore`;
    renderBreadcrumbs();
    renderProduct();
    renderTabs();
    renderFBT();
    renderRelated();
    WowAnimations.init();

    // Track recently viewed
    if (typeof WowApp !== 'undefined') {
      WowApp.trackRecentlyViewed(product.id);
    }

    // Render recently viewed (excluding current product)
    setTimeout(() => {
      if (typeof WowApp !== 'undefined') {
        WowApp.renderRecentlyViewed('recently-viewed-grid');
      }
    }, 300);
  }

  function renderBreadcrumbs() {
    const catName = WowStore.productCategories.find(c => c.id === product.category)?.name || product.category;
    document.getElementById('breadcrumbs').innerHTML = `
      <a href="index.html">Home</a><span class="separator">›</span>
      <a href="shop.html">Shop</a><span class="separator">›</span>
      <a href="shop.html?category=${product.category}">${catName}</a><span class="separator">›</span>
      <span class="current">${product.name}</span>`;
  }

  function renderProduct() {
    const imgSrc = WowStore.getProductImage(product);
    const gradient = WowStore.generateProductGradient(product);
    const colors = WowStore.productColors[product.category] || ['#D4A853', '#B8913A'];
    const isWished = WowStore.isInWishlist(product.id);

    // Gallery images (real photo with different gradient overlays for variation)
    const variants = [
      { bg: gradient, img: imgSrc },
      { bg: `linear-gradient(135deg, ${colors[0]}44, ${colors[1]}55)`, img: imgSrc },
      { bg: `linear-gradient(135deg, ${colors[1]}33, ${colors[0]}44)`, img: imgSrc },
      { bg: `linear-gradient(45deg, ${colors[0]}22, ${colors[1]}44)`, img: imgSrc }
    ];

    const highlightIcons = {
      'grain-free': '🌾', 'organic': '🍃', 'high-protein': '💪', 'limited-ingredient': '✅',
      'raw': '🥩', 'vet-recommended': '⚕️', 'dha-enriched': '🧠', 'indoor': '🏠',
      'hairball-control': '✨', 'weight-management': '⚖️', 'dental': '🦷', 'single-ingredient': '1️⃣',
      'training': '🎯', 'durable': '💎', 'puzzle': '🧩', 'interactive': '🎮', 'calming': '😌',
      'probiotic': '🦠', 'joint-health': '🦴', 'glucosamine': '💊', 'paw-care': '🐾',
      'natural': '🌿', 'leather': '👝', 'premium': '⭐', 'eco-friendly': '♻️',
      'self-cleaning': '🤖', 'automatic': '⚡', 'senior': '🧓', 'puppy': '🐶'
    };

    const highlights = product.tags.slice(0, 5).map(tag =>
      `<span class="product-highlight"><span class="highlight-icon">${highlightIcons[tag] || '✦'}</span> ${tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>`
    ).join('');

    const subscribeSection = product.subscribable ? `
      <div class="subscribe-toggle" id="subscribe-toggle">
        <div class="subscribe-toggle-options">
          <div class="subscribe-toggle-option ${!isSubscribe ? 'active' : ''}" onclick="ProductPage.setSubscribe(false)">One-Time Purchase</div>
          <div class="subscribe-toggle-option ${isSubscribe ? 'active' : ''}" onclick="ProductPage.setSubscribe(true)">Subscribe & Save</div>
        </div>
        <div id="subscribe-details" style="display: ${isSubscribe ? 'block' : 'none'};">
          <div class="subscribe-frequency">
            <label style="font-size: var(--fs-sm); white-space: nowrap;">Deliver every:</label>
            <select id="frequency-select" onchange="ProductPage.setFrequency(this.value)">
              <option value="2weeks">2 Weeks</option>
              <option value="4weeks" selected>4 Weeks</option>
              <option value="6weeks">6 Weeks</option>
              <option value="8weeks">8 Weeks</option>
            </select>
          </div>
          <div class="subscribe-savings">💰 You save ${WowStore.formatPrice(product.price - product.subscribePrice)} (${product.subscribeDiscount}% off) per delivery</div>
        </div>
      </div>` : '';

    const videoSrc = WowStore.getProductVideo ? WowStore.getProductVideo(product) : null;

    document.getElementById('product-detail').innerHTML = `
      <!-- Gallery -->
      <div class="product-gallery">
        <div class="product-gallery-main" id="main-image" style="background: ${gradient}; position: relative;">
          <video id="product-video" src="${videoSrc || ''}" muted loop playsinline autoplay poster="${imgSrc}" style="width:100%;height:100%;object-fit:cover;"></video>
          <button class="video-toggle-btn" onclick="ProductPage.toggleVideo()" title="Play/Pause" style="position:absolute;bottom:12px;right:12px;width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,0.5);color:white;border:none;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);">⏸</button>
        </div>
        <div class="product-gallery-thumbs">
          <div class="product-thumb active" onclick="ProductPage.switchImage(0)" data-type="video">
            <div style="width:100%;height:100%;background:${gradient};overflow:hidden;position:relative;">
              <img src="${imgSrc}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:0.7;">
              <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">▶</span>
            </div>
          </div>
          ${variants.slice(1).map((v, i) => `
            <div class="product-thumb" onclick="ProductPage.switchImage(${i + 1})" data-bg="${v.bg}" data-img="${v.img}" data-type="image">
              <div style="width: 100%; height: 100%; background: ${v.bg}; overflow: hidden;">
                <img src="${v.img}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:0.85;">
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Info -->
      <div class="product-info-section">
        <span class="section-label" style="margin-bottom: var(--space-2);">${product.brand}</span>
        <h1 class="product-title">${product.name}</h1>
        <div class="product-rating">
          ${WowStore.renderStars(product.rating)}
          <span class="rating-count">${product.rating} (${product.reviewCount} reviews)</span>
        </div>

        <div class="product-price-block" id="price-block">
          <span class="price" id="display-price">${WowStore.formatPrice(isSubscribe && product.subscribePrice ? product.subscribePrice : product.price)}</span>
          ${isSubscribe && product.subscribePrice ? `<span class="price-original">${WowStore.formatPrice(product.price)}</span>` : ''}
          ${product.subscribable ? `<span class="badge badge-subscribe" style="font-size: var(--fs-xs);">Save ${product.subscribeDiscount}%</span>` : ''}
        </div>

        <div class="product-highlights">${highlights}</div>

        ${subscribeSection}

        <p style="color: var(--color-text-secondary); line-height: var(--lh-relaxed); margin-top: var(--space-4);">${product.description}</p>

        <div style="display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-4); font-size: var(--fs-sm); color: var(--color-text-muted);">
          <span>📦</span> <span>${product.weight}</span>
        </div>

        <div class="product-add-section">
          <div class="qty-stepper">
            <button onclick="ProductPage.changeQty(-1)">−</button>
            <div class="qty-value" id="qty-display">${qty}</div>
            <button onclick="ProductPage.changeQty(1)">+</button>
          </div>
          <button class="btn btn-primary btn-lg" onclick="ProductPage.addToCart()" id="add-to-cart-btn" style="flex: 1;">
            Add to Cart — ${WowStore.formatPrice((isSubscribe && product.subscribePrice ? product.subscribePrice : product.price) * qty)}
          </button>
          <button class="product-wishlist-btn ${isWished ? 'active' : ''}" onclick="ProductPage.toggleWishlist()" id="wishlist-btn">
            ${isWished ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="flex gap-6" style="margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border-light);">
          <div class="flex items-center gap-2 text-sm text-muted"><span>🚚</span> Free shipping $49+</div>
          <div class="flex items-center gap-2 text-sm text-muted"><span>🔄</span> Easy returns</div>
          <div class="flex items-center gap-2 text-sm text-muted"><span>🔒</span> Secure checkout</div>
        </div>
      </div>`;
  }

  function switchImage(index) {
    const thumbs = document.querySelectorAll('.product-thumb');
    thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    const thumb = thumbs[index];
    const main = document.getElementById('main-image');
    const video = document.getElementById('product-video');
    const toggleBtn = main.querySelector('.video-toggle-btn');

    if (thumb.dataset.type === 'video') {
      // Show video
      if (video) {
        video.style.display = '';
        video.play().catch(() => {});
      }
      if (toggleBtn) toggleBtn.style.display = 'flex';
    } else {
      // Show static image
      const bg = thumb.dataset.bg;
      const imgUrl = thumb.dataset.img;
      if (video) {
        video.pause();
        video.style.display = 'none';
      }
      if (toggleBtn) toggleBtn.style.display = 'none';
      main.style.background = bg;
      // Create/update an img element
      let img = main.querySelector('img.gallery-static');
      if (!img) {
        img = document.createElement('img');
        img.className = 'gallery-static';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
        main.appendChild(img);
      }
      img.src = imgUrl;
      img.style.display = '';
    }
  }

  function toggleVideo() {
    const video = document.getElementById('product-video');
    const btn = document.querySelector('.video-toggle-btn');
    if (!video) return;
    if (video.paused) {
      video.play();
      if (btn) btn.textContent = '⏸';
    } else {
      video.pause();
      if (btn) btn.textContent = '▶';
    }
  }

  function setSubscribe(val) {
    isSubscribe = val;
    renderProduct();
  }

  function setFrequency(val) {
    frequency = val;
  }

  function changeQty(delta) {
    qty = Math.max(1, qty + delta);
    document.getElementById('qty-display').textContent = qty;
    updateAddButton();
  }

  function updateAddButton() {
    const price = (isSubscribe && product.subscribePrice ? product.subscribePrice : product.price) * qty;
    document.getElementById('add-to-cart-btn').textContent = `Add to Cart — ${WowStore.formatPrice(price)}`;
  }

  function addToCart() {
    WowStore.addToCart(product.id, qty, isSubscribe, frequency);
    WowApp.updateCartBadge();
    WowApp.showToast(`${product.name} added to cart!`, '🛒');
  }

  function toggleWishlist() {
    WowStore.toggleWishlist(product.id);
    const btn = document.getElementById('wishlist-btn');
    const isWished = WowStore.isInWishlist(product.id);
    btn.classList.toggle('active', isWished);
    btn.textContent = isWished ? '❤️' : '🤍';
    WowApp.showToast(isWished ? 'Added to wishlist!' : 'Removed from wishlist', isWished ? '❤️' : '🤍');
  }

  function renderTabs() {
    const reviews = WowStore.getProductReviews(product.id);
    const tabs = ['Description', 'Ingredients', 'Feeding Guide', 'Reviews'];

    document.getElementById('product-tabs').innerHTML = tabs.map((t, i) =>
      `<div class="tab ${i === 0 ? 'active' : ''}" onclick="ProductPage.switchTab(${i})">${t}${t === 'Reviews' ? ` (${reviews.length})` : ''}</div>`
    ).join('');

    const reviewsHtml = reviews.length ? reviews.map(r => `
      <div style="padding: var(--space-5); background: var(--color-bg); border-radius: var(--radius-lg); margin-bottom: var(--space-3);">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-3">
            <span style="font-size: var(--fs-xl);">${r.avatar}</span>
            <div>
              <strong style="font-size: var(--fs-sm);">${r.author}</strong>
              <div class="text-sm text-muted">${r.pet}</div>
            </div>
          </div>
          ${WowStore.renderStars(r.rating)}
        </div>
        <p style="font-size: var(--fs-sm); color: var(--color-text-secondary);">${r.text}</p>
        <span class="text-sm text-muted" style="margin-top: var(--space-2); display: block;">${r.date}</span>
      </div>
    `).join('') : '<p class="text-muted">No reviews yet. Be the first to review this product!</p>';

    document.getElementById('tab-contents').innerHTML = `
      <div class="tab-content active" id="tab-0">
        <p style="line-height: var(--lh-relaxed); color: var(--color-text-secondary);">${product.description}</p>
      </div>
      <div class="tab-content" id="tab-1">
        <p style="line-height: var(--lh-relaxed); color: var(--color-text-secondary);">${product.ingredients || 'No ingredient information available for this product.'}</p>
      </div>
      <div class="tab-content" id="tab-2">
        <p style="line-height: var(--lh-relaxed); color: var(--color-text-secondary);">${product.feedingGuide || 'No feeding guide available for this product.'}</p>
      </div>
      <div class="tab-content" id="tab-3">${reviewsHtml}</div>`;
  }

  function switchTab(index) {
    document.querySelectorAll('#product-tabs .tab').forEach((t, i) => t.classList.toggle('active', i === index));
    document.querySelectorAll('#tab-contents .tab-content').forEach((c, i) => c.classList.toggle('active', i === index));
  }

  function renderFBT() {
    const bundle = WowStore.getBundleProducts(product.id);
    if (bundle.length < 2) { document.getElementById('fbt-container').style.display = 'none'; return; }
    const allProducts = [product, ...bundle];
    const totalPrice = allProducts.reduce((s, p) => s + p.price, 0);
    const bundlePrice = totalPrice * 0.9;

    document.getElementById('fbt-container').innerHTML = `
      <div class="fbt-section">
        <h3>Frequently Bought Together</h3>
        <div class="fbt-items">
          ${allProducts.map((p, i) => `
            ${i > 0 ? '<span class="fbt-plus">+</span>' : ''}
            <div class="fbt-item">
              <div class="fbt-item-image" style="background: ${WowStore.generateProductGradient(p)}; overflow: hidden;">
                <img src="${WowStore.getProductImage(p)}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">
              </div>
              <div class="fbt-item-name">${p.name}</div>
            </div>
          `).join('')}}
        </div>
        <div class="fbt-total">
          <div>
            <span class="price-original">${WowStore.formatPrice(totalPrice)}</span>
            <span class="bundle-price">${WowStore.formatPrice(bundlePrice)}</span>
            <span class="badge badge-sale" style="margin-left: var(--space-2);">Save 10%</span>
          </div>
          <button class="btn btn-primary" onclick="ProductPage.addBundle([${allProducts.map(p => p.id).join(',')}])">Add All to Cart</button>
        </div>
      </div>`;
  }

  function addBundle(ids) {
    ids.forEach(id => WowStore.addToCart(id, 1, false));
    WowApp.updateCartBadge();
    WowApp.showToast('Bundle added to cart!', '🛒');
  }

  function renderRelated() {
    const related = WowStore.getRelatedProducts(product.id, 6);
    document.getElementById('related-products').innerHTML = related.map(p => WowApp.renderProductCard(p)).join('');
  }

  return { init, switchImage, setSubscribe, setFrequency, changeQty, addToCart, toggleWishlist, switchTab, addBundle, toggleVideo };
})();
