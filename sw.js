/* ============================================
   My Wow Pet — Service Worker
   Caches core shell for offline/fast loading
   ============================================ */

const CACHE_NAME = 'mywowpet-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/shop.html',
  '/product.html',
  '/cart.html',
  '/checkout.html',
  '/profile.html',
  '/subscribe.html',
  '/game.html',
  '/journey.html',
  '/check.html',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/pages.css',
  '/css/auth-modal.css',
  '/css/pet-cursor.css',
  '/css/game.css',
  '/css/journey.css',
  '/css/check.css',
  '/js/store.js',
  '/js/app.js',
  '/js/shop.js',
  '/js/product.js',
  '/js/cart.js',
  '/js/checkout.js',
  '/js/profile.js',
  '/js/subscribe.js',
  '/assets/images/icon-192x192.png',
  '/assets/images/icon-512x512.png'
];

// ---- Install: Cache Core Shell ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---- Activate: Clean Old Caches ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ---- Fetch: Network-First with Cache Fallback ----
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  // For navigation requests (HTML pages): Network first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the fresh response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // For static assets (CSS, JS, images): Cache first, fall back to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Serve from cache immediately, but also update cache in background
        fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
        }).catch(() => {});
        return cached;
      }
      // Not in cache: fetch from network and cache
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
