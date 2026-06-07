/* ============================================
   My Wow Pet — Product Detail Page
   ============================================ */

const ProductPage = (() => {
  let product = null;
  let isSubscribe = false;
  let frequency = '4weeks';
  let qty = 1;
  let autoOpenReviewForm = false;

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    product = WowStore.getProduct(id);

    if (product && typeof WowFirebase !== 'undefined') {
      try {
        const cloudReviews = await WowFirebase.fetchReviews(product.id);
        let custom = [];
        try {
          custom = JSON.parse(localStorage.getItem('wow_custom_reviews')) || [];
        } catch (e) {
          custom = [];
        }
        let updated = false;
        cloudReviews.forEach(r => {
          if (!custom.some(cr => cr.id === r.id)) {
            custom.push(r);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem('wow_custom_reviews', JSON.stringify(custom));
        }
      } catch (err) {
        console.error("🐾 [My Wow Pet] Failed to fetch cloud reviews on init:", err);
      }
    }

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

    document.title = `${product.name} | My Wow Pet`;
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

    const subscribeSection = ''; // Handled dynamically inside Shopify Buy Button widget if configured in Shopify

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
          <span class="price" id="display-price">${WowStore.formatPrice(product.price)}</span>
          ${product.subscribable ? `<span class="badge badge-subscribe" style="font-size: var(--fs-xs);">Save ${product.subscribeDiscount}%</span>` : ''}
        </div>

        <div class="product-highlights">${highlights}</div>

        ${subscribeSection}

        <p style="color: var(--color-text-secondary); line-height: var(--lh-relaxed); margin-top: var(--space-4);">${product.description}</p>

        <div style="display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-4); font-size: var(--fs-sm); color: var(--color-text-muted);">
          <span>📦</span> <span>${product.weight}</span>
        </div>

        <div class="product-add-section" style="align-items: center;">
          <div id="shopify-buy-button-container" style="flex: 1;"></div>
          <button class="product-wishlist-btn ${isWished ? 'active' : ''}" onclick="ProductPage.toggleWishlist()" id="wishlist-btn" style="height: 52px;">
            ${isWished ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="flex gap-6" style="margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border-light);">
          <div class="flex items-center gap-2 text-sm text-muted"><span>🚚</span> Free shipping $49+</div>
          <div class="flex items-center gap-2 text-sm text-muted"><span>🔄</span> Easy returns</div>
          <div class="flex items-center gap-2 text-sm text-muted"><span>🔒</span> Secure checkout</div>
        </div>
      </div>`;

    if (typeof ShopifyBuy !== 'undefined') {
      initShopifyBuyButton(product.shopifyId);
    } else {
      console.warn("🐾 [My Wow Pet] ShopifyBuy SDK not loaded.");
    }
  }

  function initShopifyBuyButton(shopifyId) {
    if (typeof ShopifyBuy === 'undefined') {
      console.error('ShopifyBuy SDK not found.');
      return;
    }
    const client = ShopifyBuy.buildClient({
      domain: 'id0dxt-4y.myshopify.com',
      storefrontAccessToken: 'f19dc13ce0feb0bbfa7c9a79ac89eef4',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: shopifyId,
        node: document.getElementById('shopify-buy-button-container'),
        moneyFormat: '%24%7B%7Bamount%7D%7D',
        options: {
          "product": {
            "styles": {
              "product": {
                "max-width": "100%",
                "margin-left": "0px",
                "margin-bottom": "0px",
                "width": "100%"
              },
              "button": {
                "font-family": "'DM Sans', 'Inter', sans-serif",
                "font-weight": "600",
                "font-size": "15px",
                "padding-top": "14px",
                "padding-bottom": "14px",
                "background-color": "#D4A853",
                "color": "#FFFFFF",
                "border-radius": "9999px",
                ":hover": {
                  "background-color": "#B8913A"
                },
                ":focus": {
                  "background-color": "#B8913A"
                }
              },
              "quantityInput": {
                "border-radius": "9999px",
                "border": "1px solid #E8E2D8",
                "font-family": "'DM Sans', 'Inter', sans-serif",
                "padding-top": "14px",
                "padding-bottom": "14px",
                "color": "#2C2C2C"
              },
              "select": {
                "font-family": "'DM Sans', 'Inter', sans-serif",
                "color": "#2C2C2C",
                "border-color": "#E8E2D8",
                "border-radius": "10px"
              },
              "label": {
                "font-family": "'DM Sans', 'Inter', sans-serif",
                "color": "#2C2C2C"
              }
            },
            "contents": {
              "img": false,
              "title": false,
              "price": false,
              "options": true,
              "quantityInput": true,
              "button": true
            },
            "text": {
              "button": "Add to cart"
            }
          },
          "cart": {
            "styles": {
              "button": {
                "font-family": "'DM Sans', 'Inter', sans-serif",
                "font-weight": "600",
                "background-color": "#D4A853",
                "color": "#FFFFFF",
                "border-radius": "9999px",
                ":hover": {
                  "background-color": "#B8913A"
                },
                ":focus": {
                  "background-color": "#B8913A"
                }
              },
              "footer": {
                "background-color": "#FAF7F2"
              },
              "body": {
                "background-color": "#FAF7F2"
              },
              "header": {
                "background-color": "#FAF7F2"
              },
              "title": {
                "font-family": "'Playfair Display', Georgia, serif"
              }
            },
            "text": {
              "total": "Subtotal",
              "button": "Checkout"
            }
          },
          "toggle": {
            "styles": {
              "toggle": {
                "background-color": "#D4A853",
                ":hover": {
                  "background-color": "#B8913A"
                },
                ":focus": {
                  "background-color": "#B8913A"
                }
              }
            }
          }
        }
      });
    });
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

    const reviewsListHtml = reviews.length ? reviews.map(r => `
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

    const user = typeof WowFirebase !== 'undefined' ? WowFirebase.getCurrentUser() : null;
    
    let petOptionsHtml = '';
    if (user) {
      const userName = user.displayName || user.email.split('@')[0] || 'You';
      petOptionsHtml += `<option value="self">${userName} (You)</option>`;
      const pets = WowStore.getPets();
      pets.forEach(pet => {
        petOptionsHtml += `<option value="${pet.id}">${pet.name} (${pet.breed || pet.species}) ${pet.emoji || '🐾'}</option>`;
      });
    }

    const reviewsTabHtml = `
      <div class="flex justify-between items-center mb-6" style="padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-light);">
        <div>
          <h4 style="margin: 0; font-size: var(--fs-lg);">Customer Reviews</h4>
          <div class="flex items-center gap-2 mt-1">
            ${WowStore.renderStars(product.rating)}
            <span class="text-sm text-muted">${product.rating} out of 5 stars (${reviews.length} reviews)</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="ProductPage.toggleReviewForm()">Write a Review</button>
      </div>

      <!-- Expandable Review Form Container -->
      <div id="review-write-form-container" style="display: none; margin-bottom: var(--space-6); padding: var(--space-5); background: var(--color-bg-alt, rgba(255,255,255,0.03)); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light);">
        <h4 style="margin-top: 0; margin-bottom: var(--space-4);">Write a Customer Review</h4>
        <form id="review-write-form" onsubmit="ProductPage.handleReviewSubmit(event)">
          <!-- Star Rating Selection -->
          <div style="margin-bottom: var(--space-4);">
            <label style="display: block; font-size: var(--fs-sm); margin-bottom: var(--space-2); font-weight: var(--fw-semibold);">Your Rating</label>
            <div class="interactive-stars" id="interactive-stars" style="display: flex; gap: var(--space-2); font-size: 28px; color: var(--color-text-muted); cursor: pointer;">
              <span class="interactive-star" data-value="1" style="color: var(--color-border);">&#x2605;</span>
              <span class="interactive-star" data-value="2" style="color: var(--color-border);">&#x2605;</span>
              <span class="interactive-star" data-value="3" style="color: var(--color-border);">&#x2605;</span>
              <span class="interactive-star" data-value="4" style="color: var(--color-border);">&#x2605;</span>
              <span class="interactive-star" data-value="5" style="color: var(--color-border);">&#x2605;</span>
            </div>
            <input type="hidden" id="review-rating-value" name="rating" value="0" required>
          </div>

          <!-- Review Text -->
          <div style="margin-bottom: var(--space-4);">
            <label for="review-text-input" style="display: block; font-size: var(--fs-sm); margin-bottom: var(--space-2); font-weight: var(--fw-semibold);">Your Review</label>
            <textarea id="review-text-input" name="text" rows="4" placeholder="What did you think of this product? What did your pet think?" style="width: 100%; padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); background: rgba(0,0,0,0.2); color: var(--color-text-primary); font-family: inherit; resize: vertical;" required></textarea>
          </div>

          <!-- Post as Pet Selector -->
          <div style="margin-bottom: var(--space-4);">
            <label for="review-pet-select" style="display: block; font-size: var(--fs-sm); margin-bottom: var(--space-2); font-weight: var(--fw-semibold);">Post on behalf of</label>
            <select id="review-pet-select" name="petId" style="width: 100%; padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); background: rgba(0,0,0,0.2); color: var(--color-text-primary); font-family: inherit;">
              ${petOptionsHtml}
            </select>
          </div>

          <div style="display: flex; gap: var(--space-3);">
            <button type="submit" class="btn btn-primary">Submit Review</button>
            <button type="button" class="btn btn-outline" onclick="ProductPage.toggleReviewForm()">Cancel</button>
          </div>
        </form>
      </div>

      <div class="reviews-list-container">
        ${reviewsListHtml}
      </div>
    `;

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
      <div class="tab-content" id="tab-3">${reviewsTabHtml}</div>`;

    initStarRating();
  }

  function toggleReviewForm() {
    const user = typeof WowFirebase !== 'undefined' ? WowFirebase.getCurrentUser() : null;
    if (!user) {
      autoOpenReviewForm = true;
      if (typeof WowApp !== 'undefined') {
        WowApp.showAuthModal();
      }
      return;
    }

    const form = document.getElementById('review-write-form-container');
    if (form) {
      if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
      } else {
        form.style.display = 'none';
      }
    }
  }

  function initStarRating() {
    const container = document.getElementById('interactive-stars');
    if (!container) return;
    const stars = container.querySelectorAll('.interactive-star');
    const ratingInput = document.getElementById('review-rating-value');

    function updateStars(val) {
      stars.forEach(star => {
        const starVal = parseInt(star.dataset.value);
        if (starVal <= val) {
          star.style.color = 'var(--color-primary)';
        } else {
          star.style.color = 'var(--color-border)';
        }
      });
    }

    stars.forEach(star => {
      star.style.transition = 'color 0.15s ease, transform 0.1s ease';
      star.addEventListener('mouseenter', () => {
        updateStars(parseInt(star.dataset.value));
        star.style.transform = 'scale(1.2)';
      });
      star.addEventListener('mouseleave', () => {
        const currentRating = parseInt(ratingInput.value) || 0;
        updateStars(currentRating);
        star.style.transform = 'scale(1)';
      });
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value);
        ratingInput.value = val;
        updateStars(val);
      });
    });

    container.addEventListener('mouseleave', () => {
      const currentRating = parseInt(ratingInput.value) || 0;
      updateStars(currentRating);
    });

    updateStars(0);
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    const ratingInput = document.getElementById('review-rating-value');
    const ratingVal = parseInt(ratingInput.value);
    if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
      if (typeof WowApp !== 'undefined') {
        WowApp.showToast('Please select a star rating.', '⚠️');
      } else {
        alert('Please select a star rating.');
      }
      return;
    }

    const textInput = document.getElementById('review-text-input');
    const text = textInput.value.trim();
    if (!text) return;

    const petSelect = document.getElementById('review-pet-select');
    const petId = petSelect.value;

    const user = typeof WowFirebase !== 'undefined' ? WowFirebase.getCurrentUser() : null;
    const authorName = user ? (user.displayName || user.email.split('@')[0]) : 'Anonymous';

    let avatar = '👤';
    let petSubtitle = 'Verified Buyer';

    if (petId !== 'self') {
      const pets = WowStore.getPets();
      const selectedPet = pets.find(p => p.id == petId);
      if (selectedPet) {
        avatar = selectedPet.emoji || '🐾';
        petSubtitle = `Reviewed by ${selectedPet.name} — ${selectedPet.breed || selectedPet.species} ${selectedPet.emoji || ''}`;
      }
    }

    const review = {
      id: Date.now(),
      productId: product.id,
      author: authorName,
      rating: ratingVal,
      text: text,
      pet: petSubtitle,
      date: new Date().toISOString().split('T')[0],
      avatar: avatar
    };

    WowStore.addReview(product.id, review);

    if (typeof WowApp !== 'undefined') {
      WowApp.showToast('Review submitted successfully!', '✨');
      if (typeof WowAnimations !== 'undefined' && WowAnimations.confetti) {
        WowAnimations.confetti();
      }
    }

    // Reset and close
    document.getElementById('review-write-form').reset();
    ratingInput.value = '0';
    const starsContainer = document.getElementById('interactive-stars');
    if (starsContainer) {
      starsContainer.querySelectorAll('.interactive-star').forEach(star => {
        star.style.color = 'var(--color-border)';
      });
    }
    
    const formContainer = document.getElementById('review-write-form-container');
    if (formContainer) {
      formContainer.style.display = 'none';
    }

    renderTabs();
    switchTab(3);
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
          `).join('')}
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

  // Listen for user login/logout to refresh reviews tab UI
  window.addEventListener('userLoggedIn', () => {
    if (product) {
      renderTabs();
      if (autoOpenReviewForm) {
        switchTab(3);
        const formContainer = document.getElementById('review-write-form-container');
        if (formContainer) {
          formContainer.style.display = 'block';
          formContainer.scrollIntoView({ behavior: 'smooth' });
        }
        autoOpenReviewForm = false;
      }
    }
  });

  window.addEventListener('userLoggedOut', () => {
    if (product) {
      renderTabs();
    }
  });

  return { 
    init, 
    switchImage, 
    setSubscribe, 
    setFrequency, 
    changeQty, 
    addToCart, 
    toggleWishlist, 
    switchTab, 
    addBundle, 
    toggleVideo,
    toggleReviewForm,
    handleReviewSubmit
  };
})();
