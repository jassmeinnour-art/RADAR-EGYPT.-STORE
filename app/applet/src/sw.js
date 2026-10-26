const cacheName = "js13kPWA-v1";
const OFFLINE_URL = '/';

import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST || []);

const appShellFiles = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

const gamesImages = [];
const contentToCache = appShellFiles.concat(gamesImages);
contentToCache.push("/pwa-192x192.png");


self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      try {
        await cache.addAll(contentToCache);
      } catch (err) {
        console.warn("[Service Worker] Cache addAll partial warning:", err);
      }
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return undefined;
          }
          return caches.delete(key);
        }),
      ),
    ).then(() => self.clients.claim())
  );
});


// Background Sync event listener
self.addEventListener('sync', event => {
  if (event.tag === 'database-sync') {
    event.waitUntil(
      (async () => {
        console.log('[Service Worker] Sync event triggered: database-sync');
      })()
    );
  }
});

// Periodic Background Sync event listener
self.addEventListener('periodicsync', event => {
  if (event.tag === 'fetch-new-content') {
    event.waitUntil(
      (async () => {
        console.log('[Service Worker] PeriodicSync event triggered: fetch-new-content');
      })()
    );
  }
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(e.request.url);
  
  // Guard clause for development/preview tools
  if (
    url.pathname.includes('aistudio') ||
    url.pathname.includes('vite') ||
    url.pathname.includes('node_modules') ||
    url.hostname.includes('run.app') ||
    url.hostname === 'localhost' ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/src/') ||
    url.search.includes('v=') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // Handle API with Network First
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline', offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network First for Navigation
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      try {
        const response = await fetch(e.request);
        if (response && response.status === 200) {
          const cache = await caches.open(cacheName);
          console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
          cache.put(e.request, response.clone());
        }
        return response;
      } catch (err) {
        console.warn(`[Service Worker] Fetch failed for ${e.request.url}:`, err);
        if (e.request.destination === 'image') {
          return new Response(null, { status: 404 });
        }
        return new Response('Not found', { status: 404 });
      }
    })(),
  );
});

