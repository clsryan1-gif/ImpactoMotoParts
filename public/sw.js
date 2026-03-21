const CACHE_NAME = 'impacto-moto-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/login-bg.png',
  '/icon-pwa-192.png',
  '/icon-pwa-512.png',
];

// Instalação: Cacheia ativos estáticos essenciais (App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Interceptação de Requisições (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. IGNORAR: API, Admin, Checkout e Meus Pedidos (Sempre rede para evitar dados inconsistentes)
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/_next/data/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/checkout') ||
    url.pathname.startsWith('/meus-pedidos')
  ) {
    return; 
  }

  // 2. ESTRATÉGIA: Network-First para Páginas do Catálogo e Home
  // Garante que o usuário veja preços/estoque real se houver net.
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          return networkResponse;
        })
        .catch(() => caches.match(request) || caches.match('/'))
    );
    return;
  }

  // 3. ESTRATÉGIA: Cache-First para Imagens do Catálogo e Logo
  // Imagens não mudam com frequência, economiza dados.
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((networkResponse) => {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. ESTRATÉGIA: Stale-While-Revalidate para Scripts e CSS
  // Carrega instantâneo do cache e atualiza em background.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});
