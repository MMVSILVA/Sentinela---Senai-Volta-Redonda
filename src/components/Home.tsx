import React, { useState, useRef, useEffect } from 'react';
import { useStore, AlertType } from '../store/useStore';
import { AlertCircle, Flame, Phone, ShieldAlert, Siren, Plus, Ambulance, Zap, Lock, Globe, Smartphone, Bell, BookOpen, Activity, Map, Wind, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { NotificationPermission } from './NotificationPermission';
import { Logo } from './Logo';
import { SafetyGuideModal } from './SafetyGuideModal';

export function Home() {
  const { user, triggerAlert, events, subscribeToEvents, setTab } = useStore();
  const [pressingType, setPressingType] = useState<AlertType | null>(null);
  const [progress, setProgress] = useState(0);
  const [specificLocation, setSpecificLocation] = useState('');
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToEvents();
    return () => unsub();
  }, [subscribeToEvents]);

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
    <div className="flex flex-col h-full p-6">
      <div className="-mx-6 -mt-6 mb-6">
        <NotificationPermission />
      </div>
      <header className="flex items-center gap-4 mb-8 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Logo size="lg" className="rotate-12" />
        </div>
        <img 
          src={user.photo} 
          alt={user.name} 
          className="w-14 h-14 rounded-full object-cover border-2 border-slate-600 shadow-md z-10"
        />
        <div className="z-10 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Sentinela - Em Operação
            </h1>
          </div>
          <h2 className="text-xl font-black text-white leading-tight tracking-tight">{user.name}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter opacity-80">{user.sector}</p>
        </div>
        <Logo size="sm" className="hidden sm:flex z-10" />
      </header>

      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Localização exata do incidente (Opcional)
        </label>
        <input
          type="text"
          value={specificLocation}
          onChange={(e) => setSpecificLocation(e.target.value)}
          placeholder="Ex: Andar 2, Sala de Reuniões B"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-500"
        />
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-400" />
            Intelligence Feed
          </h3>
          <button 
            onClick={() => setTab('alerts')} 
            className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
          >
            Ver Calendário
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {/* Calendar Events (Priority) */}
          {events.length > 0 && events.map(event => (
            <div key={event.id} className="min-w-[280px] snap-center bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-4 rounded-2xl shadow-xl border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                   <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="font-bold text-white text-sm truncate">{event.title}</h4>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{new Date(event.date).getDate()}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  {new Date(event.date).toLocaleDateString('pt-BR', { month: 'long' })} • {event.location}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] mt-1 font-black uppercase tracking-widest opacity-80 line-clamp-1">
                {event.description}
              </p>
            </div>
          ))}

          {/* Fixed Knowledge Cards */}
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
            <p className="text-slate-300 text-xs leading-relaxed">
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
            <p className="text-slate-300 text-xs leading-relaxed">
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
            <p className="text-slate-300 text-xs leading-relaxed">
              O método "Correr, Esconder, Lutar" para situações críticas.
            </p>
          </div>

          <div 
            onClick={() => setActiveGuide('risk_map')}
            className="min-w-[260px] snap-center bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-xl cursor-pointer hover:border-amber-500/60 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <Map className="w-5 h-5 text-amber-500" />
              </div>
              <h4 className="font-bold text-white text-sm">Mapa de Riscos</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Legenda de classificação por zonas de perigo e cores.
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

      <div className="mt-8 mb-4">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen className="w-3 h-3 text-blue-400" />
          Safety Intelligence Library
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'fire', icon: Flame, label: 'Combate Incêndio', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'first_aid', icon: Activity, label: 'Primeiros Socorros', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'evacuation', icon: Wind, label: 'Plano de Evasão', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'risk_map', icon: Map, label: 'Mapa de Riscos', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { id: 'lockdown', icon: Lock, label: 'Protocolo Lockdown', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'health', icon: Activity, label: 'Saúde & Bem-Estar', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { id: 'contact', icon: Phone, label: 'Fluxo Emergência', color: 'text-rose-500', bg: 'bg-rose-500/10' }
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
              <guide.icon className={cn("w-5 h-5", guide.color)} />
              <span className="text-[10px] font-black uppercase tracking-tight text-white leading-tight">{guide.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8">
        <h3 className="text-slate-400 text-sm font-medium mb-3 text-center">Números de Emergência</h3>
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
