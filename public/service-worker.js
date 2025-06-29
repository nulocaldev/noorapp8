// service-worker.js

const CACHE_NAME = 'noor-app-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event: pre-cache the main assets.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheKeys => {
      return Promise.all(
        cacheKeys.map(cacheKey => {
          if (cacheWhitelist.indexOf(cacheKey) === -1) {
            return caches.delete(cacheKey);
          }
        })
      );
    })
  );
});

// Fetch event: serve assets from cache, fall back to network, and cache new assets.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            // Opaque responses for cross-origin resources can't be inspected, but are okay to cache.
            // Let's only avoid caching clear errors.
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        }).catch(error => {
            console.error('Fetching failed:', error);
            // Optional: return a custom offline page
            // return caches.match('/offline.html');
            throw error;
        });
      })
  );
});
