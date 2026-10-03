const CACHE_NAME = 'pocket-store-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

// 1. Instalación: Guardar recursos estáticos en caché
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Guardando archivos estáticos en caché');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Activación: Limpiar cachés antiguas si actualizas la versión
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché antigua:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Interceptar peticiones (Fetch)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Estrategia para JSONPlaceholder API: Network First, fallback a caché
    if (url.hostname === 'jsonplaceholder.typicode.com') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return networkResponse;
                })
                .catch(() => {
                    console.log('[Service Worker] Sin red, usando datos en caché');
                    return caches.match(event.request)
                        .then((cachedResponse) => cachedResponse || new Response('Sin datos disponibles'));
                })
        );
        return;
    }

    // Para archivos estáticos: Cache First
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});