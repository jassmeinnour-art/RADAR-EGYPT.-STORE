// Service Worker for Merchant Radar Egypt (RADAR EGYPT) - 100% PWA Compliant & White-Screen Resistant
const CACHE_NAME = 'merchant-radar-cache-v6.5-prod';
const OFFLINE_URL = '/index.html';

const PRECACHE_ASSETS = [
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

// Fallback App Shell HTML to prevent blank screen if offline and cache missing
const FALLBACK_APP_SHELL_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>رادار التاجر الذكي - وضع أوفلاين</title>
  <style>
    body { margin: 0; padding: 24px; background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; direction: rtl; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 24px; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .btn { background: #f59e0b; color: #020617; font-weight: 800; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; margin-top: 16px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="color: #fbbf24; margin-top: 0;">أنت تعمل في وضع دون اتصال (Offline)</h2>
    <p style="font-size: 14px; color: #94a3b8;">يرجى التحقق من اتصال الإنترنت ثم إعادة محاولة التحميل لاستعراض رادار الأسعار والمنافسين.</p>
    <button class="btn" onclick="window.location.reload();">إعادة التحميل 🔄</button>
  </div>
</body>
</html>`;

// Install Event - Precache Core Static Assets & HTML Shell
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
            console.log('[PWA SW] Deleting old cache:', cache);
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
  if (event.tag === 'fetch-new-content' || event.tag === 'radar-price-update' || event.tag === 'merchant-catalog-refresh') {
    event.waitUntil(fetchNewContent());
  }
});

// Helper function for reading/replaying IndexedDB offline queue when headless
const SW_OFFLINE_DB_NAME = 'RADAR_EGYPT_OFFLINE_DB';
const SW_OFFLINE_QUEUE_KEY = 'offline_pending_actions_v1';
const SW_SYNC_CONFIG_KEY = 'sw_sync_config_v1';

function openOfflineDBFromWorker() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(SW_OFFLINE_DB_NAME, 1);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      ['tasks', 'merchants', 'catalog', 'orders', 'radar_cache', 'app_state'].forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readAppStateFromWorker(key) {
  const db = await openOfflineDBFromWorker();
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

async function writeAppStateFromWorker(key, value) {
  const db = await openOfflineDBFromWorker();
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

// Helper function for pushing local merchant data to database during background sync
async function pushLocalDataToDatabase(tag = 'database-sync') {
  try {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientsList.forEach(client => {
      client.postMessage({ type: 'DATABASE_SYNC_STARTED', tag, timestamp: Date.now() });
      client.postMessage({ type: 'BACKGROUND_SYNC_STARTED', tag, timestamp: Date.now() });
      client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGERED', tag, isOnline: true, timestamp: Date.now() });
    });

    if (clientsList.length === 0) {
      const queue = await readAppStateFromWorker(SW_OFFLINE_QUEUE_KEY);
      const config = await readAppStateFromWorker(SW_SYNC_CONFIG_KEY);
      if (Array.isArray(queue) && queue.length > 0 && config?.url && config?.anonKey) {
        const chronological = [...queue].reverse();
        const remaining = [];
        for (const action of chronological) {
          if (action?.type === 'add_product' && action.payload) {
            const { id: _id, isPendingSync: _flag, ...insertPayload } = action.payload;
            const res = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/products`, {
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
              remaining.unshift({ ...action, status: 'failed', retryCount: (action.retryCount || 0) + 1 });
            }
          } else {
            remaining.unshift(action);
          }
        }
        await writeAppStateFromWorker(SW_OFFLINE_QUEUE_KEY, remaining);
        if (remaining.length > 0 && remaining.length === queue.length) {
          throw new Error('Background sync headless replay failed');
        }
      }
    }

    const response = await fetch('/manifest.json');
    if (response.ok) {
      clientsList.forEach(client => {
        client.postMessage({ type: 'DATABASE_SYNC_SUCCESS', tag, timestamp: Date.now() });
      });
    }
  } catch (error) {
    console.error('Background sync pushLocalDataToDatabase failed:', error);
    throw error;
  }
}

// One-shot Background Sync Event Handler
self.addEventListener('sync', event => {
  if (
    event.tag === 'sync-offline-actions' ||
    event.tag === 'database-sync' ||
    event.tag === 'sync-merchant-data' ||
    event.tag === 'radar-price-sync' ||
    event.tag === 'sync-messages' ||
    event.tag === 'sync-data'
  ) {
    event.waitUntil(pushLocalDataToDatabase(event.tag));
  }
});

// Message Listener for Skip Waiting & Background Sync Registration
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'QUEUE_OFFLINE_ACTION') {
    const tag = event.data.tag || 'sync-offline-actions';
    if (self.registration && 'sync' in self.registration) {
      event.waitUntil(
        self.registration.sync.register(tag).catch(() => {})
      );
    }
  }
});

// Fetch Event - Anti White-Screen Navigation & Asset Handler
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Skip Vite dev server internals and HMR endpoints
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

  // Handle API dynamic routes: Network First, JSON Fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline', offline: true }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      })
    );
    return;
  }

  // 1. NAVIGATION REQUESTS (App Shell Loading - e.g. opening app, PWA shortcut, sub-routes)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              cache.put('/index.html', responseToCache.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed or offline: serve cached index.html or root
          const cache = await caches.open(CACHE_NAME);
          const cachedDocument = (await cache.match(event.request)) || (await cache.match('/index.html')) || (await cache.match('/'));
          if (cachedDocument) {
            return cachedDocument;
          }
          // Ultimate fallback: generate Emergency HTML Response to prevent blank white screen
          return new Response(FALLBACK_APP_SHELL_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. STATIC ASSETS (Scripts, Styles, Assets)
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.url.includes('/assets/')
  ) {
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
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedAsset = await cache.match(event.request);
          if (cachedAsset) return cachedAsset;
          return new Response('', { status: 404, statusText: 'Not Found' });
        })
    );
    return;
  }

  // 3. IMAGES / MEDIA / FONTS: Cache First with Network Fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cached || new Response('', { status: 404 });
      });
    })
  );
});

// Push Notification Event Handler
self.addEventListener('push', (event) => {
  let data = {
    title: 'RADAR EGYPT - تنبيه جديد',
    body: 'هناك تحديث جديد في رادار التاجر الذكي.',
    icon: '/pwa-192x192.png',
    badge: '/favicon.ico',
    path: '/'
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || payload.notification?.title || data.title,
        body: payload.body || payload.notification?.body || data.body,
        icon: payload.icon || '/pwa-192x192.png',
        badge: payload.badge || '/favicon.ico',
        path: payload.path || payload.data?.path || '/'
      };
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      dir: 'rtl',
      lang: 'ar',
      data: { path: data.path }
    })
  );
});

// Notification Click Event Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const relativePath = (event.notification.data && event.notification.data.path) || '/';
  const fullPath = self.location.origin + relativePath;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === fullPath && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullPath);
      }
    })
  );
});
