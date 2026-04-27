import React, { useEffect, useState } from 'react';
import { Download, Share, X, MoreVertical } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect environment
    const ua = window.navigator.userAgent;
    const isIOSMobile = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);
    setIsStandalone(standalone);

    if (isIOSMobile && !standalone) {
      setIsIOS(true);
      setSupportsPWA(true);
    }

    // 2. Listen for deferred prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      console.log('PWA: beforeinstallprompt caught');
    };
    
    window.addEventListener('beforeinstallprompt', handler);

    // 3. Fallback: Show install option if not standalone
    // This helps users know how to install even if the browser doesn't trigger the native prompt
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    if (!standalone && isMobile) {
      setSupportsPWA(true);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const onClick = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) {
      // Check if we are in an iframe
      if (window.self !== window.top) {
        alert("Para instalar 'direto', abra o aplicativo em uma nova aba clicando no ícone de seta no canto superior direito do AI Studio.");
        return;
      }
      alert("Seu navegador ainda não liberou a instalação direta. Use o menu do navegador (três pontinhos) e selecione 'Instalar aplicativo' ou 'Adicionar à tela inicial'.");
      return;
    }
    
    try {
      await promptInstall.prompt();
      const choiceResult = await promptInstall.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install');
        setSupportsPWA(false);
      }
      setPromptInstall(null);
    } catch (err) {
      console.error('Error during PWA installation:', err);
    }
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
