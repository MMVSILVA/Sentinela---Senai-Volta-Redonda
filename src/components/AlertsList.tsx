import React from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, Flame, CheckCircle2, MapPin, Plus, Zap, Lock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chat } from './Chat';

export function AlertsList() {
  const { alerts, resolveAlert, user } = useStore();
  const [expandedAlertId, setExpandedAlertId] = React.useState<string | null>(null);
  
  const allEvents = alerts;

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'emergency':
        return { label: 'Emergência', icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-500/20 text-red-500' };
      case 'fire':
        return { label: 'Incêndio', icon: <Flame className="w-5 h-5" />, color: 'bg-orange-500/20 text-orange-500' };
      case 'firstaid':
        return { label: 'Primeiros Socorros', icon: <Plus className="w-5 h-5" strokeWidth={3} />, color: 'bg-emerald-500/20 text-emerald-500' };
      case 'lockdown':
        return { label: 'Lockdown', icon: <Lock className="w-5 h-5" />, color: 'bg-blue-500/20 text-blue-500' };
      case 'simulated':
        return { label: 'Simulado (Evasão)', icon: <Zap className="w-5 h-5" />, color: 'bg-slate-500/20 text-slate-500' };
      default:
        return { label: 'Alerta', icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-slate-500/20 text-slate-500' };
    }
  };

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
            const canResolve = alert.active && (user?.role === 'admin' || (alert.triggeredBy && user?.id === alert.triggeredBy.id));
            const config = getAlertConfig(alert.type);
            
            return (
              <motion.div 
                key={alert.id} 
                className={`bg-slate-800 rounded-xl p-4 border flex flex-col gap-3 relative overflow-hidden ${alert.active ? 'border-red-500/40' : 'border-slate-700'}`}
                initial={alert.active ? { scale: 0.98 } : false}
                animate={alert.active ? { 
                  scale: [1, 1.015, 1],
                  borderColor: ['rgba(239,68,68,0.2)', 'rgba(239,68,68,0.8)', 'rgba(239,68,68,0.2)'],
                  boxShadow: [
                    '0 0 0px rgba(239,68,68,0)',
                    '0 0 20px rgba(239,68,68,0.2)',
                    '0 0 0px rgba(239,68,68,0)'
                  ]
                } : {}}
                transition={alert.active ? { 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                {alert.active && (
                  <motion.div 
                    className="absolute inset-0 bg-red-500/5 pointer-events-none"
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        {config.label}
                      </h4>
                      <p className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${alert.active ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {alert.active ? 'Ativo' : 'Resolvido'}
                  </span>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-3 text-sm space-y-1 relative z-10">
                  <p className="text-slate-300"><span className="text-slate-500">Por:</span> {alert.triggeredBy?.name || 'Usuário Desconhecido'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Setor:</span> {alert.triggeredBy?.sector || 'N/A'}</p>
                  {alert.specificLocation && (
                    <p className="text-white font-medium flex items-center gap-1 mt-2 bg-slate-800 p-2 rounded">
                      <MapPin className="w-4 h-4 text-red-400" />
                      Local: {alert.specificLocation}
                    </p>
                  )}
                </div>

                {alert.active && (
                  <button 
                    onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                    className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg transition-all text-sm font-medium relative z-10 ${
                      expandedAlertId === alert.id 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {expandedAlertId === alert.id ? 'Fechar Chat' : 'Abrir Chat de Emergência'}
                  </button>
                )}

                <AnimatePresence>
                  {expandedAlertId === alert.id && alert.active && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden relative z-10"
                    >
                      <Chat alertId={alert.id} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {canResolve && (
                  <button 
                    onClick={() => resolveAlert(alert.id, 'Resolvido via lista de alertas')}
                    className="mt-2 flex items-center justify-center gap-2 w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-2 rounded-lg transition-colors text-sm font-medium relative z-10"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como Resolvido
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
