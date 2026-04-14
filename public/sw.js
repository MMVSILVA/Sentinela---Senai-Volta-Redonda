self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  // Não chamamos skipWaiting automaticamente para podermos mostrar o aviso de atualização
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Minimal fetch listener to pass PWA installability criteria
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
