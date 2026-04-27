import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { AlertOctagon, Flame, Map, X, CheckCircle2, Plus, Volume2, VolumeX, ShieldAlert, Copy, Check } from 'lucide-react';
import { Chat } from './Chat';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../lib/audio';

export function AlertOverlay() {
  const { alerts, resolveAlert, dismissedAlertIds, dismissAlert, user } = useStore();
  const [muted, setMuted] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const activeAlerts = alerts.filter(a => a.active);
  const activeAlert = activeAlerts.find(a => !dismissedAlertIds.includes(a.id));

  const copyToClipboard = () => {
    if (activeAlert?.location) {
      const coords = `${activeAlert.location.lat}, ${activeAlert.location.lng}`;
      navigator.clipboard.writeText(coords);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const lastNotificationTime = useRef<number>(0);

  useEffect(() => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(e => console.log("Permissão de notificação ignorada:", e));
      }
    } catch (e) {
      console.log("Erro ao solicitar permissão de notificação:", e);
    }
  }, []);

  const showSystemNotification = (alert: any) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    const isFire = alert.type === 'fire';
    const isFirstAid = alert.type === 'firstaid';
    const title = isFire ? '🚨 INCÊNDIO! - SENTINELA' : isFirstAid ? '🚨 PRIMEIROS SOCORROS' : '🚨 ALERTA DE EMERGÊNCIA';
    const options: any = {
      body: `${alert.triggeredBy?.name || 'Alguém'} precisa de ajuda no setor: ${alert.triggeredBy?.sector || 'Desconhecido'}`,
      icon: '/icons/icon-192x192.png',
      vibrate: [500, 200, 500, 200, 500],
      requireInteraction: true,
      tag: 'emergency-alert',
      renotify: true
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
    lastNotificationTime.current = Date.now();
  };

  useEffect(() => {
    if (activeAlert) {
      const vibrationInterval = setInterval(() => {
        if ('vibrate' in navigator) {
          navigator.vibrate([1000, 500, 1000]);
        }
      }, 2500);
      
      if (!muted) {
        audioManager.play();
      } else {
        audioManager.stop();
      }

      showSystemNotification(activeAlert);

      const notificationInterval = setInterval(() => {
        showSystemNotification(activeAlert);
      }, 15000);

      return () => {
        clearInterval(vibrationInterval);
        clearInterval(notificationInterval);
        audioManager.stop();
      };
    }
  }, [activeAlert?.id, activeAlert?.active, muted]);

  if (!activeAlert) return null;

  const isFire = activeAlert.type === 'fire';
  const isFirstAid = activeAlert.type === 'firstaid';
  const isLockdown = activeAlert.type === 'lockdown';
  
  const theme = {
    bg: isFire ? 'bg-orange-600' : isFirstAid ? 'bg-emerald-600' : isLockdown ? 'bg-indigo-900 text-white' : 'bg-red-600',
    accent: isFire ? 'text-orange-200' : isFirstAid ? 'text-emerald-200' : 'text-red-200',
    pulse: isFire ? 'bg-orange-400' : isFirstAid ? 'bg-emerald-400' : 'bg-red-400',
    iconBg: isFire ? 'bg-orange-500/20' : isFirstAid ? 'bg-emerald-500/20' : 'bg-red-500/20'
  };

  const canResolve = user?.role === 'admin' || (activeAlert.triggeredBy && user?.id === activeAlert.triggeredBy.id);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed inset-0 z-50 flex flex-col ${theme.bg} overflow-hidden`}
      >
        {/* Background Animation Layers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 ${theme.pulse} opacity-20 blur-3xl`}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center bg-black/10 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            <span className="text-white font-black tracking-tighter text-xl">SENTINELA • SOS</span>
          </div>
          <button 
            onClick={() => setMuted(!muted)}
            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
          >
            {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-bounce" />}
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center custom-scrollbar">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 relative"
          >
            <div className={`w-32 h-32 ${theme.iconBg} rounded-full flex items-center justify-center border-4 border-white/30 backdrop-blur-md`}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {isFire ? (
                  <Flame className="w-16 h-16 text-white" />
                ) : isFirstAid ? (
                  <Plus className="w-16 h-16 text-white" strokeWidth={3} />
                ) : (
                  <AlertOctagon className="w-16 h-16 text-white" />
                )}
              </motion.div>
            </div>
            <motion.div 
              animate={{ r: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full scale-125"
            />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tighter mb-2 drop-shadow-lg">
            {isFire ? 'Fogo Detectado' : isFirstAid ? 'Socorro Médico' : isLockdown ? 'Lockdown Ativo' : 'Emergência'}
          </h1>
          <p className={`${theme.accent} font-bold text-lg mb-8 uppercase tracking-widest bg-black/20 px-4 py-1 rounded-full`}>
            Ação Imediata Necessária
          </p>

          <div className="w-full max-w-lg space-y-4">
            {/* Requester Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {activeAlert.triggeredBy?.photo ? (
                     <img src={activeAlert.triggeredBy.photo} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xl" />
                  ) : (
                     <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl border-2 border-white">
                       {activeAlert.triggeredBy?.name?.[0].toUpperCase()}
                     </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-white">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-white text-xl font-black leading-tight">{activeAlert.triggeredBy?.name || 'Solicitante'}</h3>
                  <p className="text-white/70 text-sm font-medium">{activeAlert.triggeredBy?.sector || 'Setor Não Informado'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-white/50 text-[10px] font-bold uppercase mb-1">Status</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    Ao Vivo
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-white/50 text-[10px] font-bold uppercase mb-1">Telefone</p>
                  <p className="text-white font-bold">{activeAlert.triggeredBy?.phone || 'N/A'}</p>
                </div>
              </div>

              {activeAlert.specificLocation && (
                <div className="bg-black/40 p-4 rounded-xl border-l-4 border-white mb-6">
                  <p className="text-white/50 text-[10px] font-bold uppercase mb-1">Localização Específica</p>
                  <p className="text-white text-xl font-black">{activeAlert.specificLocation}</p>
                </div>
              )}

              {activeAlert.location && (
                <div className="flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${activeAlert.location.lat},${activeAlert.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[3] flex items-center justify-center gap-3 bg-white text-slate-950 font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl text-xs sm:text-sm"
                  >
                    <Map className="w-5 h-5 sm:w-6 sm:h-6" />
                    VER MAPA
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 active:scale-95 transition-all border border-white/20"
                    title="Copiar Coordenadas"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 overflow-hidden border border-white/10">
              <Chat alertId={activeAlert.id} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 p-6 bg-black/20 backdrop-blur-xl flex flex-col gap-3 border-t border-white/10">
          <div className="flex gap-3">
             <button
              onClick={() => dismissAlert(activeAlert.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all border border-white/20 active:scale-95"
            >
              <X className="w-5 h-5" />
              MINIMIZAR
            </button>
            
            {canResolve && (
              <button
                onClick={() => resolveAlert(activeAlert.id, 'Encerrado via interface')}
                className="flex-[2] flex items-center justify-center gap-3 bg-white text-red-600 font-extrabold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95"
              >
                <CheckCircle2 className="w-6 h-6" />
                RESOLVER AGORA
              </button>
            )}
          </div>
          <p className="text-center text-white/40 text-[10px] font-medium tracking-widest uppercase">
            Sistema de Alerta Sentinel 24/7 • Prioridade Máxima
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

