const CACHE_NAME = 'radar-egypt-v51';
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

// Periodic Background Sync Event Handler (Refreshes market price data & new content in background)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'radar-price-update' || event.tag === 'merchant-catalog-refresh' || event.tag === 'fetch-new-content') {
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

// Message Event Handler for Client Commands
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event: Cache-First strategy for static assets, Network-First for navigation
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
        .then(async networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match('/index.html');
          return cached || fetch(event.request);
        })
    );
    return;
  }

  // Cache-First strategy for static assets and cached resources
  event.respondWith(async () => {
    const cache = await caches.open(CACHE_NAME);

    // match the request to our cache
    const cachedResponse = await cache.match(event.request);

    // check if we got a valid response
    if (cachedResponse !== undefined) {
      // Cache hit, return the resource
      return cachedResponse;
    } else {
      // Otherwise, go to the network and populate cache
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        return cachedResponse;
      }
    }
  });
});
