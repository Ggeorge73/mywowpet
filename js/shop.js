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
      `<button type="button" class="filter-option ${activeFilters.petType === c.id ? 'active' : ''}" aria-pressed="${activeFilters.petType === c.id ? 'true' : 'false'}" data-filter-id="petType:${c.id}" onclick="ShopPage.toggleFilter('petType', '${c.id}')">
        <span class="filter-checkbox" aria-hidden="true">${activeFilters.petType === c.id ? '✓' : ''}</span>
        <span>${c.icon} ${c.name}</span>
      </button>`
    ).join('');

    const catOptions = WowStore.productCategories.map(c =>
      `<button type="button" class="filter-option ${activeFilters.category === c.id ? 'active' : ''}" aria-pressed="${activeFilters.category === c.id ? 'true' : 'false'}" data-filter-id="category:${c.id}" onclick="ShopPage.toggleFilter('category', '${c.id}')">
        <span class="filter-checkbox" aria-hidden="true">${activeFilters.category === c.id ? '✓' : ''}</span>
        <span>${c.icon} ${c.name}</span>
      </button>`
    ).join('');

    const dietaryOptions = WowStore.filters.dietary.map(d =>
      `<button type="button" class="filter-option ${activeFilters.dietary.includes(d.id) ? 'active' : ''}" aria-pressed="${activeFilters.dietary.includes(d.id) ? 'true' : 'false'}" data-filter-id="dietary:${d.id}" onclick="ShopPage.toggleArrayFilter('dietary', '${d.id}')">
        <span class="filter-checkbox" aria-hidden="true">${activeFilters.dietary.includes(d.id) ? '✓' : ''}</span>
        <span>${d.label}</span>
      </button>`
    ).join('');

    const lifeStageOptions = WowStore.filters.lifeStage.map(ls =>
      `<button type="button" class="filter-option ${activeFilters.lifeStage.includes(ls.id) ? 'active' : ''}" aria-pressed="${activeFilters.lifeStage.includes(ls.id) ? 'true' : 'false'}" data-filter-id="lifeStage:${ls.id}" onclick="ShopPage.toggleArrayFilter('lifeStage', '${ls.id}')">
        <span class="filter-checkbox" aria-hidden="true">${activeFilters.lifeStage.includes(ls.id) ? '✓' : ''}</span>
        <span>${ls.label}</span>
      </button>`
    ).join('');

    const breedSizeOptions = WowStore.filters.breedSize.map(bs =>
      `<button type="button" class="filter-option ${activeFilters.breedSize.includes(bs.id) ? 'active' : ''}" aria-pressed="${activeFilters.breedSize.includes(bs.id) ? 'true' : 'false'}" data-filter-id="breedSize:${bs.id}" onclick="ShopPage.toggleArrayFilter('breedSize', '${bs.id}')">
        <span class="filter-checkbox" aria-hidden="true">${activeFilters.breedSize.includes(bs.id) ? '✓' : ''}</span>
        <span>${bs.label}</span>
      </button>`
    ).join('');

    container.innerHTML = `
      <div class="filter-group open">
        <button type="button" class="filter-group-header" aria-expanded="true" onclick="ShopPage.toggleGroup(this)">
          <span>Pet Type</span><span class="chevron" aria-hidden="true">▾</span>
        </button>
        <div class="filter-group-body">${petOptions}</div>
      </div>
      <div class="filter-group open">
        <button type="button" class="filter-group-header" aria-expanded="true" onclick="ShopPage.toggleGroup(this)">
          <span>Category</span><span class="chevron" aria-hidden="true">▾</span>
        </button>
        <div class="filter-group-body">${catOptions}</div>
      </div>
      <div class="filter-group ${activeFilters.dietary.length ? 'open' : ''}">
        <button type="button" class="filter-group-header" aria-expanded="${activeFilters.dietary.length ? 'true' : 'false'}" onclick="ShopPage.toggleGroup(this)">
          <span>Dietary Needs</span><span class="chevron" aria-hidden="true">▾</span>
        </button>
        <div class="filter-group-body">${dietaryOptions}</div>
      </div>
      <div class="filter-group ${activeFilters.lifeStage.length ? 'open' : ''}">
        <button type="button" class="filter-group-header" aria-expanded="${activeFilters.lifeStage.length ? 'true' : 'false'}" onclick="ShopPage.toggleGroup(this)">
          <span>Life Stage</span><span class="chevron" aria-hidden="true">▾</span>
        </button>
        <div class="filter-group-body">${lifeStageOptions}</div>
      </div>
      <div class="filter-group ${activeFilters.breedSize.length ? 'open' : ''}">
        <button type="button" class="filter-group-header" aria-expanded="${activeFilters.breedSize.length ? 'true' : 'false'}" onclick="ShopPage.toggleGroup(this)">
          <span>Breed Size</span><span class="chevron" aria-hidden="true">▾</span>
        </button>
        <div class="filter-group-body">${breedSizeOptions}</div>
      </div>
      ${WowStore.FEATURES.subscriptions ? `<div class="filter-group">
        <button type="button" class="filter-group-header" aria-expanded="false" onclick="ShopPage.toggleGroup(this)">
          <span>Subscription</span><span class="chevron" aria-hidden="true">▾</span>
        </button>
        <div class="filter-group-body">
          <button type="button" class="filter-option ${activeFilters.subscribable ? 'active' : ''}" aria-pressed="${activeFilters.subscribable ? 'true' : 'false'}" data-filter-id="subscribable" onclick="ShopPage.toggleFilter('subscribable', !ShopPage.getFilters().subscribable)">
            <span class="filter-checkbox" aria-hidden="true">${activeFilters.subscribable ? '✓' : ''}</span>
            <span>Subscribe & Save eligible</span>
          </button>
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

  function toggleGroup(header) {
    const open = header.parentElement.classList.toggle('open');
    header.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function refresh() {
    // Filters are re-rendered on every change; keep keyboard focus on the option that was used.
    const focused = document.activeElement;
    const focusId = focused && focused.dataset ? focused.dataset.filterId : null;
    const focusSidebar = focusId ? focused.closest('[id^="filter-sidebar"]') : null;
    renderFilters('filter-sidebar');
    renderFilters('filter-sidebar-mobile');
    if (focusId && focusSidebar) {
      const target = [...focusSidebar.querySelectorAll('[data-filter-id]')].find(el => el.dataset.filterId === focusId);
      if (target) target.focus();
    }
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

  return { init, toggleFilter, toggleArrayFilter, toggleGroup, refresh, clearSearch, getFilters };
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
