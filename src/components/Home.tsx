import React, { useState, useRef } from 'react';
import { useStore, AlertType } from '../store/useStore';
import { AlertCircle, Flame, Phone, ShieldAlert, Siren, Plus, Ambulance } from 'lucide-react';
import { cn } from '../lib/utils';

export function Home() {
  const { currentUser, triggerAlert } = useStore();
  const [pressingType, setPressingType] = useState<AlertType | null>(null);
  const [progress, setProgress] = useState(0);
  const [specificLocation, setSpecificLocation] = useState('');
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 2000;

  const startPress = (type: AlertType) => {
    setPressingType(type);
    setProgress(0);

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
    }, 50);

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

  const handleTrigger = (type: AlertType) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          triggerAlert(type, {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }, specificLocation);
        },
        (error) => {
          console.error("Erro GPS:", error);
          triggerAlert(type, undefined, specificLocation);
        },
        { timeout: 5000 }
      );
    } else {
      triggerAlert(type, undefined, specificLocation);
    }
    setSpecificLocation('');
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-full p-6">
      <header className="flex items-center gap-4 mb-8 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
        <img 
          src={currentUser.photo} 
          alt={currentUser.name} 
          className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
        />
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">{currentUser.name}</h2>
          <p className="text-slate-400 text-sm">{currentUser.sector}</p>
        </div>
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

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-slate-300 mb-8 text-lg font-medium text-center">
          Pressione e segure para ativar
        </p>

        <div className="flex items-center justify-center gap-6 w-full max-w-md flex-wrap">
          <div className="flex flex-col items-center gap-4">
            <button
              onMouseDown={() => startPress('emergency')}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={() => startPress('emergency')}
              onTouchEnd={stopPress}
              className="relative group"
            >
              <div className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center transition-transform duration-200 shadow-lg",
                "bg-gradient-to-br from-red-500 to-red-700",
                pressingType === 'emergency' ? "scale-95" : "hover:scale-105"
              )}>
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
              {pressingType === 'emergency' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeDasharray={`${progress * 3} 300`} className="transition-all duration-75 ease-linear" />
                </svg>
              )}
            </button>
            <span className="text-red-400 font-semibold text-sm">Emergência</span>
          </div>

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
                "w-28 h-28 rounded-full flex items-center justify-center transition-transform duration-200 shadow-lg",
                "bg-gradient-to-br from-orange-400 to-orange-600",
                pressingType === 'fire' ? "scale-95" : "hover:scale-105"
              )}>
                <Flame className="w-12 h-12 text-white" />
              </div>
              {pressingType === 'fire' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeDasharray={`${progress * 3} 300`} className="transition-all duration-75 ease-linear" />
                </svg>
              )}
            </button>
            <span className="text-orange-400 font-semibold text-sm">Incêndio</span>
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
                "w-28 h-28 rounded-full flex items-center justify-center transition-transform duration-200 shadow-lg",
                "bg-gradient-to-br from-emerald-500 to-emerald-700",
                pressingType === 'firstaid' ? "scale-95" : "hover:scale-105"
              )}>
                <Plus className="w-14 h-14 text-white" strokeWidth={3} />
              </div>
              {pressingType === 'firstaid' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeDasharray={`${progress * 3} 300`} className="transition-all duration-75 ease-linear" />
                </svg>
              )}
            </button>
            <span className="text-emerald-400 font-semibold text-sm">Prim. Socorros</span>
          </div>
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
    </div>
  );
}
