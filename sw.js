// ============================================================================
// Service Worker (sw.js) - RADAR EGYPT (رادار التاجر الذكي)
// CacheFirst for Static Assets & NetworkFirst for Dynamic Routes
// Integrated Network Status Detection & Client Notification for Auto-Sync
// ============================================================================

const CACHE_VERSION = 'v1.3.1';
const STATIC_CACHE = `radar-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `radar-images-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `radar-dynamic-${CACHE_VERSION}`;

// Core static assets and icons to precache during install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/bayyaa-logo.jpg'
];

// Offline Fallback SVG for images
const OFFLINE_IMAGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="#0f172a">
  <rect width="100" height="100" rx="16" fill="#1e293b"/>
  <path d="M35 40a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-15 35h60l-18-24-15 20-9-12-18 16z" fill="#f59e0b" opacity="0.6"/>
</svg>`;

// Offline App Shell HTML Fallback
const OFFLINE_PAGE_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>رادار التاجر الذكي - وضع غير متصل</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background-color: #020617;
      color: #f8fafc;
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      direction: rtl;
    }
    .card {
      background: #0f172a;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .icon {
      width: 72px;
      height: 72px;
      margin-bottom: 20px;
    }
    h2 {
      color: #fbbf24;
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 900;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.8;
      margin: 0 0 24px 0;
    }
    .btn {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #020617;
      font-weight: 800;
      border: none;
      padding: 12px 28px;
      border-radius: 14px;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="card">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
    <h2>أنت تعمل حالياً في وضع دون اتصال (Offline)</h2>
    <p>تعذر الاتصال بالشبكة. يمكنك الاستمرار في استخدام البيانات المحفوظة محلياً أو إعادة المحاولة عند استعادة الإنترنت.</p>
    <button class="btn" onclick="window.location.reload();">إعادة محاولة الاتصال 🔄</button>
  </div>
</body>
</html>`;

// ----------------------------------------------------------------------------
// Network State Tracking & Client Notification Logic
// ----------------------------------------------------------------------------
let isNetworkDown = false;
let lastOnlineNotificationTime = 0;

/**
 * Broadcasts network status change to all open browser tabs/windows
 * Specifically signals RETRIGGER_AUTO_SYNC when network is restored
 */
async function notifyClientsNetworkOnline(reason = 'network_reconnected') {
  const now = Date.now();
  // Throttle repeated notifications within 2 seconds
  if (now - lastOnlineNotificationTime < 2000) {
    return;
  }
  lastOnlineNotificationTime = now;

  try {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({
        type: 'ONLINE_STATUS_CHANGE',
        status: 'online',
        isOnline: true,
        action: 'RETRIGGER_AUTO_SYNC',
        reason: reason,
        timestamp: now
      });
    }
    console.log(`[SW] Broadcasted ONLINE_STATUS_CHANGE (reason: ${reason}) to ${clients.length} clients`);
  } catch (err) {
    console.warn('[SW] Could not notify clients of network status change:', err);
  }
}

async function notifyClientsNetworkOffline(reason = 'network_disconnected') {
  try {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({
        type: 'ONLINE_STATUS_CHANGE',
        status: 'offline',
        isOnline: false,
        action: 'PAUSE_SYNC',
        reason: reason,
        timestamp: Date.now()
      });
    }
  } catch (err) {
    console.warn('[SW] Could not notify clients of offline status:', err);
  }
}

// ----------------------------------------------------------------------------
// 1. Install Event: Precache Core Assets
// ----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache skipped for ${url}:`, err.message || err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ----------------------------------------------------------------------------
// 2. Activate Event: Clean up outdated caches & Claim Clients
// ----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== IMAGE_CACHE &&
            cacheName !== DYNAMIC_CACHE
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ----------------------------------------------------------------------------
// 3. Background Sync & Periodic Sync: Native Reconnection Triggers
// ----------------------------------------------------------------------------
self.addEventListener('sync', (event) => {
  isNetworkDown = false;
  event.waitUntil(
    notifyClientsNetworkOnline(`background_sync:${event.tag}`)
  );
});

self.addEventListener('periodicsync', (event) => {
  isNetworkDown = false;
  event.waitUntil(
    notifyClientsNetworkOnline(`periodic_sync:${event.tag}`)
  );
});

// ----------------------------------------------------------------------------
// 4. Message Event: Skip waiting or respond to client network pings
// ----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CHECK_NETWORK_STATUS') {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : !isNetworkDown;
    if (isOnline) {
      notifyClientsNetworkOnline('client_check_ping');
    }
  }
});

// Helper: Check if request is an image or icon
function isImageOrIcon(request, url) {
  if (request.destination === 'image') return true;
  const path = url.pathname.toLowerCase();
  return (
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.svg') ||
    path.endsWith('.webp') ||
    path.endsWith('.gif') ||
    path.endsWith('.ico') ||
    url.hostname.includes('cdn.simpleicons.org') ||
    url.hostname.includes('upload.wikimedia.org')
  );
}

// Helper: Check if request is a static asset (CSS, JS, Fonts, Assets folder)
function isStaticAsset(request, url) {
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    return true;
  }
  const path = url.pathname.toLowerCase();
  return (
    path.includes('/assets/') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.woff2') ||
    path.endsWith('.woff') ||
    path.endsWith('.ttf')
  );
}

// ----------------------------------------------------------------------------
// 5. CacheFirst Strategy: For Static Assets (Images, Icons, CSS, JS)
// ----------------------------------------------------------------------------
async function cacheFirst(request, cacheName, isImage = false) {
  const cache = await caches.open(cacheName);

  // 1. Try Cache First
  const cached = (await cache.match(request)) || (await caches.match(request));
  if (cached) {
    return cached;
  }

  // 2. Fallback to Network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
      cache.put(request, networkResponse.clone());
      // If we previously marked network as down and fetch succeeded, recover!
      if (isNetworkDown) {
        isNetworkDown = false;
        notifyClientsNetworkOnline('static_asset_fetch_recovered');
      }
    }
    return networkResponse;
  } catch (err) {
    // 3. Fallback when network is unavailable
    if (isImage) {
      return new Response(OFFLINE_IMAGE_SVG, {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    return cached || new Response('Offline: Resource not available', { status: 503 });
  }
}

// ----------------------------------------------------------------------------
// 6. NetworkFirst Strategy: For Dynamic Routes & Navigation
// ----------------------------------------------------------------------------
async function networkFirst(request, cacheName, isNavigation = false) {
  const cache = await caches.open(cacheName);

  try {
    // 1. Try Network First
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      if (isNavigation) {
        cache.put('/index.html', networkResponse.clone());
      }
      // If we previously flagged network failure, broadcast online recovery!
      if (isNetworkDown) {
        isNetworkDown = false;
        notifyClientsNetworkOnline('network_first_fetch_recovered');
      }
    }
    return networkResponse;
  } catch (err) {
    // 2. Network Failed (Offline) - Mark offline and notify clients
    if (!isNetworkDown) {
      isNetworkDown = true;
      notifyClientsNetworkOffline('network_first_fetch_failed');
    }

    const cached =
      (await cache.match(request)) ||
      (await cache.match('/index.html')) ||
      (await caches.match('/index.html')) ||
      (await caches.match('/'));

    if (cached) {
      return cached;
    }

    // 3. Fallback to Offline Page for navigation or JSON for APIs
    if (isNavigation) {
      return new Response(OFFLINE_PAGE_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return new Response(
      JSON.stringify({
        offline: true,
        error: 'أنت في وضع عدم الاتصال بالإنترنت حالياً (Offline Mode)',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

// ----------------------------------------------------------------------------
// 7. Fetch Event Listener
// ----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests with HTTP/HTTPS
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // Skip Vite HMR, dev tools, WebSockets, and live Supabase/Firebase Auth & REST APIs
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.in') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('hot-update') ||
    url.search.includes('v=')
  ) {
    return;
  }

  // --- Strategy 1: CacheFirst for Images & Icons ---
  if (isImageOrIcon(request, url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, true));
    return;
  }

  // --- Strategy 2: CacheFirst for Static Assets (CSS, JS, Fonts) ---
  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, false));
    return;
  }

  // --- Strategy 3: NetworkFirst for Dynamic Routes & Navigation ---
  if (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    url.pathname.startsWith('/traders/') ||
    url.pathname.startsWith('/products/')
  ) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, true));
    return;
  }

  // --- Strategy 4: NetworkFirst for Dynamic API endpoints ---
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, false));
    return;
  }

  // Default: NetworkFirst
  event.respondWith(networkFirst(request, DYNAMIC_CACHE, false));
});
