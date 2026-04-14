import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, BrainCircuit, AlertTriangle, Flame, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function Admin() {
  const { alerts, resolveAlert, resetAlerts } = useStore();
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const allEvents = alerts;

  const handleResetAlerts = async () => {
    if (window.confirm("Tem certeza que deseja apagar TODO o histórico de alertas? Esta ação não pode ser desfeita.")) {
      setIsResetting(true);
      await resetAlerts();
      setIsResetting(false);
    }
  };

  const handleDownloadReport = () => {
    const headers = ['ID', 'Tipo', 'Status', 'Acionado Por', 'Setor', 'Data/Hora', 'Resolvido Em'];
    const rows = allEvents.map(alert => [
      alert.id,
      alert.type === 'emergency' ? 'Emergência' : alert.type === 'firstaid' ? 'Primeiros Socorros' : 'Incêndio',
      alert.active ? 'Ativo' : 'Resolvido',
      alert.triggeredBy?.name || 'Desconhecido',
      alert.triggeredBy?.sector || 'N/A',
      new Date(alert.timestamp).toLocaleString(),
      alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_sentinela_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setAiInsight("Erro: Chave da API do Gemini não configurada.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Atue como um especialista em segurança do trabalho. 
        Analise o seguinte histórico de alertas de um aplicativo de pânico corporativo e forneça um breve resumo (máximo 3 parágrafos) com insights e recomendações de segurança.
        
        Dados dos alertas:
        ${JSON.stringify(allEvents.map(e => ({
          tipo: e.type,
          setor: e.triggeredBy?.sector || 'N/A',
          data: new Date(e.timestamp).toISOString()
        })))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAiInsight(response.text || "Nenhum insight gerado.");
    } catch (error) {
      console.error(error);
      setAiInsight("Ocorreu um erro ao gerar a análise da IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Painel do Administrador</h1>
        <p className="text-slate-400">Visão geral de todas as ocorrências e alarmes.</p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <button 
          onClick={handleDownloadReport}
          className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl border border-slate-700 transition-colors"
        >
          <Download className="w-6 h-6 text-blue-400" />
          <span className="text-sm font-medium text-center">Baixar Relatório</span>
        </button>
        
        <button 
          onClick={generateAIInsights}
          disabled={isAnalyzing || allEvents.length === 0}
          className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
        >
          <BrainCircuit className="w-6 h-6 text-purple-400" />
          <span className="text-sm font-medium text-center">{isAnalyzing ? 'Analisando...' : 'Análise com IA'}</span>
        </button>

        <button 
          onClick={handleResetAlerts}
          disabled={isResetting || allEvents.length === 0}
          className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/50 text-white p-4 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-6 h-6 text-red-500" />
          <span className="text-sm font-medium text-center">{isResetting ? 'Apagando...' : 'Resetar Alertas'}</span>
        </button>
      </div>

      {aiInsight && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-100 font-semibold">Insights da IA (Gemini)</h3>
          </div>
          <div className="text-purple-200/80 text-sm leading-relaxed whitespace-pre-wrap">
            {aiInsight}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Histórico de Ocorrências</h2>
        <div className="space-y-3">
          {allEvents.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Nenhuma ocorrência registrada.</p>
          ) : (
            allEvents.map(alert => (
              <div key={alert.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${alert.type === 'emergency' ? 'bg-red-500/20 text-red-500' : alert.type === 'firstaid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      {alert.type === 'emergency' ? <AlertTriangle className="w-5 h-5" /> : alert.type === 'firstaid' ? <Plus className="w-5 h-5" strokeWidth={3} /> : <Flame className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        {alert.type === 'emergency' ? 'Emergência Médica/Geral' : alert.type === 'firstaid' ? 'Primeiros Socorros' : 'Foco de Incêndio'}
                      </h4>
                      <p className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${alert.active ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {alert.active ? 'Ativo' : 'Resolvido'}
                  </span>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-3 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Por:</span> {alert.triggeredBy?.name || 'Usuário Desconhecido'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Setor:</span> {alert.triggeredBy?.sector || 'N/A'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Contato:</span> {alert.triggeredBy?.phone || 'N/A'}</p>
                </div>

                {alert.active && (
                  <button 
                    onClick={() => resolveAlert(alert.id, 'Resolvido pelo painel admin')}
                    className="mt-2 flex items-center justify-center gap-2 w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como Resolvido
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
