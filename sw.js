'use strict';

let version = '1.0';

self.addEventListener('install', e => {
    let timeStamp = Date.now();
    e.waitUntil(
        caches.open('nubium-v'+version).then(cache => {
            return cache.addAll([
                `index.html?timestamp=${timeStamp}`,
                `game.html?timestamp=${timeStamp}`
            ])
            .then(() => self.skipWaiting());
        })
    )
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(

        // Get all the cache keys (cacheName)
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {

                // If a cached item is saved under a previous cacheName
                if (thisCacheName !== 'nubium-v'+version) {

                    // Delete that cached file
                    console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }));
        })
    );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
        return response || fetch(event.request);
    })
  );
});