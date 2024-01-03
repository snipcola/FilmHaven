const cacheName = "fh_cache";

self.addEventListener("install", function (e) {
    e.waitUntil(caches.open(cacheName));
});

self.addEventListener("fetch", function (e) {
    if (!e.request.url.startsWith(self.location.origin)) return;

    e.respondWith(
        caches.open(cacheName).then(function (cache) {
            return fetch(e.request.url)
                .then(function (fetched) {
                    cache.put(e.request, fetched.clone());
                    return fetched;
                })
                .catch(function () {
                    return cache.match(e.request.url);
                });
        })
    );
});