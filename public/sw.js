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

// 2. Ciclo de Vida do Service Worker (PWA)
self.addEventListener('install', (e) => {
  console.log('[SW] Instalado');
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Ativado');
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Obrigatório para o PWA ser instalável
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
