const cacheName = "scriptflow-cache-v1";
const filesToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
  // adicione aqui outros arquivos essenciais do seu projeto
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
