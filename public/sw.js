// IronTrack Service Worker — Offline-First PWA
const CACHE_NAME = 'irontrack-pwa-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// Instalación: precache del shell básico
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache error (ignorado en dev):', err)
      })
    })
  )
  self.skipWaiting()
})

// Activación: limpieza de cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Interceptación de peticiones: Stale-While-Revalidate para navegación y recursos locales
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Ignorar peticiones no HTTP/HTTPS o de orígenes externos
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // Ignorar peticiones de tipo POST, PUT, DELETE
  if (request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Si estamos offline y es navegación HTML, retornar index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })

      return cachedResponse || fetchPromise
    })
  )
})

