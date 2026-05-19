const CACHE_NAME = 'gigorbit-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/favicon.ico',
    '/icon.png',
    '/favicon.png',
    '/logo.png',
    '/cleaner-icon.png',
    '/plumber-icon.png',
    '/electrician-icon.png',
    '/painter-icon.png',
    '/mechanic-icon.png',
    '/carpenter-icon.png',
    '/actech-icon.png',
    '/appliance-icon.png',
    '/ontheway.json',
    '/complete.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    // Only cache GET requests, ignore API calls to socket/backend server
    if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
        return;
    }
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const cacheCopy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, cacheCopy);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return offline fallback if network fails
                return caches.match('/index.html');
            });
        })
    );
});
