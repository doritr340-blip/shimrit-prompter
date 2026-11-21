// רשת קודם, ומטמון רק כשאין חיבור. ככה כל עדכון מגיע מיד.
const CACHE = 'prompter-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './fonts/heebo-hebrew-400.woff2', './fonts/heebo-hebrew-500.woff2', './fonts/heebo-hebrew-700.woff2', './fonts/heebo-hebrew-800.woff2',
  './fonts/heebo-latin-400.woff2', './fonts/heebo-latin-500.woff2', './fonts/heebo-latin-700.woff2', './fonts/heebo-latin-800.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : null)).then(r => r || Response.error()))
  );
});
