// KILL SWITCH - Delete old cache and fix white screen
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          console.log('Deleting cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      console.log('All caches cleared - white screen fixed!');
      return self.clients.claim();
    })
  );
});

// Do NOT cache anything - just fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
});
