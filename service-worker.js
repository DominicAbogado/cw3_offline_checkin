const CACHE_NAME = "checkin-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Navigation (loading the page): cache-first so it opens offline
// - Everything else: try network, fall back to cache
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // For the main document/page loads
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./").then((cached) => cached || fetch(req))
    );
    return;
  }

  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req))
  );
});
