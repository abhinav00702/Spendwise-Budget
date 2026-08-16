// Minimal service worker — required by Android/Chrome to treat this as an
// installable app, and gives basic offline support as a bonus.
const CACHE_NAME = 'spendwise-cache-v1';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for navigation (so you always get the latest app shell if online),
  // falling back to cache when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Cache-first for everything else (icons, manifest, static assets)
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
