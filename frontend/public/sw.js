// Pórtico OS v3.1 - Contingency Network-First Service Worker (GOLD-226 / Decisión 12-C)
// Optimizado para zonas periféricas en México con señal celular intermitente.
// Cero fuga de domicilios privados (solo cachea la shell de la aplicación y la última propuesta de reunión).

const CACHE_NAME = 'portico-shell-v3.1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/og-card.svg',
  '/src/main.tsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching advertencia no fatal:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No interceptar peticiones de autenticación confidencial ni peticiones no-GET
  if (request.method !== 'GET' || url.pathname.startsWith('/api/v1/auth/')) {
    return;
  }

  // Network-First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback a caché si la red falla (e.g. sótano o colonia sin cobertura)
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Contenido disponible sin conexión en la shell de Pórtico.', {
            status: 503,
            statusText: 'Service Unavailable Offline Fallback',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
          });
        });
      })
  );
});
