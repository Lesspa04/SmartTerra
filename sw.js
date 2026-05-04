// ============================================================
// sw.js — Service Worker SmartTerra PWA
// ============================================================
/*
const CACHE_NAME = 'smartterra-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/app/app.html',
  '/control/src/css/base.css',
  '/control/src/css/app.css',
  '/control/src/css/components.css',
  '/control/src/css/pet.css',
  '/control/src/css/charts.css',
  '/control/src/css/auth.css',
  '/control/src/css/achievements.css',
  '/control/src/js/supabase-client.js',
  '/control/src/js/carbon.js',
  '/control/src/js/charts.js',
  '/control/src/js/pet.js',
  '/control/src/js/achievements.js',
  '/control/src/js/app.js',
  '/control/src/js/auth.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
]

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Interceptar fetch
self.addEventListener('fetch', event => {
  // Supabase API siempre online
  if (event.request.url.includes('supabase.co')) {
    return fetch(event.request)
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit
        if (response) return response
        
        // Network + cache fallback
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse
            }
            
            // Cachear respuesta exitosa
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
            
            return networkResponse
          })
          .catch(() => {
            // Offline fallback
            return caches.match('/app.html')
          })
      })
  )
})

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '¡Tienes nuevos logros en SmartTerra!',
    icon: '/control/public/assets/icons/icon-192x192.png',
    badge: '/control/public/assets/icons/pestaña.png',
    vibrate: [100, 50, 100],
    data: { date: new Date().toISOString() },
    actions: [
      { action: 'open', title: 'Abrir app' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('SmartTerra', options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/app.html')
    )
  }
})*/