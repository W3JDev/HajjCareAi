
const CACHE_NAME = 'hajjcare-v1';
const DYNAMIC_CACHE = 'hajjcare-dynamic-v1';

// Assets to pre-cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event with Stale-While-Revalidate Strategy for CDNs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle external CDNs (ESM, Tailwind, Fonts) with Stale-While-Revalidate
  if (url.origin.includes('esm.sh') || 
      url.origin.includes('cdn.tailwindcss.com') || 
      url.origin.includes('fonts.googleapis.com') || 
      url.origin.includes('gstatic.com') ||
      url.origin.includes('aistudiocdn.com')) {
    
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Default Network-First for API calls (Gemini)
  if (url.origin.includes('generativelanguage.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-First for local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
