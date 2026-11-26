/* Спор царей — офлайн-режим. При каждой выкладке новой версии игры меняется VERSION. */
const VERSION = 'spor-v211-pwa4';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'icons/maskable-192.png', 'icons/maskable-512.png', 'icons/icon-32.png'];
const RUNTIME = 'spor-runtime';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== RUNTIME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // own files: from the versioned cache, the page itself for any navigation
    const key = r.mode === 'navigate' ? 'index.html' : r;
    e.respondWith(caches.open(VERSION).then(c => c.match(key, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))).catch(() => caches.match('index.html')));
    return;
  }
  // fonts and 3D libraries from CDNs: kept after the first load so the game works offline
  if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(u.host)) {
    e.respondWith(caches.open(RUNTIME).then(c => c.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }))));
  }
});
