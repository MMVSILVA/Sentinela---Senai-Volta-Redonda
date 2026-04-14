import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { AlertOctagon, Flame, Map, X, CheckCircle2, Plus } from 'lucide-react';

export function AlertOverlay() {
  const { alerts, resolveAlert, dismissedAlertIds, dismissAlert, currentUser } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeAlerts = alerts.filter(a => a.active);
  const activeAlert = activeAlerts.find(a => !dismissedAlertIds.includes(a.id));

  // Solicitar permissão para notificações do sistema quando o componente montar
  useEffect(() => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(e => console.log("Permissão de notificação ignorada:", e));
      }
    } catch (e) {
      console.log("Erro ao solicitar permissão de notificação:", e);
    }
  }, []);

  useEffect(() => {
    if (activeAlert) {
      const isFire = activeAlert.type === 'fire';
      const isFirstAid = activeAlert.type === 'firstaid';
      
      // 1. Vibrar o celular
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
        }
      } catch (e) {
        console.log("Erro ao vibrar:", e);
      }

      // 2. Tocar som de sirene/alarme
      try {
        if (!audioRef.current) {
          // Usando um som de alarme de domínio público do Google
          audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
          audioRef.current.loop = true;
        }
        // O navegador pode bloquear o autoplay se o usuário não tiver interagido com a página antes
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Áudio bloqueado pelo navegador:", e));
        }
      } catch (e) {
        console.log("Erro ao tocar áudio:", e);
      }

      // 3. Mostrar notificação do sistema
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = isFire ? '🚨 ALERTA DE INCÊNDIO!' : isFirstAid ? '🚨 PRIMEIROS SOCORROS!' : '🚨 ALERTA DE EMERGÊNCIA!';
          const options = {
            body: `${activeAlert.triggeredBy?.name || 'Usuário'} acionou um alerta no setor: ${activeAlert.triggeredBy?.sector || 'Desconhecido'}`,
            vibrate: [500, 200, 500],
            requireInteraction: true
          };

          // Em celulares (especialmente Android/Chrome), new Notification pode falhar.
          // O ideal é usar o Service Worker se disponível.
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(title, options).catch(e => {
                console.log("Erro ao mostrar notificação via SW:", e);
                // Fallback
                new Notification(title, options);
              });
            }).catch(() => {
              new Notification(title, options);
            });
          } else {
            new Notification(title, options);
          }
        }
      } catch (e) {
        console.log("Erro ao criar notificação:", e);
      }
    } else {
      // Parar o som se não houver alerta ativo
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (e) {
          console.log("Erro ao pausar áudio:", e);
        }
      }
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }
    };
  }, [activeAlert]);

  if (!activeAlert) return null;

  const isFire = activeAlert.type === 'fire';
  const isFirstAid = activeAlert.type === 'firstaid';
  const bgColor = isFire ? 'bg-orange-600' : isFirstAid ? 'bg-emerald-600' : 'bg-red-600';
  const textColor = isFire ? 'text-orange-600' : isFirstAid ? 'text-emerald-600' : 'text-red-600';
  const hoverColor = isFire ? 'hover:bg-orange-50' : isFirstAid ? 'hover:bg-emerald-50' : 'hover:bg-red-50';

  const canResolve = currentUser?.role === 'admin' || (activeAlert.triggeredBy && currentUser?.id === activeAlert.triggeredBy.id);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${bgColor} animate-pulse-fast overflow-y-auto`}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-max py-12">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce shrink-0">
          {isFire ? (
            <Flame className="w-14 h-14 text-white" />
          ) : isFirstAid ? (
            <Plus className="w-14 h-14 text-white" strokeWidth={3} />
          ) : (
            <AlertOctagon className="w-14 h-14 text-white" />
          )}
        </div>
        
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
          {isFire ? 'Incêndio!' : isFirstAid ? 'Socorro Médico!' : 'Emergência!'}
        </h1>
        
        <div className="bg-black/20 rounded-2xl p-6 backdrop-blur-sm w-full max-w-sm">
          <p className="text-white/80 text-sm mb-1">Acionado por:</p>
          <div className="flex items-center justify-center gap-3 mb-6">
            {activeAlert.triggeredBy?.photo && (
              <img src={activeAlert.triggeredBy.photo} alt="" className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" />
            )}
            <p className="text-2xl font-bold text-white">{activeAlert.triggeredBy?.name || 'Usuário Desconhecido'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-left">
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-white/60 text-xs">Setor do Usuário</p>
              <p className="text-white font-medium">{activeAlert.triggeredBy?.sector || 'N/A'}</p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-white/60 text-xs">Contato</p>
              <p className="text-white font-medium">{activeAlert.triggeredBy?.phone || 'N/A'}</p>
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
