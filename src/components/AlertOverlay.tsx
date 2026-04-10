import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AlertOctagon, Flame, Map, X, CheckCircle2 } from 'lucide-react';

export function AlertOverlay() {
  const { activeAlerts, resolveAlert, dismissedAlertIds, dismissAlert, currentUser } = useStore();

  const activeAlert = activeAlerts.find(a => !dismissedAlertIds.includes(a.id));

  useEffect(() => {
    if (activeAlert) {
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    }
  }, [activeAlert]);

  if (!activeAlert) return null;

  const isFire = activeAlert.type === 'fire';
  const bgColor = isFire ? 'bg-orange-600' : 'bg-red-600';
  const textColor = isFire ? 'text-orange-600' : 'text-red-600';
  const hoverColor = isFire ? 'hover:bg-orange-50' : 'hover:bg-red-50';

  const canResolve = currentUser?.role === 'admin' || currentUser?.id === activeAlert.triggeredBy.id;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${bgColor} animate-pulse-fast overflow-y-auto`}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-max py-12">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce shrink-0">
          {isFire ? (
            <Flame className="w-14 h-14 text-white" />
          ) : (
            <AlertOctagon className="w-14 h-14 text-white" />
          )}
        </div>
        
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
          {isFire ? 'Incêndio!' : 'Emergência!'}
        </h1>
        
        <div className="bg-black/20 rounded-2xl p-6 backdrop-blur-sm w-full max-w-sm">
          <p className="text-white/80 text-sm mb-1">Acionado por:</p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={activeAlert.triggeredBy.photo} alt="" className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" />
            <p className="text-2xl font-bold text-white">{activeAlert.triggeredBy.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-left">
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-white/60 text-xs">Setor do Usuário</p>
              <p className="text-white font-medium">{activeAlert.triggeredBy.sector}</p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-white/60 text-xs">Contato</p>
              <p className="text-white font-medium">{activeAlert.triggeredBy.phone}</p>
            </div>
          </div>

          {activeAlert.specificLocation && (
            <div className="bg-white/10 p-4 rounded-lg mb-4 text-left border border-white/20">
              <p className="text-white/80 text-xs uppercase tracking-wider font-bold mb-1">Local Exato da Ocorrência:</p>
              <p className="text-white font-bold text-lg">{activeAlert.specificLocation}</p>
            </div>
          )}

          {activeAlert.location && (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${activeAlert.location.lat},${activeAlert.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 w-full bg-white ${textColor} font-bold py-4 rounded-xl ${hoverColor} transition-colors`}
            >
              <Map className="w-6 h-6" />
              Ver no Mapa
            </a>
          )}
        </div>
      </div>

      <div className="p-6 bg-black/10 backdrop-blur-md mt-auto shrink-0 flex flex-col gap-3">
        <button
          onClick={() => dismissAlert(activeAlert.id)}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-4 rounded-xl transition-colors border border-white/20"
        >
          <X className="w-5 h-5" />
          Sair da Tela (Manter Alerta Ativo)
        </button>

        {canResolve && (
          <button
            onClick={() => resolveAlert(activeAlert.id, 'Resolvido pelo usuário')}
            className="w-full flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 text-white font-bold py-4 rounded-xl transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" />
            Resolver Emergência (Encerrar)
          </button>
        )}
      </div>
    </div>
  );
}
