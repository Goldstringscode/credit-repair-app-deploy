// Service Worker for Push Notifications
//
// v4: v3 fixed the cache-fallback bug for POST requests (a fetch failure
// falling back to caches.match(), which returns undefined for anything
// never cached, and a service worker whose respondWith() resolves to
// undefined fails the whole request with a generic network error). The
// same bug still applied to cross-origin GET requests — Stripe.js's script
// load (https://js.stripe.com/v3) is a GET request, so it was still being
// intercepted by this service worker and silently broken by the exact same
// pattern, surfacing as "Failed to load Stripe.js" with a grayed-out,
// non-interactive card field on the checkout page. This version only
// applies the cache-fallback to same-origin GET requests; everything
// cross-origin (Stripe.js, Google Fonts, any other third-party resource)
// now bypasses this service worker entirely and goes straight to the
// network, exactly as it would with no service worker registered at all.
const CACHE_NAME = 'credit-repair-app-v4'

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
// Non-GET requests (form submissions, API calls) and every cross-origin
// request always go straight to the network with no cache involvement at
// all, since a failed cache-lookup fallback would break them (see the note
// above). Only same-origin GET requests fall back to the cache if the
// network is unavailable.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
    return
  }

  if (event.request.method !== 'GET') {
    return // let the browser handle it directly, no interception at all
  }

  if (new URL(event.request.url).origin !== self.location.origin) {
    return // cross-origin request — never intercept, let the browser handle it directly
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
