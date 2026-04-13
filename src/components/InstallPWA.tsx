import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
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

  if (!supportsPWA || isDismissed) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm">
      <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-blue-500">
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
          <button
            onClick={onClick}
            className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors"
          >
            Instalar
          </button>
          <button 
            onClick={() => setIsDismissed(true)}
            className="p-2 text-blue-200 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
