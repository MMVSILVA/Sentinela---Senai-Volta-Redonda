import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, AlertTriangle, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export function PanicButton() {
  const { currentGroup, selectGroup, triggerAlert } = useStore();
  const [isPressing, setIsPressing] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handlePanic = () => {
    if (gettingLocation) return;
    
    setGettingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          triggerAlert({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGettingLocation(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          triggerAlert(); // Trigger anyway without location
          setGettingLocation(false);
        },
        { timeout: 5000 }
      );
    } else {
      triggerAlert();
      setGettingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="flex items-center p-4 border-b border-zinc-900">
        <button 
          onClick={() => selectGroup('')}
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="ml-2">
          <h2 className="text-lg font-bold text-white">{currentGroup?.name}</h2>
          <p className="text-xs text-zinc-500">ID: {currentGroup?.id}</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Pulsing background effect when pressing */}
        <div className={cn(
          "absolute inset-0 bg-red-500/20 transition-opacity duration-1000 rounded-full blur-3xl scale-150",
          isPressing ? "opacity-100" : "opacity-0"
        )} />

        <div className="relative z-10 flex flex-col items-center">
          <button
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onMouseLeave={() => setIsPressing(false)}
            onTouchStart={() => setIsPressing(true)}
            onTouchEnd={() => setIsPressing(false)}
            onClick={handlePanic}
            disabled={gettingLocation}
            className={cn(
              "w-64 h-64 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-200 shadow-2xl",
              "border-8 border-zinc-900",
              isPressing 
                ? "bg-red-700 scale-95 shadow-[0_0_100px_rgba(220,38,38,0.8)]" 
                : "bg-red-600 hover:bg-red-500 hover:scale-105 shadow-[0_0_50px_rgba(220,38,38,0.5)]",
              gettingLocation && "opacity-80 cursor-wait"
            )}
          >
            <AlertTriangle className={cn(
              "w-20 h-20 text-white transition-transform duration-200",
              isPressing && "scale-90"
            )} />
            <span className="text-white font-bold text-2xl tracking-wider uppercase">
              {gettingLocation ? 'Enviando...' : 'Pânico'}
            </span>
          </button>

          <p className="mt-12 text-zinc-400 text-center max-w-xs">
            Pressione o botão acima em caso de emergência. Todos os membros do grupo <strong>{currentGroup?.name}</strong> serão notificados imediatamente.
          </p>
          
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full">
            <MapPin className="w-4 h-4" />
            Sua localização será enviada junto com o alerta
          </div>
        </div>
      </main>
    </div>
  );
}
