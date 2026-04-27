importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// 1. Configurações do Firebase (Background Notifications)
const firebaseConfig = {
  apiKey: "AIzaSyDaKvLK8QmWOYxdrTibjIL_iUspHVsZMvY",
  authDomain: "sentinela-app-c22b0.firebaseapp.com",
  projectId: "sentinela-app-c22b0",
  storageBucket: "sentinela-app-c22b0.firebasestorage.app",
  messagingSenderId: "369015085690",
  appId: "1:369015085690:web:e9a2362c41119171db79c3"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensagem em segundo plano: ', payload);
    const notificationTitle = payload.data?.title || payload.notification?.title || 'Alerta de Emergência!';
    const notificationOptions = {
      body: payload.data?.body || payload.notification?.body || 'Um alerta foi acionado. Clique para detalhes.',
      icon: 'https://placehold.co/192x192/ffffff/004a99.png?text=S',
      badge: 'https://placehold.co/192x192/ffffff/004a99.png?text=S',
      vibrate: [500, 100, 500],
      data: { url: payload.data?.url || '/' },
      requireInteraction: true
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.error('[SW] Erro ao carregar Messaging:', e);
}

const CACHE_NAME = 'sentinela-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Configurações do Firebase (Background Notifications)
// ... keeping current code below ...

self.addEventListener('install', (e) => {
  console.log('[SW] Instalado');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Ativado');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar requisições para o Firebase e outras origens externas que não queremos cachear
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebasestorage.googleapis.com') ||
      event.request.url.includes('google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Se estiver offline e não estiver no cache, retorna a página inicial
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 3. Clique na Notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
