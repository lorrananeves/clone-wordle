const CACHE_NAME = "xingo-cache-v11";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./favicon.jpg",
    "./manifest.json",
    "./js/game.js",
    "./js/ui.js",
    "./js/storage.js",
    "./js/constants.js"
];

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName !== CACHE_NAME)
                        .map((cacheName) => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {

    event.respondWith(

        caches.match(event.request)
            .then((response) => {

                return response || fetch(event.request);
            })
    );
});
