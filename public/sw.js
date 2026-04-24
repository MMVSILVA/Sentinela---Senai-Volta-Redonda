// Boilerplate para PWA
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

// Importando Firebase para Service Worker (Background Push Notifications)
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

try {
  // ATENÇÃO: O usuário deve substituir este objeto pelas mesmas credenciais do firebase.ts
  firebase.initializeApp({
    apiKey: "AIzaSyDaKvLK8QmWOYxdrTibjIL_iUspHVsZMvY",
    authDomain: "sentinela-app-c22b0.firebaseapp.com",
    projectId: "sentinela-app-c22b0",
    storageBucket: "sentinela-app-c22b0.firebasestorage.app",
    messagingSenderId: "369015085690",
    appId: "1:369015085690:web:e9a2362c41119171db79c3"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Novo Alerta de Emergência!';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Abra o aplicativo para mais detalhes.',
      icon: 'https://placehold.co/192x192/ffffff/004a99.png?text=S',
      badge: 'https://placehold.co/192x192/ffffff/004a99.png?text=S',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: true // Fica na tela até o usuário interagir
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('Firebase background messaging error/not configured yet:', error);
}
