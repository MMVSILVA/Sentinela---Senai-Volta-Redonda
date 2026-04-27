import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { APP_VERSION } from '../lib/version';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isNewVersion, setIsNewVersion] = useState(false);

  useEffect(() => {
    // 1. Check for physical Service Worker updates (PWA standard)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowPrompt(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowPrompt(true);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 2. Check for APP_VERSION update (Faster logic for dev environment)
    const storedVersion = localStorage.getItem('sentinela_app_version');
    if (storedVersion && storedVersion !== APP_VERSION) {
      setIsNewVersion(true);
      setShowPrompt(true);
    }
    // Save current version for next time
    localStorage.setItem('sentinela_app_version', APP_VERSION);

  }, []);

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // If it was just a manual version bump check
      window.location.reload();
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 bg-slate-900 border-2 border-blue-500 rounded-2xl p-5 shadow-[0_0_50px_rgba(37,99,235,0.4)] z-[100] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 text-blue-400">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <RefreshCw className="w-6 h-6 animate-[spin_5s_linear_infinite]" />
          </div>
          <div>
            <h3 className="font-black text-lg">Nova Versão {APP_VERSION}!</h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Atualização de Sistema</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPrompt(false)} 
          className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-sm text-slate-300 leading-relaxed">
        {isNewVersion 
          ? "O desenvolvedor fez alterações no aplicativo. Clique para carregar as novas funcionalidades e melhorias de segurança."
          : "Uma nova atualização em segundo plano foi detectada. Reinicie para aplicar as mudanças."}
      </p>
      
      <button 
        onClick={updateApp}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
      >
        ATUALIZAR APP AGORA
      </button>
    </div>
  );
}
