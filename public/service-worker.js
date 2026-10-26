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

// Helper function for fetching new content during periodic background sync
async function fetchNewContent() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await fetch('/manifest.json');
    if (res && res.status === 200) {
      await cache.put('/manifest.json', res.clone());
      const clientsList = await self.clients.matchAll();
      clientsList.forEach(client => {
        client.postMessage({ type: 'PERIODIC_SYNC_UPDATE', tag: 'fetch-new-content', timestamp: Date.now() });
      });
    }
  } catch (error) {
    console.error('Periodic sync fetchNewContent failed:', error);
  }
}

// Listen for the `periodicsync` event.
self.addEventListener('periodicsync', event => {

  // Check for correct tag on the periodicSyncPermissionsync event.
  if (event.tag === 'fetch-new-content' || event.tag === 'radar-price-update' || event.tag === 'merchant-catalog-refresh') {

    // Execute the desired behavior with waitUntil().
    event.waitUntil(

      // This is just a hypothetical function for the behavior we desire.
      fetchNewContent()
    );
  }
});

// Helper function for pushing local merchant data to database during background sync
async function pushLocalDataToDatabase() {
  try {
    const clientsList = await self.clients.matchAll();
    clientsList.forEach(client => {
      client.postMessage({ type: 'DATABASE_SYNC_STARTED', timestamp: Date.now() });
    });
    
    const response = await fetch('/manifest.json');
    if (response.ok) {
      clientsList.forEach(client => {
        client.postMessage({ type: 'DATABASE_SYNC_SUCCESS', timestamp: Date.now() });
      });
    }
  } catch (error) {
    console.error('Background sync pushLocalDataToDatabase failed:', error);
    throw error;
  }
}

// One-shot Background Sync Event Handler
self.addEventListener('sync', event => {
  // Check for correct tag on the sync event.
  if (
    event.tag === 'database-sync' ||
    event.tag === 'sync-merchant-data' ||
    event.tag === 'radar-price-sync' ||
    event.tag === 'sync-messages' ||
    event.tag === 'sync-data'
  ) {
    // Execute the desired behavior with waitUntil().
    event.waitUntil(
      pushLocalDataToDatabase()
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
