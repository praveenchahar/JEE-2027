// JEE2027 Hub — Service Worker
// This is the "real same-origin sw.js" the app looks for (see ensureServiceWorker()
// in index.html). Having this file present, hosted next to index.html, is what
// makes the following actually work:
//   1. The app can open with a truly cold start (phone restarted, no tab open,
//      zero internet) instead of just failing to load.
//   2. Notifications (task reminders, timers, etc.) still show up in the
//      phone's real notification tray even when the app isn't open.
// If this file is missing, index.html silently falls back to a blob-URL
// service worker that only works while the tab is open — everything else in
// the app still works, this just makes offline/notifications more reliable.

const CACHE_NAME = "jee2027hub-shell-v1";
const APP_SHELL = ["./", "./index.html", "./logo.png", "./logo-maskable.png", "./manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {
      // If any single shell file 404s (e.g. logo-maskable.png not deployed yet),
      // don't let that block install entirely — cache what we can.
    }))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      // Drop any caches from a previous version of this service worker.
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  );
});

// Network-first for same-origin app files (so you always get the latest saved
// version of index.html when online), falling back to the cached copy only
// when the network is unavailable — that's what gives the true offline cold
// start. Anything cross-origin (Supabase/Firebase CDN scripts, API calls) is
// left completely alone and just goes straight to the network as normal.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match("./index.html")))
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      if (clientsArr.length > 0) return clientsArr[0].focus();
      return self.clients.openWindow("./");
    })
  );
});
