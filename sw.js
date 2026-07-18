// JEE2027 Hub — Service Worker
// Upload this file in the SAME FOLDER as your JEE2027_Hub HTML file
// (same origin/path). It lets notifications show in your phone's real
// notification bar even when the app tab/PWA isn't open.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => {
    if (cs.length > 0) return cs[0].focus();
    return self.clients.openWindow('./');
  }));
});


