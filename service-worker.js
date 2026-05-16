const CACHE_NAME = "djgst-cache-v1";

const urlsToCache = [
  "https://teenamaireddy.github.io/djgst-travels/",
  "https://teenamaireddy.github.io/djgst-travels/index.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
