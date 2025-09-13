const CACHE_NAME = 'escaleta-hub-v1';
const urlsToCache = [
  '/Escaleta-Hub/',
  '/Escaleta-Hub/index.html',
  '/Escaleta-Hub/style.css',
  '/Escaleta-Hub/script.js',
  '/Escaleta-Hub/manifest.json',
  '/Escaleta-Hub/assets/icon-192.png',
  '/Escaleta-Hub/assets/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
