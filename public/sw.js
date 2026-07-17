// Service Worker for Push Notifications
//
// v3: v2 stopped caching HTML pages, but its fetch handler still applied a
// cache-fallback (`.catch(() => caches.match(event.request))`) to EVERY
// request regardless of method. For a POST request (like signup's call to
// /api/auth/register), if the network fetch failed for any reason, that
// fallback tried to look up a cached match for a POST request — which is
// never cacheable, so it resolved to undefined. A service worker whose
// respondWith() resolves to undefined fails the whole fetch with a generic
// network error, with no clean request/response to inspect in devtools —
// exactly matching "Something went wrong" with no visible register request.
// This version only applies the cache-fallback to GET requests; every other
// method just goes straight to the network, uninterrupted.
const CACHE_NAME = 'credit-repair-app-v3'

// Install event
self.addEventListener('install', (event) => {
  // Take over from any previous service worker immediately, instead of
  // waiting for all tabs on the old version to close.
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Start controlling any already-open tabs immediately.
      self.clients.claim()
    ])
  )
})

// Fetch event — always go to the network for page navigations (never serve
// a cached HTML document), so deployments are reflected immediately.
// Non-GET requests (form submissions, API calls) always go straight to the
// network with no cache involvement at all, since they're never cacheable
// and a failed cache-lookup fallback would break them. Only GET requests
// fall back to the cache if the network is unavailable.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
    return
  }

  if (event.request.method !== 'GET') {
    return // let the browser handle it directly, no interception at all
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Push event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received')

  let notificationData = {
    title: 'Merit Point AI',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'credit-repair-notification',
    data: {
      url: '/dashboard/notifications'
    }
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.error('Service Worker: Error parsing push data', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Background sync (for offline functionality)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)

  if (event.tag === 'notification-sync') {
    event.waitUntil(
      syncNotifications()
    )
  }
})

// Message event (for communication with main thread)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Helper function for syncing notifications
async function syncNotifications() {
  try {
    console.log('Service Worker: Syncing notifications...')
  } catch (error) {
    console.error('Service Worker: Error syncing notifications', error)
  }
}

