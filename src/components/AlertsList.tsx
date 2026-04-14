import React from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, Flame, CheckCircle2, MapPin, Plus } from 'lucide-react';

export function AlertsList() {
  const { alerts, resolveAlert, currentUser } = useStore();
  
  const allEvents = alerts;

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Todos os Alertas</h1>
        <p className="text-slate-400">Acompanhe as ocorrências na empresa.</p>
      </header>

      <div className="space-y-4">
        {allEvents.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Nenhum alerta registrado.</p>
        ) : (
          allEvents.map(alert => {
            const canResolve = alert.active && (currentUser?.role === 'admin' || (alert.triggeredBy && currentUser?.id === alert.triggeredBy.id));
            
            return (
              <div key={alert.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${alert.type === 'emergency' ? 'bg-red-500/20 text-red-500' : alert.type === 'firstaid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      {alert.type === 'emergency' ? <AlertTriangle className="w-5 h-5" /> : alert.type === 'firstaid' ? <Plus className="w-5 h-5" strokeWidth={3} /> : <Flame className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        {alert.type === 'emergency' ? 'Emergência' : alert.type === 'firstaid' ? 'Primeiros Socorros' : 'Incêndio'}
                      </h4>
                      <p className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${alert.active ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {alert.active ? 'Ativo' : 'Resolvido'}
                  </span>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-3 text-sm space-y-1">
                  <p className="text-slate-300"><span className="text-slate-500">Por:</span> {alert.triggeredBy?.name || 'Usuário Desconhecido'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Setor:</span> {alert.triggeredBy?.sector || 'N/A'}</p>
                  {alert.specificLocation && (
                    <p className="text-white font-medium flex items-center gap-1 mt-2 bg-slate-800 p-2 rounded">
                      <MapPin className="w-4 h-4 text-red-400" />
                      Local: {alert.specificLocation}
                    </p>
                  )}
                </div>

                {canResolve && (
                  <button 
                    onClick={() => resolveAlert(alert.id, 'Resolvido via lista de alertas')}
                    className="mt-2 flex items-center justify-center gap-2 w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como Resolvido
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
