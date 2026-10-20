// Safe Firebase Cloud Messaging Service Worker for Merchant Radar Egypt
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

  if (typeof firebase !== 'undefined') {
    firebase.initializeApp({
      apiKey: self.FIREBASE_API_KEY || "AIzaSyDPT4ugCGlk3bRTD-uZJ0CQCeBzcAYlI2I",
      authDomain: "axiomatic-kayak-dfs6l.firebaseapp.com",
      projectId: "axiomatic-kayak-dfs6l",
      storageBucket: "axiomatic-kayak-dfs6l.firebasestorage.app",
      messagingSenderId: "171672752175",
      appId: "1:171672752175:web:419bae75f57459db2876da"
    });

    if (typeof firebase.messaging === 'function') {
      const messaging = firebase.messaging();
      messaging.onBackgroundMessage(function (payload) {
        const notificationTitle =
          (payload && payload.notification && payload.notification.title) ||
          'RADAR - تنبيه أسعار فوري';
        const notificationOptions = {
          body: (payload && payload.notification && payload.notification.body) || '',
          icon: '/pwa-192x192.png'
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    }
  }
} catch (err) {
  // Prevent service worker script evaluation failure if offline or inside restricted sandbox
}
