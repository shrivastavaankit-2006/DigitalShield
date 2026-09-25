// DigitalShield Service Worker
// Version: digitalshield-v1

const CACHE_NAME = 'digitalshield-v1';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-192x192.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// Domains/patterns that must NEVER be cached (always live network)
const DYNAMIC_API_PATTERNS = [
  '/api/',
  'workers.dev',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firestore.googleapis.com',
  'firebaseio.com',
  'generativelanguage.googleapis.com'
];

// Helper: check if request is a dynamic API request
function isDynamicApiRequest(url) {
  const urlString = url.toString().toLowerCase();
  return DYNAMIC_API_PATTERNS.some(pattern => urlString.includes(pattern));
}

// 1. Install Event: Pre-cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[DigitalShield SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated caches and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith('digitalshield-')) {
            return caches.delete(key);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Safe static caching + strict live bypass for all APIs
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // RULE 1: Never intercept non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // RULE 2: Never cache dynamic API or authentication calls (strictly live network)
  if (isDynamicApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // RULE 3: SPA Navigation requests (HTML documents)
  // Network-first, fallback to cached /index.html when offline
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cachedIndex) => {
            return cachedIndex || caches.match('/');
          });
        })
    );
    return;
  }

  // RULE 4: Static assets (JS, CSS, images, icons, fonts)
  // Stale-While-Revalidate: serve cached version if present, update from network in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.origin === self.location.origin ||
              url.hostname.includes('fonts.googleapis.com') ||
              url.hostname.includes('fonts.gstatic.com'))
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and not in cache, let it fail gracefully
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
