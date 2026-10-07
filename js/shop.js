/* ============================================
   WowPetStore — Shop Page Logic
   Filtering, sorting, rendering
   ============================================ */

const ShopPage = (() => {
  let activeFilters = {
    petType: null,
    category: null,
    dietary: [],
    lifeStage: [],
    breedSize: [],
    subscribable: false,
    search: '',
    sort: 'bestselling'
  };

  const SORT_OPTIONS = ['bestselling', 'price-low', 'price-high', 'rating', 'newest'];
  const esc = WowStore.escapeHTML;

  function init() {
    readURLParams();
    renderFilters('filter-sidebar');
    renderFilters('filter-sidebar-mobile');
    renderProducts();
    renderActiveChips();
    updateBreadcrumbs();
    updateTitle();
  }

  function readURLParams() {
    const params = new URLSearchParams(window.location.search);
    // pet/category/sort must be known ids; anything else from the URL is dropped.
    const pet = params.get('pet');
    const category = params.get('category');
    const sort = params.get('sort');
    if (pet && WowStore.categories.some(c => c.id === pet)) activeFilters.petType = pet;
    if (category && WowStore.productCategories.some(c => c.id === category)) activeFilters.category = category;
    if (params.get('search')) activeFilters.search = params.get('search');
    if (sort && SORT_OPTIONS.includes(sort)) activeFilters.sort = sort;
  }

  function renderFilters(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const petOptions = WowStore.categories.map(c =>
      `<div class="filter-option ${activeFilters.petType === c.id ? 'active' : ''}" onclick="ShopPage.toggleFilter('petType', '${c.id}')">
        <div class="filter-checkbox">${activeFilters.petType === c.id ? '✓' : ''}</div>
        <span>${c.icon} ${c.name}</span>
      </div>`
    ).join('');

    const catOptions = WowStore.productCategories.map(c =>
      `<div class="filter-option ${activeFilters.category === c.id ? 'active' : ''}" onclick="ShopPage.toggleFilter('category', '${c.id}')">
        <div class="filter-checkbox">${activeFilters.category === c.id ? '✓' : ''}</div>
        <span>${c.icon} ${c.name}</span>
      </div>`
    ).join('');

    const dietaryOptions = WowStore.filters.dietary.map(d =>
      `<div class="filter-option ${activeFilters.dietary.includes(d.id) ? 'active' : ''}" onclick="ShopPage.toggleArrayFilter('dietary', '${d.id}')">
        <div class="filter-checkbox">${activeFilters.dietary.includes(d.id) ? '✓' : ''}</div>
        <span>${d.label}</span>
      </div>`
    ).join('');

    const lifeStageOptions = WowStore.filters.lifeStage.map(ls =>
      `<div class="filter-option ${activeFilters.lifeStage.includes(ls.id) ? 'active' : ''}" onclick="ShopPage.toggleArrayFilter('lifeStage', '${ls.id}')">
        <div class="filter-checkbox">${activeFilters.lifeStage.includes(ls.id) ? '✓' : ''}</div>
        <span>${ls.label}</span>
      </div>`
    ).join('');

    const breedSizeOptions = WowStore.filters.breedSize.map(bs =>
      `<div class="filter-option ${activeFilters.breedSize.includes(bs.id) ? 'active' : ''}" onclick="ShopPage.toggleArrayFilter('breedSize', '${bs.id}')">
        <div class="filter-checkbox">${activeFilters.breedSize.includes(bs.id) ? '✓' : ''}</div>
        <span>${bs.label}</span>
      </div>`
    ).join('');

    container.innerHTML = `
      <div class="filter-group open">
        <div class="filter-group-header" onclick="this.parentElement.classList.toggle('open')">
          <span>Pet Type</span><span class="chevron">▾</span>
        </div>
        <div class="filter-group-body">${petOptions}</div>
      </div>
      <div class="filter-group open">
        <div class="filter-group-header" onclick="this.parentElement.classList.toggle('open')">
          <span>Category</span><span class="chevron">▾</span>
        </div>
        <div class="filter-group-body">${catOptions}</div>
      </div>
      <div class="filter-group ${activeFilters.dietary.length ? 'open' : ''}">
        <div class="filter-group-header" onclick="this.parentElement.classList.toggle('open')">
          <span>Dietary Needs</span><span class="chevron">▾</span>
        </div>
        <div class="filter-group-body">${dietaryOptions}</div>
      </div>
      <div class="filter-group ${activeFilters.lifeStage.length ? 'open' : ''}">
        <div class="filter-group-header" onclick="this.parentElement.classList.toggle('open')">
          <span>Life Stage</span><span class="chevron">▾</span>
        </div>
        <div class="filter-group-body">${lifeStageOptions}</div>
      </div>
      <div class="filter-group ${activeFilters.breedSize.length ? 'open' : ''}">
        <div class="filter-group-header" onclick="this.parentElement.classList.toggle('open')">
          <span>Breed Size</span><span class="chevron">▾</span>
        </div>
        <div class="filter-group-body">${breedSizeOptions}</div>
      </div>
      ${WowStore.FEATURES.subscriptions ? `<div class="filter-group">
        <div class="filter-group-header" onclick="this.parentElement.classList.toggle('open')">
          <span>Subscription</span><span class="chevron">▾</span>
        </div>
        <div class="filter-group-body">
          <div class="filter-option ${activeFilters.subscribable ? 'active' : ''}" onclick="ShopPage.toggleFilter('subscribable', !ShopPage.getFilters().subscribable)">
            <div class="filter-checkbox">${activeFilters.subscribable ? '✓' : ''}</div>
            <span>Subscribe & Save eligible</span>
          </div>
        </div>
      </div>` : ''}
    `;
  }

  function toggleFilter(key, value) {
    if (key === 'subscribable') {
      activeFilters.subscribable = value;
    } else if (activeFilters[key] === value) {
      activeFilters[key] = null;
    } else {
      activeFilters[key] = value;
    }
    refresh();
  }

  function toggleArrayFilter(key, value) {
    const idx = activeFilters[key].indexOf(value);
    if (idx > -1) {
      activeFilters[key].splice(idx, 1);
    } else {
      activeFilters[key].push(value);
    }
    refresh();
  }

  function refresh() {
    renderFilters('filter-sidebar');
    renderFilters('filter-sidebar-mobile');
    renderProducts();
    renderActiveChips();
    updateTitle();
  }

  function renderProducts() {
    const grid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    const products = WowStore.getProducts(activeFilters);

    document.getElementById('result-count').textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

    if (products.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }

    grid.style.display = '';
    noResults.style.display = 'none';
    grid.innerHTML = products.map(p => WowApp.renderProductCard(p)).join('');
    WowAnimations.init();
  }

  function renderActiveChips() {
    const container = document.getElementById('active-filters');
    const chips = [];

    if (activeFilters.petType) {
      const cat = WowStore.categories.find(c => c.id === activeFilters.petType);
      chips.push(`<span class="active-filter-chip" data-chip-action="filter" data-key="petType" data-value="${esc(activeFilters.petType)}">${esc(cat?.name || activeFilters.petType)} <span class="remove">✕</span></span>`);
    }
    if (activeFilters.category) {
      const cat = WowStore.productCategories.find(c => c.id === activeFilters.category);
      chips.push(`<span class="active-filter-chip" data-chip-action="filter" data-key="category" data-value="${esc(activeFilters.category)}">${esc(cat?.name || activeFilters.category)} <span class="remove">✕</span></span>`);
    }
    activeFilters.dietary.forEach(d => {
      const f = WowStore.filters.dietary.find(x => x.id === d);
      chips.push(`<span class="active-filter-chip" data-chip-action="array" data-key="dietary" data-value="${esc(d)}">${esc(f?.label || d)} <span class="remove">✕</span></span>`);
    });
    activeFilters.lifeStage.forEach(ls => {
      const f = WowStore.filters.lifeStage.find(x => x.id === ls);
      chips.push(`<span class="active-filter-chip" data-chip-action="array" data-key="lifeStage" data-value="${esc(ls)}">${esc(f?.label || ls)} <span class="remove">✕</span></span>`);
    });
    activeFilters.breedSize.forEach(bs => {
      const f = WowStore.filters.breedSize.find(x => x.id === bs);
      chips.push(`<span class="active-filter-chip" data-chip-action="array" data-key="breedSize" data-value="${esc(bs)}">${esc(f?.label || bs)} <span class="remove">✕</span></span>`);
    });
    if (activeFilters.subscribable) {
      chips.push(`<span class="active-filter-chip" data-chip-action="subscribable">Subscribe & Save <span class="remove">✕</span></span>`);
    }
    if (activeFilters.search) {
      chips.push(`<span class="active-filter-chip" data-chip-action="search">Search: "${esc(activeFilters.search)}" <span class="remove">✕</span></span>`);
    }

    if (chips.length > 1) {
      chips.push(`<span class="active-filter-chip" style="background: var(--color-coral); color: white;" data-chip-action="clear-all">Clear All ✕</span>`);
    }

    container.innerHTML = chips.join('');
    if (!container.dataset.chipsBound) {
      container.dataset.chipsBound = '1';
      container.addEventListener('click', onChipClick);
    }
  }

  function onChipClick(e) {
    const chip = e.target.closest('[data-chip-action]');
    if (!chip) return;
    const { chipAction, key, value } = chip.dataset;
    if (chipAction === 'filter') toggleFilter(key, value);
    else if (chipAction === 'array') toggleArrayFilter(key, value);
    else if (chipAction === 'subscribable') toggleFilter('subscribable', false);
    else if (chipAction === 'search') clearSearch();
    else if (chipAction === 'clear-all') clearAllFilters();
  }

  function clearSearch() {
    activeFilters.search = '';
    refresh();
  }

  function updateBreadcrumbs() {
    const bc = document.getElementById('breadcrumbs');
    let html = '<a href="index.html">Home</a><span class="separator">›</span>';
    if (activeFilters.petType) {
      const cat = WowStore.categories.find(c => c.id === activeFilters.petType);
      html += `<a href="shop.html">Shop</a><span class="separator">›</span><span class="current">${esc(cat?.name || activeFilters.petType)}</span>`;
    } else {
      html += '<span class="current">Shop</span>';
    }
    bc.innerHTML = html;
  }

  function updateTitle() {
    const el = document.getElementById('shop-title');
    if (activeFilters.petType) {
      const cat = WowStore.categories.find(c => c.id === activeFilters.petType);
      el.textContent = `${cat?.name || ''} Products`;
    } else if (activeFilters.search) {
      el.textContent = `Results for "${activeFilters.search}"`;
    } else {
      el.textContent = 'Shop All Products';
    }
  }

  function getFilters() { return activeFilters; }

  return { init, toggleFilter, toggleArrayFilter, refresh, clearSearch, getFilters };
})();

// Global handlers
function handleSort(value) {
  ShopPage.toggleFilter('sort', undefined);
  // Directly set sort
  const f = ShopPage.getFilters();
  f.sort = value;
  ShopPage.refresh();
}

function toggleMobileFilter() {
  document.getElementById('filter-mobile').classList.toggle('open');
  document.getElementById('filter-backdrop').classList.toggle('open');
  document.body.style.overflow = document.getElementById('filter-mobile').classList.contains('open') ? 'hidden' : '';
}

function clearAllFilters() {
  const f = ShopPage.getFilters();
  f.petType = null;
  f.category = null;
  f.dietary = [];
  f.lifeStage = [];
  f.breedSize = [];
  f.subscribable = false;
  f.search = '';
  ShopPage.refresh();
}
