import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS more reliably
    const ua = window.navigator.userAgent;
    const isIOSMobile = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = isIOSMobile && /WebKit/i.test(ua) && !/CriOS/i.test(ua);
    
    // Detect if already installed (standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);
    setIsStandalone(standalone);

    if (isIOSMobile && !standalone) {
      setIsIOS(true);
      setSupportsPWA(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) return;
    
    promptInstall.prompt();
    
    promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setSupportsPWA(false); // Hide prompt after install
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  };

  if (!supportsPWA || isDismissed || isStandalone) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm">
      <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-3 border border-blue-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Instalar Sentinela</span>
              <span className="text-xs text-blue-100">Acesso rápido na tela inicial</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isIOS && (
              <button
                onClick={onClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors"
              >
                Instalar
              </button>
            )}
            <button 
              onClick={() => setIsDismissed(true)}
              className="p-2 text-blue-200 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isIOS && (
          <div className="text-sm bg-blue-700/50 p-3 rounded-xl mt-1">
            <p className="flex items-center gap-2">
              1. Toque no ícone de <Share className="w-4 h-4 inline" /> na barra inferior.
            </p>
            <p className="mt-1 flex items-center gap-2">
              2. Escolha <strong className="font-bold">"Adicionar à Tela de Início"</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
