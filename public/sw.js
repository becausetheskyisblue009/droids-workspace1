self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler: pass-through; adjust if you want caching
self.addEventListener('fetch', () => {});
