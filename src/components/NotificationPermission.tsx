import React, { useEffect, useState } from 'react';
import { BellRing, Check, BellOff, Info } from 'lucide-react';
import { getToken } from 'firebase/messaging';
import { messaging, db, isFirebaseConfigured, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);
    
    const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);
    setIsStandalone(standalone);

    if ('Notification' in window) {
      const currentPerm = Notification.permission;
      setPermission(currentPerm);

      // Se já tem permissão, vamos tentar pegar o token silenciosamente em background
      if (currentPerm === 'granted' && isFirebaseConfigured && messaging && auth?.currentUser) {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BB4eB9o28YRgjkxnaiXRwtxMfzQS4-guBjzoKln6CoN0tTxjWgY9Hl8dk-iB7obMW9KIufIOi_3W8ttH4s1-xdc',
            serviceWorkerRegistration: registration
          }).then((token) => {
            if (token) {
              setFcmToken(token);
              updateDoc(doc(db, 'users', auth.currentUser!.uid), {
                fcmToken: token
              }).catch(console.error);
            }
          }).catch(console.error);
        }).catch(console.error);
      }
    }
  }, [auth?.currentUser]);

  const requestPermission = async () => {
    if (!isFirebaseConfigured || !messaging || !auth?.currentUser) {
      alert("Firebase não está configurado ou usuário não logado.");
      return;
    }

    setIsLoading(true);
    try {
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        // Registrando o Service Worker próprio para o FCM
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Obter o Token do FCM
        // ATENÇÃO: O usuário precisará substituir a vapidKey abaixo pela chave VAPID gerada no console do Firebase
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BB4eB9o28YRgjkxnaiXRwtxMfzQS4-guBjzoKln6CoN0tTxjWgY9Hl8dk-iB7obMW9KIufIOi_3W8ttH4s1-xdc',
          serviceWorkerRegistration: registration
        });

        if (token) {
          setFcmToken(token);
          // Salvar o token no cadastro do usuário no Firestore
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            fcmToken: token
          });
          console.log("Token FCM salvo com sucesso.");
        } else {
          console.log("Nenhum token FCM retornado, permissão talvez negada?");
        }
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão/token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (permission === 'granted') return null; // Não exibir se já tiver permissão

  if (isIOS && !isStandalone) {
    return (
      <div className="bg-amber-500/10 p-4 border-b border-amber-500/20 w-full animate-in slide-in-from-top flex flex-col gap-3">
        <div className="flex gap-4 items-start">
          <div className="bg-amber-500/20 p-3 rounded-full text-amber-500">
            <Info className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">Notificações no iPhone</h3>
            <p className="text-slate-400 text-xs mt-1">
              Para receber alertas da Sentinela no iPhone, você precisa primeiro <strong>Adicionar à Tela de Início</strong> e abrir o aplicativo por lá.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 border-b border-slate-700 w-full animate-in slide-in-from-top flex flex-col gap-3">
      <div className="flex gap-4 items-start">
        <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
          {permission === 'denied' ? <BellOff className="w-6 h-6" /> : <BellRing className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm">Notificações em Segundo Plano</h3>
          <p className="text-slate-400 text-xs mt-1">
            {permission === 'denied' 
              ? 'Você bloqueou as notificações. Altere nas configurações do seu navegador para receber alertas com o app fechado.'
              : 'Ative as notificações para ser avisado sobre incidentes mesmo com o aplicativo fechado.'}
          </p>
        </div>
      </div>
      
      {permission !== 'denied' && (
        <button 
          onClick={requestPermission}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>Ativar Notificações Push</>
          )}
        </button>
      )}
    </div>
  );
}
