import React, { useState, useEffect } from 'react';
import { useStore, CalendarEvent } from '../store/useStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Trash2, 
  Edit,
  X,
  Zap,
  Bell,
  Activity,
  ShieldAlert,
  RefreshCcw,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function CalendarView() {
  const { events, user, addEvent, updateEvent, deleteEvent, setGoogleTokens, syncGoogleEvents } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'drill' as any,
    location: ''
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        const { tokens } = event.data;
        setGoogleTokens(tokens);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleLinkGoogle = async () => {
    try {
      const response = await fetch(`/api/auth/google/url?uid=${user?.id}`);
      const { url } = await response.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (error) {
      console.error("Failed to get auth URL:", error);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await syncGoogleEvents();
    setIsSyncing(false);
  };

  const isAdmin = true; // Agora todos os usuários podem gerenciar eventos conforme solicitado

  // Calendar logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = [];
  const totalDays = daysInMonth(year, currentDate.getMonth());
  const firstDay = firstDayOfMonth(year, currentDate.getMonth());

  // Padding for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of current month
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, currentDate.getMonth(), i));
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    if (!selectedDate) return;
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: selectedDate.toISOString().split('T')[0],
      type: 'drill',
      location: ''
    });
    setShowModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      type: event.type,
      location: event.location || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
    } else {
      await addEvent(formData);
    }
    setShowModal(false);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'drill': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'training': return <Bell className="w-4 h-4 text-indigo-400" />;
      case 'inspection': return <Activity className="w-4 h-4 text-emerald-500" />;
      default: return <CalendarIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case 'drill': return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      case 'training': return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
      case 'inspection': return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
      default: return "bg-slate-500/10 border-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="min-h-full bg-[#0B0E14] text-slate-200 p-6 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-600/30">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Calendário</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Segurança & Treinamentos</p>
          </div>
        </div>

        <div className="flex gap-2">
          {user?.googleTokens ? (
            <button 
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-600/30 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              <RefreshCcw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          ) : (
            <button 
              onClick={handleLinkGoogle}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-slate-700 transition-all text-xs font-black uppercase tracking-widest"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Vincular Google
            </button>
          )}
        </div>
      </header>

      {/* Calendar Grid Section */}
      <div className="bg-[#161B22] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-black text-white capitalize">{monthName} <span className="text-slate-500">{year}</span></h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
              
              const dateEvents = getEventsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border group",
                    isSelected ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40" : 
                    isToday ? "bg-slate-800/50 border-blue-500/40 text-blue-400" :
                    "bg-slate-800/20 border-slate-800/40 hover:border-slate-700 text-slate-400"
                  )}
                >
                  <span className={cn("text-sm font-bold", isSelected ? "text-white" : "group-hover:text-white")}>{date.getDate()}</span>
                  {dateEvents.length > 0 && !isSelected && (
                    <div className="absolute bottom-2 flex gap-0.5">
                      {dateEvents.slice(0, 3).map((e, idx) => (
                        <div key={e.id} className={cn("w-1 h-1 rounded-full", 
                          e.type === 'drill' ? "bg-amber-500" :
                          e.type === 'training' ? "bg-indigo-400" :
                          "bg-emerald-500"
                        )} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Events */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-3 h-3 text-blue-400" />
            {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Selecione uma data'}
          </h3>
          {isAdmin && selectedDate && (
            <button 
              onClick={handleAddEvent}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(event => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 flex gap-4"
              >
                <div className={cn("p-3 rounded-xl border flex items-center justify-center shrink-0 h-fit", getEventTypeStyles(event.type))}>
                  {getEventTypeIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white font-bold text-sm truncate">{event.title}</h4>
                    {isAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleEditEvent(event)} className="text-slate-500 hover:text-white p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteEvent(event.id)} className="text-rose-500/50 hover:text-rose-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{event.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {event.location || 'Local a definir'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 bg-slate-900/20 rounded-2xl border border-slate-800/50 border-dashed flex flex-col items-center justify-center text-center p-6">
              <div className="bg-slate-800/40 p-4 rounded-full mb-4">
                <ShieldAlert className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Nenhum evento para esta data</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-[#161B22] border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-8 shadow-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    {selectedDate?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-slate-800 text-slate-400 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Título</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Treinamento de RCP"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                    >
                      <option value="drill">Simulado</option>
                      <option value="training">Treinamento</option>
                      <option value="inspection">Inspeção</option>
                      <option value="event">Evento</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Local</label>
                    <input 
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ex: Sala 4"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Descrição</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Objetivo e instruções..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 h-28 resize-none text-sm"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-900/40 transition-all text-sm mt-4"
                >
                  {editingEvent ? 'Salvar Alterações' : 'Agendar Evento'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
