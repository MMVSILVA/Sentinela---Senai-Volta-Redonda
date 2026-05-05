importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// O Firebase Applet Config será injetado ou lido aqui
// Como o SW roda em contexto separado, precisamos re-inicializar
firebase.initializeApp({
  apiKey: "AIzaSyBY_K_rYQgi0Al9AUdnv6rrcukfHX-ci1k",
  authDomain: "gen-lang-client-0990586267.firebaseapp.com",
  projectId: "gen-lang-client-0990586267",
  storageBucket: "gen-lang-client-0990586267.appspot.com",
  messagingSenderId: "812342554716",
  appId: "1:812342554716:web:710c8b078db758c642f699"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo192.png',
    data: payload.data,
    tag: payload.data?.tag,
    actions: [
      { action: 'open', title: 'Ver Agora' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
