import React from 'react';
import { X, Flame, Activity, Wind, Map, Lock, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SafetyGuideModalProps {
  guideId: string;
  onClose: () => void;
}

const GUIDES_CONTENT: Record<string, { title: string, icon: any, color: string, content: React.ReactNode }> = {
  fire: {
    title: 'Incêndio',
    icon: Flame,
    color: 'text-orange-500',
    content: (
      <div className="space-y-4">
        <section className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-orange-500 mb-2">1. Avaliar e Alertar (Ação Imediata)</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> **Mantenha a calma:** Evite pânico para tomar decisões seguras.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> **Acione o alarme:** Se houver um sistema de alarme de incêndio, acione-o.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> **Avalie o risco:** Se o fogo estiver alto, houver muita fumaça ou o ambiente estiver muito quente, não tente apagar.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> **Comunique:** Avise as pessoas próximas e peça para alguém ligar para o Corpo de Bombeiros (193) imediatamente.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> **Evacue o local:** com calma e de forma ordenada.</li>
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
          <h4 className="font-black text-[10px] uppercase tracking-widest text-emerald-500 mb-2">Avaliação da Cena (Segurança)</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> **Verifique o local:** Antes de se aproximar, garanta que o ambiente é seguro para você e para a vítima (risco de trânsito, fogo, fios elétricos, produtos tóxicos).</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> **Não se torne uma vítima:** Se a cena for perigosa, não se aproxime e aguarde ajuda especializada.</li>
          </ul>
        </section>
        <section className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Avaliação da Vítima (Consciência e Respiração)</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" /> **Chame a vítima:** Verifique se ela responde.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" /> **Verifique a respiração:** Observe se há movimento no peito.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> **Inconsciência:** Se a vítima não responder e não respirar (ou apenas ofegar), inicie a reanimação.</li>
          </ul>
        </section>
        <section className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-emerald-500 mb-2">Acionar Socorro Especializado (192 ou 193)</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2 items-start"><Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Ligue para o **SAMU (192)** para emergências clínicas (infarto, AVC, convulsão).</li>
            <li className="flex gap-2 items-start"><Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Ligue para os **Bombeiros (193)** para acidentes, traumas, incêndios ou vítimas presas.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" /> Ao ligar, informe o local exato, número de vítimas e estado aparente delas.</li>
          </ul>
        </section>
      </div>
    )
  },
  evacuation: {
    title: 'Evacuação',
    icon: Wind,
    color: 'text-blue-500',
    content: (
      <div className="space-y-4">
        <section className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-500 mb-2">2. Evacuação</h4>
          <ul className="text-sm text-slate-300 space-y-3">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> **Mantenha a calma:** Evite pânico para tomar decisões seguras.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> **Organize:** Peça aos alunos que levantem e formem uma fila indiana.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> **Não levem objetos pessoais:** Deixem bolsas, mochilas e outros itens fora do alcance.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> **Saiam da sala:** Com calma e ordem, dirijam-se a saída mais próxima, seguindo o fluxo e orientação dos brigadistas.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> **Desçam as escadas:** Sempre pelo lado direito, segurando o corrimão.</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> **Ponto de encontro:** Dirijam-se ao ponto de encontro.</li>
          </ul>
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
    title: 'Lockdown',
    icon: Lock,
    color: 'text-indigo-500',
    content: (
      <div className="space-y-4">
        <section className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-500 mb-4">4. Lockdown</h4>
          <div className="space-y-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-blue-500">
               <p className="text-sm font-black text-blue-400 uppercase tracking-wider mb-1">Passo 1</p>
               <p className="text-xs text-slate-300">**Mantenha a calma:** Evite pânico para tomar decisões seguras.</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-amber-500">
               <p className="text-sm font-black text-amber-400 uppercase tracking-wider mb-1">Passo 2</p>
               <p className="text-xs text-slate-300">**Feche a porta e bloqueie-a:** Tranque a porta e utilize mesas e cadeiras para bloqueá-la.</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-indigo-500">
               <p className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-1">Passo 3</p>
               <p className="text-xs text-slate-300">**Desliguem as luzes:** Apaguem a luzes e desliguem as telas dos celulares e computadores.</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-cyan-500">
               <p className="text-sm font-black text-cyan-400 uppercase tracking-wider mb-1">Passo 4</p>
               <p className="text-xs text-slate-300">**Mantenham-se:** Longe de portas e janelas e fiquem abaixados.</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border-l-4 border-l-emerald-500">
               <p className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-1">Conclusão</p>
               <p className="text-xs text-slate-300">**Aguardem:** Aguardem a liberação por algum funcionário, de que está tudo bem.</p>
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
