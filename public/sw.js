// Service Worker for Push Notifications
//
// v2: This service worker used to pre-cache the homepage and dashboard
// pages at install time and serve them cache-first forever, which meant
// visitors kept seeing a stale, install-time snapshot of the app no matter
// how many new deployments went out — including snapshots referencing
// old build's hashed JS chunk files that Vercel had already pruned,
// which is what caused "Application error: a client-side exception has
// occurred" for returning visitors. This version no longer caches HTML
// pages at all (this SW only needs to exist for push notifications, not
// offline page caching) and always fetches navigations fresh from the
// network. The bumped CACHE_NAME also forces already-installed service
// workers on users' devices to discard their old, stale cache.
const CACHE_NAME = 'credit-repair-app-v2'

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
// a cached HTML document), so deployments are reflected immediately. Other
// requests fall back to the cache only if the network is unavailable.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
    return
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

