const CACHE_NAME = 'axel-weights-v3';
const urlsToCache = [
  '/MyAxleWeightsApp/',
  '/MyAxleWeightsApp/index.html',
  '/MyAxleWeightsApp/manifest.json',
  '/MyAxleWeightsApp/icon-192x192.png',
  '/MyAxleWeightsApp/icon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Show the saved copy right away (works offline), and quietly fetch updates for next time.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cached => {
        const fresh = fetch(event.request).then(res => {
          if (res && res.ok) cache.put(event.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
