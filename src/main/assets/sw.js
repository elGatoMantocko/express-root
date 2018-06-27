importScripts('/js/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);

  workbox.routing.registerRoute( /\/input/, workbox.strategies.networkFirst());
  workbox.routing.registerRoute( /\/home/, workbox.strategies.networkFirst());
  workbox.routing.registerRoute(/\/register/, workbox.strategies.networkOnly({
    plugins: [new workbox.backgroundSync.Plugin('app_queue', {
      maxRetentionTime: 24 * 60,
    })],
  }), 'POST');

  workbox.routing.registerRoute(/https:\/\/fonts\.googleapis\.com\/css\?family=Roboto:300,400,500/, workbox.strategies.cacheFirst());
  workbox.routing.registerRoute(/\/fonts\/fontawesome-webfont/, workbox.strategies.cacheFirst());
  workbox.routing.registerRoute(/\/favicon\.ico/, workbox.strategies.cacheFirst());
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
