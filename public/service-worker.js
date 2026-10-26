// Service Worker for Merchant Radar Egypt (PWA Builder 100% compliant)
const CACHE_NAME = 'merchant-radar-cache-v6.0-pure-white-black';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// Install Event - Precache Core Static Icons
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up All Old Caches Immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Periodic Background Sync Event Handler
self.addEventListener('periodicsync', event => {
  if (event.tag === 'radar-price-update' || event.tag === 'merchant-catalog-refresh' || event.tag === 'fetch-new-content') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return fetch('/manifest.json').then(res => {
          if (res && res.status === 200) {
            cache.put('/manifest.json', res.clone());
            return self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({ type: 'PERIODIC_SYNC_UPDATE', tag: event.tag, timestamp: Date.now() });
              });
            });
          }
        }).catch(() => {});
      })
    );
  }
});

// One-shot Background Sync Event Handler
self.addEventListener('sync', event => {
  if (
    event.tag === 'sync-merchant-data' ||
    event.tag === 'radar-price-sync' ||
    event.tag === 'sync-messages' ||
    event.tag === 'sync-data'
  ) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return fetch('/manifest.json').then(res => {
          if (res && res.status === 200) {
            cache.put('/manifest.json', res.clone());
            return self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({ type: 'BACKGROUND_SYNC_COMPLETE', tag: event.tag, timestamp: Date.now() });
              });
            });
          }
        }).catch(() => {});
      })
    );
  }
});

// Fetch Event - Network First for HTML/JS/CSS to prevent stale bundle white screens
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);
  if (
    url.hostname.includes('run.app') ||
    url.hostname === 'localhost' ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/src/') ||
    url.search.includes('v=') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // Handle API or dynamic routes with Network First
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline', offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Always use Network First for navigation (index.html) and scripts/styles
  const isNavOrAsset =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.url.includes('/assets/');

  if (isNavOrAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
        })
    );
    return;
  }

  // For images/icons/fonts: Network First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
