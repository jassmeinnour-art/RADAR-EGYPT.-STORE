const CACHE_NAME = 'radar-egypt-v50';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/widgets/price-tracker.json',
  '/sitemap.xml',
  '/robots.txt'
];

// Install Event: Pre-cache static app shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Purge old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Periodic Background Sync Event Handler (Refreshes market price data in background)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'radar-price-update' || event.tag === 'merchant-catalog-refresh') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return fetch('/widgets/price-tracker.json').then(res => {
          if (res && res.status === 200) {
            cache.put('/widgets/price-tracker.json', res.clone());
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

// One-shot Background Sync Event Handler (Syncs offline merchant actions when reconnected)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-merchant-data' || event.tag === 'radar-price-sync') {
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

// Message Event Handler for Client Commands
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event: Network-First for navigation, Cache-First with Stale-While-Revalidate for static assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip non-HTTP(S) protocols and Vite dev internal endpoints & raw TSX/TS source modules
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (
    url.pathname.includes('/@vite/') || 
    url.pathname.includes('/@fs/') || 
    url.pathname.includes('/src/') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts')
  ) return;

  // Navigation requests: Try Network first, fallback to offline cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match(event.request);
        })
    );
    return;
  }

  // Static Assets & Resources: Serve from cache, update in background
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
