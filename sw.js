const CACHE = 'hmg-lab-v2';
const ASSETS = ['/', '/index.html', '/assets/css/style.css', '/assets/js/lab-core.js', '/assets/js/main.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c).catch(() => {})); return r; })
    .catch(() => caches.match(e.request).then(r => r || new Response('Offline', { status: 503 })))
  );
});
