/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// ✅ Import Workbox libraries from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

if (workbox) {
  console.log('✅ Workbox loaded');

  // ✅ Precache built assets
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // ✅ Cache /questions API with Network First
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.includes('/questions'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'questions-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // ✅ Cache app shell: JS, CSS, HTML with Cache First
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'document',
    new workbox.strategies.CacheFirst({
      cacheName: 'app-shell-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // ✅ Listen for skipWaiting
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

} else {
  console.log('❌ Workbox failed to load');
}