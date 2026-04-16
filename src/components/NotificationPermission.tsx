import React, { useEffect, useState } from 'react';
import { BellRing, Check, BellOff, Info } from 'lucide-react';
import { getToken } from 'firebase/messaging';
import { messaging, db, isFirebaseConfigured, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isFirebaseConfigured || !messaging || !auth.currentUser) {
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

  if (permission === 'granted' && fcmToken) return null; // Já possui permissão e token salvo

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

      <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
        <Info className="w-4 h-4 shrink-0" />
        <span>O Firebase Cloud Messaging (FCM) requer configuração adicional no Console do Firebase (VAPID Key e Cloud Functions) para funcionar 100%.</span>
      </div>
    </div>
  );
}
