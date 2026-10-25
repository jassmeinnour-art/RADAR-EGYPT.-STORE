const CACHE_NAME = 'radar-egypt-v49';
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
