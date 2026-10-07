/* ============================================
   My Wow Pet - Service Worker
   Caches core shell for installable app loading
   ============================================ */

// Bump the version on every deploy that changes precached files.
const CACHE_NAME = 'mywowpet-v9-2026-10-07';
const CORE_ASSETS = [
  './',
  'index.html',
  'home.html',
  'shop.html',
  'product.html',
  'cart.html',
  'checkout.html',
  'profile.html',
  'subscribe.html',
  'game.html',
  'check.html',
  'help.html',
  'shipping.html',
  'returns.html',
  'contact.html',
  'tracking.html',
  'manifest.json',
  'css/variables.css',
  'css/base.css',
  'css/components.css',
  'css/layout.css',
  'css/pages.css',
  'css/auth-modal.css',
  'css/pet-cursor.css',
  'css/game.css',
  'css/check.css',
  'js/store.js',
  'js/app.js',
  'js/animations.js',
  'js/shop.js',
  'js/product.js',
  'js/cart.js',
  'js/checkout.js',
  'js/profile.js',
  'js/subscribe.js',
  'js/game.js',
  'js/check.js',
  'js/firebase-db.js',
  'js/pet-cursor.js',
  'js/quickview.js',
  'js/shopify-guardrails.js',
  'js/streak.js',
  'assets/images/bird_pet.jpg',
  'assets/images/cat_accessories.jpg',
  'assets/images/cat_food.jpg',
  'assets/images/cat_toy.jpg',
  'assets/images/cat_treats.jpg',
  'assets/images/dog_accessories.jpg',
  'assets/images/dog_bed.jpg',
  'assets/images/dog_food.jpg',
  'assets/images/dog_toy.jpg',
  'assets/images/dog_treats.jpg',
  'assets/images/health_supplement.jpg',
  'assets/images/hero.jpg',
  'assets/images/small_pet.jpg',
  'assets/images/icon-192x192.png',
  'assets/images/icon-512x512.png'
];

const cacheUrl = (path) => new URL(path, self.registration.scope).toString();

// Firebase Hosting runs with cleanUrls, so /shop.html answers with a 301 to /shop.
// A redirected Response cannot be used to answer a navigation, so copy it into a
// plain Response before it goes into the cache.
const toCacheable = (response) => {
  if (!response.redirected) return response;
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
};

const precache = (cache, path) => {
  const url = cacheUrl(path);
  // cache: 'reload' bypasses the HTTP cache so a new SW never re-caches stale files.
  return fetch(new Request(url, { cache: 'reload' })).then((response) => {
    if (!response.ok) throw new Error(`Precache failed for ${url}: ${response.status}`);
    const finalUrl = response.redirected ? response.url : null;
    const body = toCacheable(response);
    if (!finalUrl || finalUrl === url) return cache.put(url, body);
    // Store under both the requested URL and the clean URL it redirected to.
    return Promise.all([cache.put(url, body.clone()), cache.put(finalUrl, body)]);
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(CORE_ASSETS.map((path) => precache(cache, path))))
      .then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.redirected) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(cacheUrl('index.html'));
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Revalidate against the server, not the HTTP cache.
        fetch(request, { cache: 'no-cache' }).then((response) => {
          if (!response || response.status !== 200) return;
          caches.open(CACHE_NAME).then((cache) => cache.put(request, toCacheable(response)));
        }).catch(() => {});
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = toCacheable(response.clone());
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
