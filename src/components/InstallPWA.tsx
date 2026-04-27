import React, { useEffect, useState } from 'react';
import { Download, Share, X, MoreVertical, ShieldAlert, Globe, MoreHorizontal } from 'lucide-react';
import { Logo } from './Logo';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // 0. Detect Iframe
    setIsIframe(window.self !== window.top);

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

    // 2.5 Listen for custom trigger from Home.tsx button
    const customTriggerHandler = () => {
      if (promptInstall) {
        promptInstall.prompt();
      } else if (isStandalone) {
        alert("O Sentinela já está instalado!");
      } else {
        // Show the manual guide instead of an alert
        setShowManualGuide(true);
        setSupportsPWA(true);
        setIsDismissed(false);
      }
    };
    window.addEventListener('trigger-pwa-install', customTriggerHandler);

    // 3. Fallback: Show install option if not standalone
    if (!standalone && isIOSMobile) {
      setSupportsPWA(true);
    }
    
    // Also show if it's android but prompt didn't fire yet (common in some browsers)
    const isAndroid = /Android/i.test(ua);
    if (!standalone && isAndroid && !isDismissed) {
      setSupportsPWA(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('trigger-pwa-install', customTriggerHandler);
    };
  }, [promptInstall]);

  const handleInstallClick = async () => {
    if (promptInstall) {
      try {
        await promptInstall.prompt();
        const choiceResult = await promptInstall.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsDismissed(true);
        }
        setPromptInstall(null);
      } catch (err) {
        console.error('Error during PWA installation:', err);
      }
    } else {
      setShowManualGuide(true);
    }
  };

  const dismiss = () => {
    setIsDismissed(true);
    setShowManualGuide(false);
  };

  if (isStandalone || isDismissed || (!supportsPWA && !showManualGuide)) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-96 animate-in fade-in slide-in-from-bottom-10">
      <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 text-white p-6 rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-white/20 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
              <Logo size="sm" />
            </div>
            <div>
              <h3 className="font-black text-xl leading-tight uppercase tracking-tighter">Instalar Sentinela</h3>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Aplicativo Pró Vision
              </p>
            </div>
          </div>
          <button 
            onClick={dismiss}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 opacity-50 hover:opacity-100" />
          </button>
        </div>

        {showManualGuide ? (
          <div className="space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-500/30 p-2 rounded-lg">
                    {isIOS ? <Share className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
                  </div>
                  <p className="text-sm font-bold leading-tight">
                    {isIOS ? 'Toque no ícone de Compartilhar' : 'Toque nos 3 pontos do navegador'}
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/30 p-2 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold leading-tight">
                    {isIOS ? 'Selecione "Adicionar à Tela de Início"' : 'Selecione "Instalar Aplicativo"'}
                  </p>
               </div>
            </div>
            <button 
              onClick={() => setShowManualGuide(false)}
              className="w-full py-4 text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors"
            >
              Voltar
            </button>
          </div>
        ) : isIframe ? (
          <div className="space-y-4 relative z-10">
            <div className="bg-amber-500/20 p-4 rounded-2xl border border-amber-500/30">
              <p className="text-xs font-bold leading-relaxed text-amber-200">
                A instalação direta está bloqueada no modo visualização.
              </p>
            </div>
            <button
               onClick={() => window.open(window.location.href, '_blank')}
               className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl shadow-2xl hover:bg-blue-50 active:scale-95 transition-all uppercase text-xs flex items-center justify-center gap-3"
            >
              <Globe className="w-5 h-5" />
              Abrir Fora da Visualização
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            <p className="text-blue-100 text-sm font-medium leading-snug mb-2">
              Transforme o site em um aplicativo de segurança real na sua tela inicial agora.
            </p>
            <button
               onClick={handleInstallClick}
               className="w-full bg-emerald-500 text-white font-black py-5 rounded-[20px] shadow-2xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-wider group"
            >
              <Download className="w-6 h-6 group-hover:animate-bounce" />
              Instalar Agora
            </button>
            <button 
              onClick={() => setShowManualGuide(true)}
              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white flex items-center justify-center gap-1"
            >
              <MoreHorizontal className="w-4 h-4" />
              Ver Guia Manual
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
