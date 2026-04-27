import React, { useEffect, useState } from 'react';
import { Download, Share, X, MoreVertical } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already dismissed in last 24h
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed) {
      const dismissTime = parseInt(lastDismissed, 10);
      const now = Date.now();
      if (now - dismissTime < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // 2. Detect environment
    const ua = window.navigator.userAgent;
    const isIOSMobile = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);
    setIsStandalone(standalone);

    if (isIOSMobile && !standalone) {
      setIsIOS(true);
      setSupportsPWA(true);
    }

    // 3. Listen for deferred prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      console.log('PWA: beforeinstallprompt caught');
    };
    
    window.addEventListener('beforeinstallprompt', handler);

    // 4. Fallback for Android Chrome if manifest is valid but event was missed
    // We show it after a bit if not standalone
    const timer = setTimeout(() => {
      if (!standalone && !isIOSMobile) {
        setSupportsPWA(true);
      }
    }, 5000);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) {
      alert("Para instalar: no Android, toque nos três pontinhos do navegador e selecione 'Instalar aplicativo' ou 'Adicionar à tela inicial'.");
      return;
    }
    
    promptInstall.prompt();
    
    promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        setSupportsPWA(false);
      }
    });
  };

  const dismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!supportsPWA || isDismissed || isStandalone) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96 animate-in fade-in slide-in-from-bottom-10">
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(30,58,138,0.5)] border border-blue-400/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Download className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Sentinela App</h3>
              <p className="text-blue-100 text-xs">Instale para resposta instantânea</p>
            </div>
          </div>
          <button 
            onClick={dismiss}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isIOS ? (
           <div className="space-y-4">
             <button
                onClick={onClick}
                className="w-full bg-white text-blue-800 font-black py-4 rounded-xl shadow-lg hover:bg-blue-50 active:scale-95 transition-all text-center uppercase tracking-wider"
              >
                Instalar Agora
              </button>
              {!promptInstall && (
                 <p className="text-[10px] text-blue-200 text-center uppercase font-medium tracking-widest opacity-80">
                   Ou use o menu <MoreVertical className="w-3 h-3 inline" /> do seu navegador
                 </p>
              )}
           </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <p className="text-sm font-medium leading-relaxed">
              1. Toque no ícone de <Share className="w-5 h-5 inline mx-1 text-blue-300" /> (Compartilhar)
            </p>
            <p className="text-sm font-medium mt-3 leading-relaxed">
              2. Selecione <strong className="text-blue-300 font-black uppercase tracking-tighter">"Adicionar à Tela de Início"</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
