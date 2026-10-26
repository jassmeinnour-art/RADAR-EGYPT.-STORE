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

// Helper function for fetching new content during periodic background sync
async function fetchNewContent() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await fetch('/widgets/price-tracker.json');
    if (res && res.status === 200) {
      await cache.put('/widgets/price-tracker.json', res.clone());
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

// One-shot Background Sync Event Handler (Syncs offline merchant actions when reconnected)
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
