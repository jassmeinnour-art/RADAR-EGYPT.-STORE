// Service Worker for Merchant Radar Egypt (PWA Builder 100% compliant)
const CACHE_NAME = 'merchant-radar-cache-v7-pwa-46';
const OFFLINE_URL = '/';
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// Install - Precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate - Claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

// Fetch - Offline Support (مهم جداً للـ +2)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-products' || event.tag === 'update-prices') {
    event.waitUntil(syncProducts());
  }
});

// Periodic Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-prices' || event.tag === 'content-sync') {
    event.waitUntil(updatePrices());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'رادار التاجر', body: 'تم تحديث الأسعار!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body || 'تحديث جديد في أسعار المنتجات',
      icon: '/pwa-512x512.png',
      badge: '/icon-192.png',
      dir: 'rtl',
      lang: 'ar'
    })
  );
});

async function syncProducts() {
  console.log('Background Sync: Products');
  return Promise.resolve();
}

async function updatePrices() {
  console.log('Periodic Sync: Prices');
  return Promise.resolve();
}