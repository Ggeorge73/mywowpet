/* ============================================
   My Wow Pet - Service Worker
   Caches core shell for installable app loading
   ============================================ */

const CACHE_NAME = 'mywowpet-v6';
const CORE_ASSETS = [
  './',
  'index.html',
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
  'js/flash-sale.js',
  'js/pet-cursor.js',
  'js/quickview.js',
  'js/shopify-guardrails.js',
  'js/social-proof.js',
  'js/spinwheel.js',
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS.map(cacheUrl)))
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
          if (!response || response.status !== 200) return response;
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
        fetch(request).then((response) => {
          if (!response || response.status !== 200) return;
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
        }).catch(() => {});
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
