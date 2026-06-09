const LEGACY_CACHE_NAMES = [
  'assets-v1',
  'content-v1',
  'offline-v1',
  '404-v1'
];

async function clearLegacyCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => LEGACY_CACHE_NAMES.includes(name))
      .map((name) => caches.delete(name))
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await clearLegacyCaches();
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
