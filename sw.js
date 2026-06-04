/* ═══════════════════════════════════════════════
   sw.js — Service Worker base
═══════════════════════════════════════════════ */

const CACHE_NAME  = 'app-v1';
const CACHE_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/img/salem.png',      // ← aquí
  '/img/otra-imagen.jpg', // ← y así sucesivamente
  '/img/banner.webp',
];

/* ── INSTALL: pre-cachear shell ── */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: limpiar caches viejas ── */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: Cache-first para shell, network-first para API ── */
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Solo manejar mismo origen
  if (url.origin !== self.location.origin) return;

  // API calls → network-first
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Shell / assets → cache-first
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return response;
      });
    })
  );
});
