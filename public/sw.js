// Service Worker for PWA
const CACHE_NAME = 'life-game-system-v1';
const BASE_URL = new URL('./', self.registration.scope || self.location.href);
const resolveAppUrl = (relativePath = '') => new URL(relativePath, BASE_URL).toString();
const urlsToCache = [
  resolveAppUrl(),
  resolveAppUrl('index.html'),
  resolveAppUrl('manifest.json')
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached resource if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache opaque responses (cross-origin)
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clone response and cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
