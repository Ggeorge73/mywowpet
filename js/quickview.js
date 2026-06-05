/* ============================================
   WowPetStore — Quick View Product Modal
   Opens product details without leaving the page
   ============================================ */

const WowQuickView = (() => {

  function createModal() {
    if (document.getElementById('quickview-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'quickview-modal';
    modal.innerHTML = `
      <div id="quickview-backdrop" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.6);
        backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
        z-index:490;opacity:0;transition:opacity 0.3s ease;
        display:flex;align-items:center;justify-content:center;padding:20px;
      " onclick="WowQuickView.close()">
        <div id="quickview-panel" onclick="event.stopPropagation()" style="
          background:var(--color-surface,#fff);
          border-radius:28px;
          width:100%;max-width:860px;
          max-height:90vh;
          overflow-y:auto;
          box-shadow:0 32px 80px rgba(0,0,0,0.25);
          transform:translateY(40px) scale(0.97);
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;
          opacity:0;
          position:relative;
        ">
          <button onclick="WowQuickView.close()" style="
            position:sticky;top:16px;float:right;margin:16px 16px 0 0;
            width:36px;height:36px;border-radius:50%;border:none;
            background:var(--color-bg-alt,#f3ede3);color:var(--color-text,#2c2c2c);
            cursor:pointer;font-size:18px;display:flex;align-items:center;
            justify-content:center;z-index:1;box-shadow:var(--shadow-sm);
          ">✕</button>
          <div id="quickview-content" style="padding:32px;clear:both;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function open(productId) {
    createModal();
    const product = WowStore.getProduct(productId);
    if (!product) return;

    const imgSrc = WowStore.getProductImage(product);
    const videoSrc = WowStore.getProductVideo ? WowStore.getProductVideo(product) : null;
    const gradient = WowStore.generateProductGradient(product);
    const isWished = WowStore.isInWishlist(productId);

    document.getElementById('quickview-content').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;" class="qv-grid">
        <!-- Media -->
        <div style="position:relative;border-radius:20px;overflow:hidden;background:${gradient};aspect-ratio:1;">
          <video id="qv-video" src="${videoSrc || ''}" muted loop playsinline autoplay poster="${imgSrc}"
            style="width:100%;height:100%;object-fit:cover;"></video>
          <button onclick="WowQuickView.toggleVideo()" style="
            position:absolute;bottom:12px;right:12px;width:38px;height:38px;
            border-radius:50%;background:rgba(0,0,0,0.5);color:white;border:none;
            cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;
            backdrop-filter:blur(4px);" id="qv-play-btn">⏸</button>
        </div>

        <!-- Info -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--color-text-muted);font-family:var(--font-accent);">${product.brand}</span>
            <h2 style="font-family:var(--font-heading);font-size:1.5rem;margin:6px 0;line-height:1.3;color:var(--color-text);">${product.name}</h2>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              ${WowStore.renderStars(product.rating)}
              <span style="font-size:13px;color:var(--color-text-muted);">(${product.reviewCount} reviews)</span>
            </div>
          </div>

          <!-- Price -->
          <div style="display:flex;align-items:baseline;gap:12px;">
            <span style="font-size:2rem;font-weight:800;color:var(--color-text);font-family:var(--font-heading);">${WowStore.formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span style="font-size:1.1rem;color:var(--color-text-muted);text-decoration:line-through;">${WowStore.formatPrice(product.originalPrice)}</span>` : ''}
            ${product.subscribable ? `<span style="font-size:13px;background:rgba(45,95,58,0.1);color:var(--color-secondary);padding:4px 10px;border-radius:99px;font-weight:600;">Subscribe ${WowStore.formatPrice(product.subscribePrice)}</span>` : ''}
          </div>

          <!-- Tags -->
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${product.tags.slice(0,4).map(t => `<span style="background:var(--color-bg-alt);color:var(--color-text-secondary);padding:5px 12px;border-radius:99px;font-size:12px;font-weight:500;">${t.replace(/-/g,' ')}</span>`).join('')}
          </div>

          <!-- Description snippet -->
          <p style="font-size:14px;color:var(--color-text-secondary);line-height:1.7;-webkit-line-clamp:3;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;">${product.description}</p>

          <!-- Qty + Add -->
          <div style="display:flex;gap:12px;align-items:center;">
            <div style="display:flex;align-items:center;gap:0;border:2px solid var(--color-border);border-radius:12px;overflow:hidden;">
              <button onclick="WowQuickView.changeQty(-1)" style="width:40px;height:44px;border:none;background:none;cursor:pointer;font-size:20px;color:var(--color-text);display:flex;align-items:center;justify-content:center;">−</button>
              <span id="qv-qty" style="min-width:36px;text-align:center;font-weight:700;font-size:16px;">1</span>
              <button onclick="WowQuickView.changeQty(1)" style="width:40px;height:44px;border:none;background:none;cursor:pointer;font-size:20px;color:var(--color-text);display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button onclick="WowQuickView.addToCart(${productId})" style="
              flex:1;padding:14px 24px;border-radius:12px;border:none;
              background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark));
              color:white;font-weight:700;font-size:15px;cursor:pointer;
              transition:transform 0.2s ease, box-shadow 0.2s ease;
              box-shadow:0 6px 20px rgba(212,168,83,0.4);
            " onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 28px rgba(212,168,83,0.5)'"
               onmouseleave="this.style.transform='';this.style.boxShadow='0 6px 20px rgba(212,168,83,0.4)'">
              🛒 Add to Cart
            </button>
            <button onclick="WowQuickView.toggleWish(${productId})" id="qv-wish-btn" style="
              width:48px;height:48px;border-radius:12px;border:2px solid var(--color-border);
              background:none;cursor:pointer;font-size:20px;
              transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;
              color:${isWished ? 'var(--color-coral)' : 'var(--color-text-muted)'};
            " title="Wishlist">${isWished ? '❤️' : '🤍'}</button>
          </div>

          <!-- Full details link -->
          <a href="product.html?id=${productId}" style="
            display:flex;align-items:center;justify-content:center;gap:6px;
            padding:12px;border-radius:12px;border:2px solid var(--color-border);
            color:var(--color-text-secondary);font-size:14px;text-decoration:none;
            transition:all 0.2s ease;
          " onmouseenter="this.style.borderColor='var(--color-primary)';this.style.color='var(--color-primary)'"
             onmouseleave="this.style.borderColor='var(--color-border)';this.style.color='var(--color-text-secondary)'">
            View Full Product Details →
          </a>
        </div>
      </div>
      <style>
        @media (max-width: 600px) {
          .qv-grid { grid-template-columns: 1fr !important; }
        }
      </style>
    `;

    // Animate in
    const backdrop = document.getElementById('quickview-backdrop');
    const panel = document.getElementById('quickview-panel');
    backdrop.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0) scale(1)';
      });
    });
    document.body.style.overflow = 'hidden';

    // Store current product id
    document._qvProductId = productId;
    document._qvQty = 1;
  }

  function close() {
    const backdrop = document.getElementById('quickview-backdrop');
    const panel = document.getElementById('quickview-panel');
    if (!backdrop) return;
    backdrop.style.opacity = '0';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(40px) scale(0.97)';
    document.body.style.overflow = '';
    setTimeout(() => {
      backdrop.style.display = 'none';
    }, 300);
  }

  function toggleVideo() {
    const video = document.getElementById('qv-video');
    const btn = document.getElementById('qv-play-btn');
    if (!video) return;
    if (video.paused) { video.play(); if (btn) btn.textContent = '⏸'; }
    else { video.pause(); if (btn) btn.textContent = '▶'; }
  }

  function changeQty(delta) {
    document._qvQty = Math.max(1, (document._qvQty || 1) + delta);
    const el = document.getElementById('qv-qty');
    if (el) el.textContent = document._qvQty;
  }

  function addToCart(productId) {
    WowStore.addToCart(productId, document._qvQty || 1, false);
    if (typeof WowApp !== 'undefined') {
      WowApp.updateCartBadge();
      const p = WowStore.getProduct(productId);
      WowApp.showToast(`${p?.name || 'Product'} added to cart!`, '🛒');
    }
    close();
  }

  function toggleWish(productId) {
    WowStore.toggleWishlist(productId);
    const btn = document.getElementById('qv-wish-btn');
    const isNowWished = WowStore.isInWishlist(productId);
    if (btn) {
      btn.textContent = isNowWished ? '❤️' : '🤍';
      btn.style.color = isNowWished ? 'var(--color-coral)' : 'var(--color-text-muted)';
    }
    if (typeof WowApp !== 'undefined') {
      WowApp.showToast(isNowWished ? 'Added to wishlist!' : 'Removed from wishlist', isNowWished ? '❤️' : '🤍');
    }
  }

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close, toggleVideo, changeQty, addToCart, toggleWish };
})();
