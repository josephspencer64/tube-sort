// Tube Sort offline helper.
// Online: always fetch the newest version (and keep a copy).
// Offline, or on a very slow connection: use the saved copy.
const CACHE = 'tube-sort';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const network = fetch(e.request).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    });
    const slow = new Promise(r => setTimeout(r, 3000));
    try {
      const res = await Promise.race([network, slow]);
      if (res) return res;
    } catch (err) {}
    const saved = await cache.match(e.request, { ignoreSearch: true }) || await cache.match('./');
    return saved || network;
  })());
});
