importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);

  workbox.routing.registerRoute( /\/input/, workbox.strategies.staleWhileRevalidate());
  workbox.routing.registerRoute( /\/home/, workbox.strategies.staleWhileRevalidate());
  workbox.routing.registerRoute(/\/fonts\/fontawesome-webfont/, workbox.strategies.staleWhileRevalidate());
  workbox.routing.registerRoute(/\/favicon\.ico/, workbox.strategies.staleWhileRevalidate());
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
