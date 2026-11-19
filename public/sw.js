// ============================================================================
// Service Worker (sw.js) - RADAR EGYPT (رادار التاجر الذكي)
// Offline Caching, Core Asset Precache, Domain-Aligned Security & Background Sync
// Aligned strictly with permitted domains in index.html CSP
// ============================================================================

const CACHE_VERSION = 'v1.5.0';
const STATIC_CACHE = `radar-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `radar-images-${CACHE_VERSION}`;
const FONT_CACHE = `radar-fonts-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `radar-dynamic-${CACHE_VERSION}`;

const VALID_CACHES = [STATIC_CACHE, IMAGE_CACHE, FONT_CACHE, DYNAMIC_CACHE];

// Core static assets and PWA icons to precache during install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/icon-192.png',
  '/icon-512.png'
];

// External hosts explicitly allowed for offline asset caching (matched with index.html CSP)
const ALLOWED_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const ALLOWED_IMAGE_CDN_HOSTS = ['cdn.simpleicons.org', 'upload.wikimedia.org'];
const ALLOWED_APP_HOSTS = ['radaregypt.store'];

// Hosts that must ALWAYS bypass SW caching (live APIs, Auth, Analytics — matched with index.html CSP)
const BYPASS_HOSTS = [
  'supabase.co',
  'supabase.in',
  'api.supabase.co',
  'firebaseio.com',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'generativelanguage.googleapis.com',
  'www.googleapis.com',
  'oauth2.googleapis.com',
  'fcm.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'cloudflareinsights.com',
  'static.cloudflareinsights.com',
  'va.vercel-scripts.com',
  'vitals.vercel-insights.com'
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
      background-color: #08090D;
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
      border: 1px solid rgba(245, 158, 11, 0.35);
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
    <button class="btn" onclick="window.location.reload();">إعادة محاولة الاتصال</button>
  </div>
</body>
</html>`;

// ----------------------------------------------------------------------------
// Network State Tracking & Client Notification Logic
// ----------------------------------------------------------------------------
let isNetworkDown = false;
let lastOnlineNotificationTime = 0;

async function notifyClientsNetworkOnline(reason = 'network_reconnected') {
  const now = Date.now();
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
        reason,
        timestamp: now
      });
    }
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
        reason,
        timestamp: Date.now()
      });
    }
  } catch (err) {
    console.warn('[SW] Could not notify clients of offline status:', err);
  }
}

// ----------------------------------------------------------------------------
// 1. Install Event: Precache Core Static Assets
// ----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache skipped for ${url}:`, err?.message || err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ----------------------------------------------------------------------------
// 2. Activate Event: Clean Up Outdated Caches & Claim Clients
// ----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!VALID_CACHES.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return Promise.resolve(false);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ----------------------------------------------------------------------------
// 3. Background Sync & Periodic Sync: IndexedDB Queue Replay & Client Triggers
// ----------------------------------------------------------------------------
const OFFLINE_DB_NAME = 'RADAR_EGYPT_OFFLINE_DB';
const OFFLINE_DB_VERSION = 1;
const OFFLINE_QUEUE_KEY = 'offline_pending_actions_v1';
const SW_SYNC_CONFIG_KEY = 'sw_sync_config_v1';

function openRadarOfflineDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable in Service Worker'));
      return;
    }
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      ['tasks', 'merchants', 'catalog', 'orders', 'radar_cache', 'app_state'].forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readAppStateRecordFromSW(key) {
  const db = await openRadarOfflineDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('app_state', 'readonly');
      const req = tx.objectStore('app_state').get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeAppStateRecordFromSW(key, value) {
  const db = await openRadarOfflineDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('app_state', 'readwrite');
      const req = tx.objectStore('app_state').put({
        id: key,
        value,
        updatedAt: new Date().toISOString(),
      });
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function broadcastToClients(payload) {
  try {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      client.postMessage(payload);
    }
    return clientsList;
  } catch {
    return [];
  }
}

async function replayOfflineQueueHeadless(tag) {
  const queue = await readAppStateRecordFromSW(OFFLINE_QUEUE_KEY);
  if (!Array.isArray(queue) || queue.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  const config = await readAppStateRecordFromSW(SW_SYNC_CONFIG_KEY);
  if (!config || !config.url || !config.anonKey) {
    throw new Error('Missing Supabase sync configuration for headless SW replay');
  }

  const chronological = [...queue].reverse();
  const remaining = [];
  let synced = 0;
  let failed = 0;

  for (const action of chronological) {
    if (action && action.type === 'add_product' && action.payload) {
      const { id: _localId, isPendingSync: _flag, ...insertPayload } = action.payload;
      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/products`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.accessToken || config.anonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(insertPayload),
      });
      if (!res.ok) {
        failed += 1;
        remaining.unshift({
          ...action,
          status: 'failed',
          retryCount: (action.retryCount || 0) + 1,
          errorMessage: `HTTP ${res.status}`,
        });
      } else {
        synced += 1;
      }
    } else {
      remaining.unshift(action);
    }
  }

  await writeAppStateRecordFromSW(OFFLINE_QUEUE_KEY, remaining);
  if (failed > 0 && synced === 0) {
    throw new Error(`Background Sync failed for ${failed} action(s) under tag "${tag}"`);
  }
  return { synced, failed, remaining: remaining.length };
}

async function handleBackgroundSyncEvent(tag = 'sync-offline-actions') {
  await broadcastToClients({
    type: 'BACKGROUND_SYNC_STARTED',
    tag,
    timestamp: Date.now(),
  });

  await notifyClientsNetworkOnline(`background_sync:${tag}`);

  const clientsList = await broadcastToClients({
    type: 'BACKGROUND_SYNC_TRIGGERED',
    tag,
    isOnline: true,
    timestamp: Date.now(),
  });

  // If no open tabs are available to execute foreground replay, execute headless directly from IndexedDB
  if (!clientsList || clientsList.length === 0) {
    const summary = await replayOfflineQueueHeadless(tag);
    await broadcastToClients({
      type: 'BACKGROUND_SYNC_COMPLETED',
      tag,
      ...summary,
      timestamp: Date.now(),
    });
  }
}

self.addEventListener('sync', (event) => {
  isNetworkDown = false;
  const tag = event.tag || 'sync-offline-actions';
  event.waitUntil(handleBackgroundSyncEvent(tag));
});

self.addEventListener('periodicsync', (event) => {
  isNetworkDown = false;
  event.waitUntil(notifyClientsNetworkOnline(`periodic_sync:${event.tag}`));
});

// ----------------------------------------------------------------------------
// 4. Message Event: Skip Waiting, Cache Reset, Queue Registration, and Connectivity Pings
// ----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'QUEUE_OFFLINE_ACTION') {
    const tag = event.data.tag || 'sync-offline-actions';
    if (self.registration && 'sync' in self.registration) {
      event.waitUntil(
        self.registration.sync.register(tag).catch((err) => {
          console.warn('[SW] sync.register skipped:', err);
        })
      );
    }
  } else if (event.data.type === 'CHECK_NETWORK_STATUS') {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : !isNetworkDown;
    if (isOnline) {
      notifyClientsNetworkOnline('client_check_ping');
    }
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
    );
  }
});

// ----------------------------------------------------------------------------
// Domain & Request Matchers (Strictly Synchronized with index.html CSP)
// ----------------------------------------------------------------------------
function matchesHostList(hostname, list) {
  const host = hostname.toLowerCase();
  return list.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

function isSameOrAppOrigin(url) {
  return (
    url.origin === self.location.origin ||
    matchesHostList(url.hostname, ALLOWED_APP_HOSTS)
  );
}

function isGoogleFont(url) {
  return matchesHostList(url.hostname, ALLOWED_FONT_HOSTS);
}

function isAllowedImageCdn(url) {
  return matchesHostList(url.hostname, ALLOWED_IMAGE_CDN_HOSTS);
}

function isAllowedCacheDomain(url) {
  return (
    isSameOrAppOrigin(url) ||
    isGoogleFont(url) ||
    isAllowedImageCdn(url)
  );
}

function shouldBypassCache(url) {
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  // Never intercept domains outside our index.html allowlist
  if (!isAllowedCacheDomain(url)) {
    return true;
  }

  // Never cache live auth, Supabase, Firebase, Gemini AI, or analytics endpoints
  if (matchesHostList(host, BYPASS_HOSTS)) {
    return true;
  }

  // Never cache the Service Worker script itself or Firebase SW
  if (
    path === '/sw.js' ||
    path === '/service-worker.js' ||
    path === '/firebase-messaging-sw.js'
  ) {
    return true;
  }

  // Skip Vite dev / HMR module requests
  if (
    path.includes('/@vite/') ||
    path.includes('/@react-refresh') ||
    path.includes('/@fs/') ||
    path.includes('/node_modules/') ||
    path.includes('/src/') ||
    path.includes('hot-update')
  ) {
    return true;
  }

  return false;
}

function isImageOrIcon(request, url) {
  if (request.destination === 'image') return true;
  if (isAllowedImageCdn(url)) return true;
  const path = url.pathname.toLowerCase();
  return (
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.svg') ||
    path.endsWith('.webp') ||
    path.endsWith('.gif') ||
    path.endsWith('.ico')
  );
}

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
// 5. Caching Strategies
// ----------------------------------------------------------------------------
async function cacheFirst(request, cacheName, isImage = false) {
  const cache = await caches.open(cacheName);

  const cached = (await cache.match(request)) || (await caches.match(request));
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
      cache.put(request, networkResponse.clone());
      if (isNetworkDown) {
        isNetworkDown = false;
        notifyClientsNetworkOnline('static_asset_fetch_recovered');
      }
    }
    return networkResponse;
  } catch {
    if (isImage) {
      return new Response(OFFLINE_IMAGE_SVG, {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    return new Response('Offline: Resource not available', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  return cached || (await networkPromise) || new Response('Offline: Manifest unavailable', { status: 503 });
}

async function networkFirst(request, cacheName, isNavigation = false) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      if (isNavigation) {
        cache.put('/index.html', networkResponse.clone());
      }
      if (isNetworkDown) {
        isNetworkDown = false;
        notifyClientsNetworkOnline('network_first_fetch_recovered');
      }
    }
    return networkResponse;
  } catch {
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
// 6. Fetch Event Listener
// ----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests over HTTP/HTTPS
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  if (shouldBypassCache(url)) {
    return;
  }

  // Strategy 1: CacheFirst for Google Fonts (fonts.googleapis.com / fonts.gstatic.com)
  if (isGoogleFont(url)) {
    event.respondWith(cacheFirst(request, FONT_CACHE, false));
    return;
  }

  // Strategy 2: CacheFirst for Images & Allowed Marketplace Icons
  if (isImageOrIcon(request, url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, true));
    return;
  }

  // Strategy 3: StaleWhileRevalidate for Web App Manifest
  if (url.pathname.toLowerCase() === '/manifest.json' || request.destination === 'manifest') {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Strategy 4: CacheFirst for Static Assets (JS, CSS, Local Fonts)
  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, false));
    return;
  }

  // Strategy 5: NetworkFirst for SPA Navigation & Document Requests
  if (
    request.mode === 'navigate' ||
    request.destination === 'document'
  ) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, true));
    return;
  }

  // Strategy 6: NetworkFirst for same-origin GET requests & API reads
  event.respondWith(networkFirst(request, DYNAMIC_CACHE, false));
});
