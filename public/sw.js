const CACHE_NAME = 'radar-egypt-v50-ULTIMATE';
const STATIC_CACHE = 'radar-static-v50';

// ظپظ‚ط· ط§ظ„ط¶ط±ظˆط±ظٹ - ظٹظ‚ظ„ظ„ ط§ظ„طھط®ط²ظٹظ† ظˆظٹط­ظ„ 1441KB
const PRECACHE = ['/', '/manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  
  // API - ظ„ط§ ظƒط§ط´ ظ†ظ‡ط§ط¦ظٹط§ظ‹
  if (url.pathname.startsWith('/api/') || url.hostname.includes('vercel')) {
    return;
  }
  
  // HTML - Network First ظ…ط¹ timeout 3s ظٹطµظ„ط­ ظˆظ‚طھ ط§ظ„ط§ط³طھط¬ط§ط¨ط©
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      Promise.race([
        fetch(req).then(res => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone).catch(()=>{}));
          }
          return res;
        }),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000))
      ]).catch(() => caches.match(req).then(r => r || caches.match('/')))
    );
    return;
  }
  
  // ط§ظ„طµظˆط± ظˆط§ظ„ط®ط·ظˆط· - Cache First + Background Update (ظٹط­ظ„ 1441KB ظˆ 310ms render blocking)
  if (req.destination === 'image' || req.destination === 'font' || req.destination === 'style' || /\.(png|jpg|jpeg|webp|avif|svg|woff2|css)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) {
          // طھط­ط¯ظٹط« ظپظٹ ط§ظ„ط®ظ„ظپظٹط©
          fetch(req).then(res => {
            if (res.status === 200) caches.open(STATIC_CACHE).then(c => c.put(req, res.clone()).catch(()=>{}));
          }).catch(()=>{});
          return cached;
        }
        return fetch(req).then(res => {
          if (res.status === 200) caches.open(STATIC_CACHE).then(c => c.put(req, res.clone()).catch(()=>{}));
          return res;
        });
      })
    );
    return;
  }
  
  // JS - Stale While Revalidate ظٹطµظ„ط­ 1104KB unused
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.status === 200) caches.open(STATIC_CACHE).then(c => c.put(req, res.clone()).catch(()=>{}));
        return res;
      }).catch(()=> cached);
      return cached || network;
    })
  );
});
