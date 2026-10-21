const CACHE_NAME = 'radar-egypt-v49-PRODUCTION';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      '/',
      '/manifest.json'
    ])).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // NEVER cache Vite dev server chunks, HMR updates, or dev modules
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
    return; // Pass through to network directly
  }

  // Network first for HTML / navigation
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Only cache static production assets (e.g. /assets/, /pwa-*.png)
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone).catch(() => {});
            });
          }
          return res;
        }).catch(() => response);
      })
    );
  }
});
