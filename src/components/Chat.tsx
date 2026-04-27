import React, { useState, useEffect, useRef } from 'react';
import { useStore, Message } from '../store/useStore';
import { Send, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  alertId: string;
}

export function Chat({ alertId }: ChatProps) {
  const { user, messages, sendMessage, subscribeToAlertMessages } = useStore();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const alertMessages = messages[alertId] || [];

  useEffect(() => {
    const unsubscribe = subscribeToAlertMessages(alertId);
    return () => unsubscribe();
  }, [alertId, subscribeToAlertMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [alertMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || isSending) return;

    if ('vibrate' in navigator) navigator.vibrate(50);
    setIsSending(true);
    
    try {
      await sendMessage(alertId, cleanText);
      setText('');
    } catch (err) {
      console.error("Message send error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[300px] bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden mt-4 shadow-inner">
      <div className="px-4 py-2 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chat de Grupo</span>
        <span className="text-[10px] text-slate-500">{alertMessages.length} mensagens</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {alertMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                <Send size={14} />
              </div>
              <p className="text-xs">Inicie a comunicação...</p>
            </div>
          ) : (
            alertMessages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!isOwn && (
                      <span className="text-[10px] font-bold text-red-400/80 uppercase">
                        {msg.senderName}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div 
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                      isOwn 
                        ? 'bg-red-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-3 bg-slate-800/30 border-t border-white/5">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-slate-950/50 text-white text-sm px-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!text.trim() || isSending}
            className={`p-2.5 rounded-full transition-all ${
              text.trim() && !isSending
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 active:scale-95'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send size={18} className={isSending ? 'animate-pulse' : ''} />
          </button>
        </div>
      </form>
    </div>
  );
}
