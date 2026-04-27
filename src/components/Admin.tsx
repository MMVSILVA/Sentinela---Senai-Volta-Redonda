import React, { useState, useMemo } from 'react';
import { useStore, AlertType } from '../store/useStore';
import { 
  Download, 
  BrainCircuit, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Zap, 
  Lock, 
  Table as TableIcon, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar,
  Filter,
  ArrowUpRight,
  Bell,
  Users,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';

export function Admin() {
  const { alerts, resolveAlert, resetAlerts } = useStore();
  
  // Helper map for colors in chart
  const alertTypeMap: Record<string, string> = {
    'Emergência': 'emergency',
    'Incêndio': 'fire',
    'Primeiros Socorros': 'firstaid',
    'Lockdown': 'lockdown',
    'Simulado (Evasão)': 'simulated'
  };

  const [activeTab, setActiveTab] = useState<'dados' | 'dashboard'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');

  const getAlertLabel = (type: string) => {
    switch (type) {
      case 'emergency': return 'Emergência';
      case 'fire': return 'Incêndio';
      case 'firstaid': return 'Primeiros Socorros';
      case 'lockdown': return 'Lockdown';
      case 'simulated': return 'Simulado (Evasão)';
      default: return 'Alerta';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'fire': return <Flame className="w-4 h-4" />;
      case 'firstaid': return <Plus className="w-4 h-4" strokeWidth={3} />;
      case 'lockdown': return <Lock className="w-4 h-4" />;
      case 'simulated': return <Zap className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'emergency': return '#ef4444'; // red-500
      case 'fire': return '#f59e0b';      // amber-500
      case 'firstaid': return '#10b981';   // emerald-500
      case 'lockdown': return '#3b82f6';   // blue-500
      case 'simulated': return '#64748b';  // slate-500
      default: return '#94a3b8';           // slate-400
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-500/20 text-red-500';
      case 'fire': return 'bg-amber-500/20 text-amber-500';
      case 'firstaid': return 'bg-emerald-500/20 text-emerald-500';
      case 'lockdown': return 'bg-blue-500/20 text-blue-500';
      case 'simulated': return 'bg-slate-500/20 text-slate-500';
      default: return 'bg-slate-500/20 text-slate-500';
    }
  };

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const typeMatch = filterType === 'all' || alert.type === filterType;
      const statusMatch = filterStatus === 'all' || (filterStatus === 'active' ? alert.active : !alert.active);
      const sectorMatch = filterSector === 'all' || alert.triggeredBy?.sector === filterSector;
      return typeMatch && statusMatch && sectorMatch;
    });
  }, [alerts, filterType, filterStatus, filterSector]);

  // Data for Charts
  const chartDataByType = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach(alert => {
      const label = getAlertLabel(alert.type);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value,
      color: getAlertColor(Object.entries(counts).find(([n]) => getAlertLabel(alertTypeMap[n]) === name)?.[0] || 'other')
    }));
  }, [alerts]);

  const chartDataBySector = useMemo(() => {
    const sectorCounts: Record<string, number> = {};
    alerts.forEach(alert => {
      const sector = alert.triggeredBy?.sector || 'N/A';
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    return Object.entries(sectorCounts).map(([name, value]) => ({ name, value }));
  }, [alerts]);

  const chartDataByDay = useMemo(() => {
    const dayCounts: Record<string, number> = {};
    alerts.forEach(alert => {
      const date = new Date(alert.timestamp).toLocaleDateString();
      dayCounts[date] = (dayCounts[date] || 0) + 1;
    });
    return Object.entries(dayCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [alerts]);

  const sectors = useMemo(() => {
    const sSet = new Set<string>();
    alerts.forEach(a => { if (a.triggeredBy?.sector) sSet.add(a.triggeredBy.sector); });
    return Array.from(sSet);
  }, [alerts]);

  const handleDownloadReport = () => {
    const headers = ['ID', 'Tipo', 'Status', 'Acionado Por', 'Setor', 'Data/Hora', 'Resolvido Em'];
    const rows = filteredAlerts.map(alert => [
      alert.id,
      getAlertLabel(alert.type),
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
        Atue como um especialista em segurança do trabalho e analista de dados. 
        Analise o seguinte histórico de alertas de um aplicativo de pânico corporativo e forneça um breve resumo com insights estatísticos e recomendações de segurança.
        
        Dados dos alertas:
        ${JSON.stringify(alerts.map(e => ({
          tipo: e.type,
          setor: e.triggeredBy?.sector || 'N/A',
          data: new Date(e.timestamp).toISOString(),
          status: e.active ? 'Ativo' : 'Resolvido'
        })))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      setAiInsight(response.text || "Nenhum insight gerado.");
    } catch (error) {
      console.error(error);
      setAiInsight("Ocorreu um erro ao gerar a análise da IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAlerts = async () => {
    if (window.confirm("Tem certeza que deseja apagar TODO o histórico de alertas? Esta ação não pode ser desfeita.")) {
      setIsResetting(true);
      await resetAlerts();
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 bg-[#0B0E14] min-h-screen text-slate-200">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Inteligência Sentinela
          </h1>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Monitoramento de emergências em tempo real e análise preditiva.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={generateAIInsights}
            disabled={isAnalyzing || alerts.length === 0}
            className="flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 font-bold text-sm"
          >
            <BrainCircuit className={cn("w-4 h-4", isAnalyzing && "animate-pulse")} />
            <span>{isAnalyzing ? 'Processando Dados...' : 'Gerar Insight IA'}</span>
          </button>
          
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-slate-700 transition-all font-bold text-sm shadow-md"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Relatório CSV
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex p-1.5 bg-slate-900/80 rounded-2xl mb-8 w-full md:w-fit border border-slate-800 shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === 'dashboard' 
              ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
              : "text-slate-500 hover:text-slate-300"
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab('dados')}
          className={cn(
            "flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === 'dados' 
              ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
              : "text-slate-500 hover:text-slate-300"
          )}
        >
          <TableIcon className="w-4 h-4" />
          Base de Dados
        </button>
      </div>

      {aiInsight && (
        <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
                  <BrainCircuit className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs">Inteligência Artificial Sentinela</h3>
              </div>
              <button 
                onClick={() => setAiInsight('')}
                className="text-slate-500 hover:text-white transition-colors p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="text-slate-300 text-sm leading-loose whitespace-pre-wrap font-medium">
              {aiInsight}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' ? (
        <div className="space-y-8">
          {/* Pro Key Metrics - BI Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: 'Total de Ocorrências', 
                value: alerts.length, 
                icon: Bell, 
                color: 'from-blue-600 to-indigo-700 shadow-blue-900/20',
                trend: '+12% este mês',
                sparkData: [10, 15, 8, 22, 18, 25, 30]
              },
              { 
                label: 'Alertas Ativos', 
                value: alerts.filter(a => a.active).length, 
                icon: ShieldAlert, 
                color: 'from-red-600 to-rose-700 shadow-red-900/20',
                trend: 'Atenção necessária',
                sparkData: [2, 5, 3, 8, 4, 6, 7]
              },
              { 
                label: 'Taxa de Resolução', 
                value: `${alerts.length ? Math.round((alerts.filter(a => !a.active).length / alerts.length) * 100) : 0}%`, 
                icon: CheckCircle2, 
                color: 'from-emerald-600 to-teal-700 shadow-emerald-900/20',
                trend: 'Acima da meta',
                sparkData: [80, 85, 82, 88, 90, 92, 95]
              },
              { 
                label: 'SLA Médio', 
                value: '4.2m', 
                icon: Zap, 
                color: 'from-amber-600 to-orange-700 shadow-amber-900/20',
                trend: '-0.8m vs ontem',
                sparkData: [5.1, 4.8, 4.9, 4.5, 4.3, 4.2, 4.2]
              }
            ].map((metric, i) => (
              <div key={i} className={cn(
                "bg-gradient-to-br p-px rounded-3xl shadow-xl transition-transform hover:scale-[1.02] duration-300",
                metric.color
              )}>
                <div className="bg-[#161B22] rounded-[23px] p-6 h-full flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute -bottom-2 -right-2 w-24 h-16 opacity-20 transition-opacity group-hover:opacity-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.sparkData.map(v => ({v}))}>
                        <Line type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={cn("p-3 rounded-2xl bg-opacity-20", metric.color)}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</span>
                  </div>
                  <div className="relative z-10">
                    <div className="text-4xl font-black text-white mb-2 tabular-nums tracking-tighter">
                      {metric.value}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Breakdown - Horizontal Bars Like the Image */}
            <div className="lg:col-span-4 bg-[#161B22] border border-slate-800 p-8 rounded-[32px] shadow-2xl">
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-500" />
                Distribuição por Setor
              </h3>
              <div className="space-y-6">
                {chartDataBySector.sort((a, b) => b.value - a.value).map((sector, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{sector.name}</span>
                      <span className="text-xs font-black text-white tabular-nums">{sector.value}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-px border border-slate-800">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          i === 0 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                          i === 1 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                          "bg-gradient-to-r from-slate-600 to-slate-400"
                        )}
                        style={{ width: `${(sector.value / Math.max(...chartDataBySector.map(s => s.value))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chart Area - Line/Area Chart */}
            <div className="lg:col-span-8 bg-[#161B22] border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BarChart3 className="w-32 h-32 text-blue-500" />
              </div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2 relative z-10">
                <Calendar className="w-4 h-4 text-purple-500" />
                Série Temporal de Ocorrências
              </h3>
              <div className="h-[350px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4A5568" 
                      fontSize={10} 
                      fontWeight="bold" 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#4A5568" 
                      fontSize={10} 
                      fontWeight="bold" 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0B0E14', 
                        border: '1px solid #2D3748', 
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#718096', fontSize: '10px', marginBottom: '8px', fontWeight: 'black', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Total Acionamentos" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorAlerts)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Circular Breakdown */}
            <div className="lg:col-span-12 bg-[#161B22] border border-slate-800 p-8 rounded-[32px] shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-rose-500" />
                  Natureza dos Chamados
                </h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Analise a recorrência por categoria de risco para direcionar treinamentos de segurança específicos.</p>
                <div className="grid grid-cols-2 gap-4">
                  {chartDataByType.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.name}</span>
                        <span className="text-sm font-bold text-white">{item.value} ({Math.round((item.value / alerts.length) * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartDataByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0B0E14', border: '1px solid #2D3748', borderRadius: '16px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Advanced Filters */}
          <div className="bg-[#161B22] border border-slate-800 p-6 rounded-[28px] flex flex-wrap gap-6 items-center shadow-2xl">
            <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 pr-6">
              <Filter className="w-5 h-5 text-blue-500" />
              Intelligence Filters
            </div>
            
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Tipo de Risco</span>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
              >
                <option value="all">TODOS OS RISCOS</option>
                <option value="emergency">EMERGÊNCIA</option>
                <option value="fire">INCÊNDIO</option>
                <option value="firstaid">PRIMEIROS SOCORROS</option>
                <option value="lockdown">LOCKDOWN</option>
                <option value="simulated">SIMULADO</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Status Operacional</span>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
              >
                <option value="all">TODOS OS STATUS</option>
                <option value="active">ACIONAMENTO ATIVO</option>
                <option value="resolved">OCORRÊNCIA RESOLVIDA</option>
              </select>
            </div>

            <div className="flex-none">
              <button 
                onClick={handleResetAlerts}
                className="flex items-center gap-2 bg-red-950/30 hover:bg-red-900/50 text-red-500 px-5 py-2.5 rounded-xl border border-red-900/30 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4" />
                Wipe Intelligence DB
              </button>
            </div>
          </div>

          {/* High-Contrast Professional Data Table */}
          <div className="bg-[#161B22] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-5 border-b border-slate-800/50">Classification</th>
                    <th className="px-8 py-5 border-b border-slate-800/50">Sentinel / Responder</th>
                    <th className="px-8 py-5 border-b border-slate-800/50">Deployment Area</th>
                    <th className="px-8 py-5 border-b border-slate-800/50">Timestamp (Local)</th>
                    <th className="px-8 py-5 border-b border-slate-800/50">Operational Status</th>
                    <th className="px-8 py-5 border-b border-slate-800/50 text-right">Command</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-slate-800/30">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-slate-600 italic font-bold">
                        SISTEMA LIMPO: Nenhuma interrupção detectada nos parâmetros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-blue-600/5 transition-all group border-l-4 border-transparent hover:border-blue-600">
                        <td className="px-8 py-5">
                          <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl w-fit font-black text-[10px] uppercase shadow-sm border border-white/5",
                            getAlertBgColor(alert.type)
                          )}>
                            {getAlertIcon(alert.type)}
                            {getAlertLabel(alert.type)}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img src={alert.triggeredBy?.photo} alt="" className="w-10 h-10 rounded-full border-2 border-slate-800 shadow-lg object-cover" />
                              <div className={cn(
                                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#161B22]",
                                alert.active ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                              )} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-black tracking-tight">{alert.triggeredBy?.name || 'DESCONHECIDO'}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">{alert.triggeredBy?.phone || 'NO SECURE LINK'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-slate-400 font-black text-xs uppercase tracking-tight">
                          {alert.triggeredBy?.sector || 'UNASSIGNED'}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-white font-mono text-xs font-bold">{new Date(alert.timestamp).toLocaleDateString()}</span>
                            <span className="text-slate-500 font-mono text-[10px] uppercase">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            alert.active ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          )}>
                            {alert.active ? '!! CRÍTICO !!' : 'SECURE'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {alert.active ? (
                            <button 
                              onClick={() => resolveAlert(alert.id, 'Resolvido pelo painel admin')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 group-hover:scale-110"
                              title="Marcar como Resolvido"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          ) : (
                            <div className="flex flex-col items-end opacity-60">
                              <span className="text-[10px] font-black text-slate-500 uppercase">Resolvido:</span>
                              <span className="text-xs font-mono text-emerald-500 font-bold">
                                {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleTimeString() : '-'}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
