const CACHE_NAME = "xingo-cache-v12";

// Recursos que devem ser pre-cacheados no install
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

// Recursos estáticos que mudam a cada deploy (JS/CSS) — usa stale-while-revalidate
const STALE_WHILE_REVALIDATE = [
    "./style.css",
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

    const url = new URL(event.request.url);
    const isStale = STALE_WHILE_REVALIDATE.some(
        (path) => url.pathname.endsWith(path.replace(".", ""))
    );

    if (isStale) {
        // Stale-while-revalidate: responde do cache imediatamente e atualiza em background
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cached) => {
                    const networkFetch = fetch(event.request).then((response) => {
                        if (response && response.status === 200) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    });
                    return cached || networkFetch;
                });
            })
        );
        return;
    }

    // Cache-first para os demais recursos (index.html, imagens, manifest)
    event.respondWith(

        caches.match(event.request)
            .then((response) => {

                return response || fetch(event.request);
            })
    );
});
