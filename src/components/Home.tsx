import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore, AlertType } from '../store/useStore';
import { AlertCircle, Flame, Phone, ShieldAlert, Siren, Plus, Ambulance, Zap, Lock, Globe, Smartphone, Bell, BookOpen, Activity, Map, Wind, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import { SafetyGuideModal } from './SafetyGuideModal';

export function Home() {
  const { user, triggerAlert, events, subscribeToEvents, setTab, syncGoogleEvents } = useStore();
  const [pressingType, setPressingType] = useState<AlertType | null>(null);
  const [progress, setProgress] = useState(0);
  const [specificLocation, setSpecificLocation] = useState('');
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  useEffect(() => {
    if (user?.googleTokens) {
      syncGoogleEvents();
    }
  }, [user?.googleTokens, syncGoogleEvents]);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<{ lat: number, lng: number } | null>(null);

  const HOLD_DURATION = 1500; // Reduzido para 1.5s para maior rapidez

  const startPress = (type: AlertType) => {
    setPressingType(type);
    setProgress(0);

    // Iniciar busca de GPS IMEDIATAMENTE ao tocar, para ganhar tempo
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lastLocationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        null,
        { enableHighAccuracy: true, timeout: 2000 }
      );
    }

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
    }, 30); 

    pressTimerRef.current = setTimeout(() => {
      handleTrigger(type);
      stopPress();
    }, HOLD_DURATION);
  };

  const stopPress = () => {
    setPressingType(null);
    setProgress(0);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const handleTrigger = async (type: AlertType) => {
    const finalLocation = lastLocationRef.current;
    
    try {
      await triggerAlert(type, finalLocation || undefined, specificLocation);
    } catch (err: any) {
      console.error("Erro ao disparar:", err);
    }
    
    setSpecificLocation('');
    lastLocationRef.current = null;
  };

  if (!user) return null;

  return (
    <div className="flex flex-col p-3 sm:p-6 pb-32">
      <header className="flex items-center gap-3 sm:gap-6 mb-8 sm:mb-10 bg-slate-800/60 p-4 sm:p-6 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden group min-h-[120px] sm:min-h-[160px]">
        <div className="relative z-10 flex-shrink-0">
          <div className="p-1 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-500 shadow-xl">
            <img 
              src={user.photo} 
              alt={user.name} 
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover border border-white/10 shadow-2xl transition-transform group-hover:scale-105 duration-500"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-red-500 w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 sm:border-4 border-slate-900 flex items-center justify-center shadow-lg">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div className="z-10 flex-1 min-w-0 py-1 flex flex-col justify-center">
          <div className="flex flex-col gap-1 mb-1.5 sm:mb-3">
            <span className="text-[7px] sm:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5">Sentinela</span>
            <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 w-fit">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Em Operação</span>
            </div>
          </div>
          <h2 className="text-base sm:text-lg md:text-2xl font-black text-white leading-tight tracking-tight mb-0.5 sm:mb-1 break-words">{user.name}</h2>
          <p className="text-slate-400 text-[9px] sm:text-sm font-bold uppercase tracking-tighter opacity-80 break-words">{user.sector}</p>
        </div>
        <motion.div 
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="flex-shrink-0 flex items-center justify-center p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/10 z-10 transition-all group-hover:bg-white/20 shadow-lg"
        >
          <Logo size="lg" className="sm:hidden" />
          <div className="hidden sm:block">
            <Logo size="xl" />
          </div>
        </motion.div>
      </header>

      <div className="mb-8 sm:mb-14">
        <label className="block text-[10px] sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-3">
          Localização exata (Opcional)
        </label>
        <input
          type="text"
          value={specificLocation}
          onChange={(e) => setSpecificLocation(e.target.value)}
          placeholder="Ex: Andar 2, Sala B"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 sm:py-3 text-xs sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-500"
        />
      </div>

      <div className="mb-10 sm:mb-16">
        <div className="flex justify-between items-center mb-3 sm:mb-6">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3 text-blue-500" />
            Intelligence Feed
          </h3>
          <button 
            onClick={() => setTab('calendar')} 
            className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
          >
            Ver Calendário
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {/* Calendar Events (Priority & Horizontal) */}
          {events && events.length > 0 && events
            .filter(e => new Date(e.date + 'T23:59:59') >= new Date())
            .sort((a,b) => a.date.localeCompare(b.date))
            .map((event, idx) => (
              <div 
                key={event.id} 
                onClick={() => setTab('calendar')}
                className={cn(
                  "min-w-[280px] snap-center border p-4 rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 group",
                  idx === 0 
                    ? "bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/40 border-l-4 border-l-blue-500" 
                    : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg", idx === 0 ? "bg-blue-500/20" : "bg-slate-700/30")}>
                    <Calendar className={cn("w-5 h-5", idx === 0 ? "text-blue-400" : "text-slate-400")} />
                  </div>
                  <h4 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">{event.title}</h4>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-black text-white">
                    {event.date ? new Date(event.date + 'T12:00:00').getDate() : '--'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    {event.date ? new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long' }) : 'Data Indeterminada'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span className="truncate max-w-[140px]">{event.location || 'Local a definir'}</span>
                  {idx === 0 && <span className="text-blue-500 animate-pulse">Próximo Evento</span>}
                </div>
              </div>
            ))
          }

          {/* Fixed Knowledge Cards */}
          <div 
            onClick={() => setTab('calendar')}
            className="min-w-[260px] snap-center bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/30 p-4 rounded-2xl shadow-xl cursor-pointer hover:border-blue-500/60 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Marcar Novo Evento</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
              Agende treinamentos, vistorias ou reuniões de segurança.
            </p>
          </div>

          <div 
            onClick={() => setActiveGuide('fire')}
            className="min-w-[260px] snap-center bg-gradient-to-br from-orange-900/20 to-slate-900 border border-orange-500/30 p-4 rounded-2xl shadow-xl cursor-pointer hover:border-orange-500/60 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <h4 className="font-bold text-white text-sm">Combate a Incêndio</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
              Primeiras ações e rotas de fuga. Saiba como agir em segundos.
            </p>
          </div>

          <div 
            onClick={() => setActiveGuide('first_aid')}
            className="min-w-[260px] snap-center bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl shadow-xl cursor-pointer hover:border-emerald-500/60 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <h4 className="font-bold text-white text-sm">Primeiros Socorros</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
              Manobra de Heimlich e RCP. Conheça as técnicas vitais.
            </p>
          </div>

          <div 
            onClick={() => setActiveGuide('lockdown')}
            className="min-w-[260px] snap-center bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 p-4 rounded-2xl shadow-xl cursor-pointer hover:border-indigo-500/60 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Protocolo Lockdown</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
              O método "Correr, Esconder, Lutar" para situações críticas.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-slate-300 mb-8 text-lg font-medium text-center">
          Pressione e segure para ativar
        </p>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full max-w-md place-items-center">
          <div className="flex flex-col items-center gap-4">
            <button
              onMouseDown={() => startPress('fire')}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={() => startPress('fire')}
              onTouchEnd={stopPress}
              className="relative group"
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-200 shadow-lg",
                "bg-gradient-to-br from-orange-400 to-orange-600",
                pressingType === 'fire' ? "scale-95" : "hover:scale-105"
              )}>
                <Flame className="w-10 h-10 text-white" />
              </div>
              {pressingType === 'fire' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeDasharray={`${progress * 3} 300`} className="transition-all duration-75 ease-linear" />
                </svg>
              )}
            </button>
            <span className="text-orange-400 font-semibold text-xs">Incêndio</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onMouseDown={() => startPress('firstaid')}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={() => startPress('firstaid')}
              onTouchEnd={stopPress}
              className="relative group"
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-200 shadow-lg",
                "bg-gradient-to-br from-emerald-500 to-emerald-700",
                pressingType === 'firstaid' ? "scale-95" : "hover:scale-105"
              )}>
                <Plus className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              {pressingType === 'firstaid' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeDasharray={`${progress * 3} 300`} className="transition-all duration-75 ease-linear" />
                </svg>
              )}
            </button>
            <span className="text-emerald-400 font-semibold text-xs">Prim. Socorros</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onMouseDown={() => startPress('lockdown')}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={() => startPress('lockdown')}
              onTouchEnd={stopPress}
              className="relative group"
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-200 shadow-lg",
                "bg-gradient-to-br from-blue-500 to-blue-700",
                pressingType === 'lockdown' ? "scale-95" : "hover:scale-105"
              )}>
                <Lock className="w-10 h-10 text-white" />
              </div>
              {pressingType === 'lockdown' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeDasharray={`${progress * 3} 300`} className="transition-all duration-75 ease-linear" />
                </svg>
              )}
            </button>
            <span className="text-blue-400 font-semibold text-xs">Lockdown</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onMouseDown={() => startPress('simulated')}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={() => startPress('simulated')}
              onTouchEnd={stopPress}
              className="relative group"
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-200 shadow-lg",
                "bg-gradient-to-br from-slate-500 to-slate-700",
                pressingType === 'simulated' ? "scale-95" : "hover:scale-105"
              )}>
                <Zap className="w-10 h-10 text-white" />
              </div>
              {pressingType === 'simulated' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeDasharray={`${progress * 3} 300`} className="transition-all duration-75 ease-linear" />
                </svg>
              )}
            </button>
            <span className="text-slate-400 font-semibold text-xs">Simulado (Evasão)</span>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-16 mb-6 sm:mb-10">
        <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-6 flex items-center gap-2">
          <BookOpen className="w-3 h-3 text-blue-400" />
          Safety Intelligence Library
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[
            { id: 'fire', Icon: Flame, label: 'Combate Incêndio', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'first_aid', Icon: Activity, label: 'Primeiros Socorros', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'evacuation', Icon: Wind, label: 'Plano de Evasão', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'risk_map', Icon: Map, label: 'Mapa de Riscos', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { id: 'lockdown', Icon: Lock, label: 'Protocolo Lockdown', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'health', Icon: Activity, label: 'Saúde & Bem-Estar', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { id: 'contact', Icon: Phone, label: 'Fluxo Emergência', color: 'text-rose-500', bg: 'bg-rose-500/10' }
          ].map(guide => (
            <button 
              key={guide.id}
              onClick={() => setActiveGuide(guide.id)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 text-left",
                guide.bg,
                "border-white/5 hover:border-white/20"
              )}
            >
              <guide.Icon className={cn("w-5 h-5", guide.color)} />
              <span className="text-[10px] font-black uppercase tracking-tight text-white leading-tight">{guide.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-10 sm:pt-24">
        <h3 className="text-slate-400 text-xs sm:text-sm font-medium mb-3 sm:mb-6 text-center">Números de Emergência</h3>
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:193" className="flex flex-col items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl p-3 transition-colors">
            <Flame className="w-6 h-6 text-red-500" />
            <span className="text-xs text-red-400 font-medium">Bombeiros</span>
            <span className="text-lg font-bold text-red-500">193</span>
          </a>
          <a href="tel:192" className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl p-3 transition-colors">
            <Ambulance className="w-6 h-6 text-emerald-500" />
            <span className="text-xs text-emerald-400 font-medium">SAMU</span>
            <span className="text-lg font-bold text-emerald-500">192</span>
          </a>
          <a href="tel:190" className="flex flex-col items-center justify-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl p-3 transition-colors">
            <ShieldAlert className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-blue-400 font-medium">Polícia</span>
            <span className="text-lg font-bold text-blue-500">190</span>
          </a>
          <a href="tel:199" className="flex flex-col items-center justify-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl p-3 transition-colors">
            <Siren className="w-6 h-6 text-amber-500" />
            <span className="text-xs text-amber-400 font-medium">Defesa Civil</span>
            <span className="text-lg font-bold text-amber-500">199</span>
          </a>
        </div>
      </div>

      {activeGuide && (
        <SafetyGuideModal 
          guideId={activeGuide} 
          onClose={() => setActiveGuide(null)} 
        />
      )}
    </div>
  );
}
