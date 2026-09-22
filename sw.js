const CACHE_NAME = 'polistrike-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/components.css',
  '/js/main.js',
  '/js/config.js',
  '/js/state.js',
  '/js/economy.js',
  '/js/ui.js',
  '/js/leaderboard.js',
  '/js/share.js',
  '/js/analytics.js',
  '/js/responsible.js',
  '/js/games/shared.js',
  '/js/games/blackjack.js',
  '/js/games/roulette.js',
  '/js/games/slots.js',
  '/js/games/crates.js',
  '/js/games/crash.js',
  '/js/games/mines.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Strategia "Network First": prova prima a scaricare il file aggiornato da internet/localhost.
  // Se non c'è connessione, usa la versione salvata in cache.
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Aggiorna dinamicamente la cache con la nuova versione
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
