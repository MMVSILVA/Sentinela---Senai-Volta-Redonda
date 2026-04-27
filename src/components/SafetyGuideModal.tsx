import React from 'react';
import { X, Flame, Activity, Wind, Map, Lock, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SafetyGuideModalProps {
  guideId: string;
  onClose: () => void;
}

const GUIDES_CONTENT: Record<string, { title: string, icon: any, color: string, content: React.ReactNode }> = {
  fire: {
    title: 'Combate a Incêndio',
    icon: Flame,
    color: 'text-orange-500',
    content: (
      <div className="space-y-4">
        <section className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-orange-500 mb-2">Primeiras Ações</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> Mantenha a calma e acione o alarme de incêndio.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> Ligue imediatamente para os Bombeiros (193).</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> Se o fogo for pequeno, use o extintor adequado (Pó ABC para geral).</li>
          </ul>
        </section>
        <section className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Evacuação Segura</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> Nunca utilize os elevadores.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" /> Se houver fumaça, caminhe agachado próximo ao chão.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" /> Toque as portas antes de abrir: se estiverem quentes, não abra.</li>
          </ul>
        </section>
      </div>
    )
  },
  first_aid: {
    title: 'Primeiros Socorros',
    icon: Activity,
    color: 'text-emerald-500',
    content: (
      <div className="space-y-4">
        <section className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-emerald-500 mb-2">Engasgo (Manobra de Heimlich)</h4>
          <p className="text-sm text-slate-300">Posicione-se atrás da pessoa, envolva os braços na cintura e aplique compressões rápidas para cima e para dentro, acima do umbigo.</p>
        </section>
        <section className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Parada Cardiorrespiratória (RCP)</h4>
          <p className="text-sm text-slate-300 mb-2">1. Verifique a consciência.</p>
          <p className="text-sm text-slate-300 mb-2">2. Peça para alguém ligar 192 e buscar um DEA.</p>
          <p className="text-sm text-slate-300">3. Inicie compressões torácicas: 100 a 120 por minuto no centro do peito.</p>
        </section>
      </div>
    )
  },
  evacuation: {
    title: 'Plano de Evasão',
    icon: Wind,
    color: 'text-blue-500',
    content: (
      <div className="space-y-4">
        <section className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-500 mb-2">Ponto de Encontro</h4>
          <p className="text-sm text-slate-300">Em caso de sirene contínua, dirija-se ao **Estacionamento Central (Ponto A)**. Não retorne ao prédio até que a Brigada autorize.</p>
        </section>
        <div className="aspect-video bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Mapa de Evasão Digital</span>
        </div>
      </div>
    )
  },
  risk_map: {
    title: 'Mapa de Riscos',
    icon: Map,
    color: 'text-amber-500',
    content: (
      <div className="space-y-4">
        <section className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-amber-500 mb-2">Zonas de Perigo</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><div className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0" /> **Vermelho:** Risco Crítico (Área de Máquinas)</li>
            <li className="flex gap-2 items-start"><div className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" /> **Amarelo:** Risco Médio (Manutenção)</li>
            <li className="flex gap-2 items-start"><div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" /> **Azul:** Risco Leve (Escritórios)</li>
          </ul>
        </section>
      </div>
    )
  },
  lockdown: {
    title: 'Protocolo Lockdown',
    icon: Lock,
    color: 'text-indigo-500',
    content: (
      <div className="space-y-4">
        <section className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-500 mb-2">Procedimento em Situação de Atirador ou Intruso</h4>
          <div className="space-y-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-blue-500">
               <p className="text-sm font-black text-blue-400 uppercase tracking-wider mb-1">1. CORRER</p>
               <p className="text-xs text-slate-300">Se houver um caminho seguro, fuja imediatamente. Deixe pertences para trás. Ajude outros se possível, mas não espere.</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-amber-500">
               <p className="text-sm font-black text-amber-400 uppercase tracking-wider mb-1">2. ESCONDER</p>
               <p className="text-xs text-slate-300">Se não puder fugir, entre em uma sala. Tranque a porta, apague as luzes, silencie o celular (vibração também desativada) e fique longe das janelas.</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-red-500">
               <p className="text-sm font-black text-red-400 uppercase tracking-wider mb-1">3. LUTAR</p>
               <p className="text-xs text-slate-300">Como último recurso e apenas se sua vida estiver em perigo imediato. Tente desarmar ou incapacitar o invasor usando força total e objetos próximos.</p>
            </div>
          </div>
        </section>
      </div>
    )
  },
  contact: {
    title: 'Fluxo de Emergência',
    icon: Phone,
    color: 'text-rose-500',
    content: (
      <div className="space-y-4">
        <div className="border-l-2 border-rose-500 pl-4 py-2 space-y-4">
          <div className="relative">
            <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <h5 className="font-bold text-white text-xs uppercase">1. Detecção</h5>
            <p className="text-[10px] text-slate-500">Colaborador identifica o risco</p>
          </div>
          <div className="relative">
            <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-rose-500" />
            <h5 className="font-bold text-white text-xs uppercase">2. Acionamento Sentinela</h5>
            <p className="text-[10px] text-slate-500">Botão de pânico pressionado</p>
          </div>
          <div className="relative">
            <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-rose-500" />
            <h5 className="font-bold text-white text-xs uppercase">3. Resposta da Brigada</h5>
            <p className="text-[10px] text-slate-500">Notificação central e início do combate</p>
          </div>
        </div>
      </div>
    )
  },
  health: {
    title: 'Saúde & Bem-Estar',
    icon: Activity,
    color: 'text-cyan-400',
    content: (
      <div className="space-y-4">
        <section className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-cyan-400 mb-2">Ergonomia no Trabalho</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" /> Mantenha a tela à altura dos olhos.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" /> Pés sempre apoiados no chão ou suporte.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" /> Faça pausas para alongamento a cada 2 horas.</li>
          </ul>
        </section>
        <section className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Pausas Ativas</h4>
          <p className="text-sm text-slate-300">Levante-se, caminhe por 5 minutos e beba água. O descanso mental é essencial para a segurança operacional.</p>
        </section>
      </div>
    )
  }
};

export function SafetyGuideModal({ guideId, onClose }: SafetyGuideModalProps) {
  const guide = GUIDES_CONTENT[guideId];
  if (!guide) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500">
      <div className="bg-[#161B22] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-slate-800 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full my-2" onClick={onClose} />
        </div>
        
        <header className="p-8 pb-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className={cn("p-2.5 rounded-2xl bg-white/5", guide.color)}>
                 <guide.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">{guide.title}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Operação Sentinela</p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
           >
             <X className="w-5 h-5" />
           </button>
        </header>

        <div className="p-8 pt-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
           {guide.content}
           
           <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leitura Obrigatória</span>
             </div>
             <button 
               onClick={onClose}
               className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
             >
               Entendido
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
