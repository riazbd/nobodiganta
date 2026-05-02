/**
 * NoboDiganta News Portal - Service Worker
 * Caching strategy per resource type:
 * 
 * - News feed/lists: Stale-while-revalidate
 * - Article pages: Network-first, cache fallback
 * - Static assets (JS/CSS): Cache-first (immutable)
 * - Images: Stale-while-revalidate
 * - API responses: Network-first (1 min timeout)
 */

const CACHE_NAME = 'nobodiganta-v1';
const STATIC_CACHE = 'nobodiganta-static-v1';
const DYNAMIC_CACHE = 'nobodiganta-dynamic-v1';
const IMAGES_CACHE = 'nobodiganta-images-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ══════════════════════════════════════
// INSTALL EVENT - Cache static assets
// ══════════════════════════════════════
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        // Use individual add calls to be resilient to missing files
        return Promise.allSettled(
          STATIC_ASSETS.map((url) => 
            cache.add(url).catch(err => console.warn(`[SW] Failed to cache: ${url}`, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ══════════════════════════════════════
// ACTIVATE EVENT - Clean old caches
// ══════════════════════════════════════
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGES_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ══════════════════════════════════════
// FETCH EVENT - Apply caching strategy
// ══════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (!url.origin.includes(self.location.hostname)) return;

  // Apply strategy based on request type
  if (request.destination === 'image') {
    // Images: Stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request, IMAGES_CACHE));
  } else if (request.url.includes('/api/')) {
    // API responses: Network-first with timeout
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, 60000));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // JS/CSS: Cache-first (immutable)
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (request.destination === 'document') {
    // HTML pages: Network-first, cache fallback
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, 30000));
  } else {
    // Default: Stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// ══════════════════════════════════════
// CACHING STRATEGIES
// ══════════════════════════════════════

/**
 * Cache-first: Return from cache, fallback to network.
 * Best for: Static assets (JS, CSS, fonts)
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network-first: Try network, fallback to cache.
 * Best for: Article pages, API responses
 */
async function networkFirst(request, cacheName, timeoutMs = 30000) {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
    });

    // Race between network and timeout
    const networkResponse = await Promise.race([
      fetch(request),
      timeoutPromise,
    ]);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    const offlinePage = await caches.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Stale-while-revalidate: Return cache immediately, update in background.
 * Best for: News feeds, images
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await caches.match(request);

  // Start network request in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse); // Return cached if network fails

  // Return cached immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// ══════════════════════════════════════
// PUSH NOTIFICATIONS
// ══════════════════════════════════════
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'নবদিগন্ত';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-96.png',
    image: data.image || null,
    data: {
      url: data.url || '/',
      timestamp: data.timestamp || Date.now(),
    },
    actions: data.actions || [
      { action: 'read', title: 'পড়ুন', icon: '/icons/action-read.png' },
      { action: 'close', title: 'বন্ধ করুন', icon: '/icons/action-close.png' },
    ],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ══════════════════════════════════════
// NOTIFICATION CLICK
// ══════════════════════════════════════
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(urlToOpen);
      })
  );
});

// ══════════════════════════════════════
// BACKGROUND SYNC (for offline actions)
// ══════════════════════════════════════
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  }
});

async function syncComments() {
  // TODO: Sync queued comments when back online
  const cache = await caches.open(DYNAMIC_CACHE);
  // Implementation for syncing offline comments
}
