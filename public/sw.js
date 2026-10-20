const CACHE_NAME = 'cool-cache';

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico'
];

// Listener for the install event - pre-caches our assets list on service worker install.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);
    } catch (err) {
      console.warn('[cool-cache] Precache fallback notice:', err);
    }
  })());
});

// Listener for the activate event - takes immediate control of clients.
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Import existing comprehensive PWA runtime features
try {
  importScripts('/service-worker.js');
} catch (e) {
  console.warn('[sw.js] service-worker.js import warning:', e);
}
