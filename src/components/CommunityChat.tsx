import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Send, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CommunityChat() {
  const { communityMessages, sendCommunityMessage, subscribeToCommunityMessages, user } = useStore();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToCommunityMessages();
    return () => unsub();
  }, [subscribeToCommunityMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [communityMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text;
    setText('');
    try {
      await sendCommunityMessage(msg);
    } catch (err) {
      console.error(err);
      setText(msg);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center gap-3">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-white font-bold">Comunidade Sentinela</h2>
          <p className="text-slate-500 text-xs text-balance">Espaço para troca de ideias e informações do time.</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {communityMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-xs">Inicie a conversa!</p>
            </div>
          ) : (
            communityMessages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="shrink-0 mt-1">
                      {msg.senderPhoto ? (
                        <img src={msg.senderPhoto} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {msg.senderName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-500 mb-1 px-1">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className={`px-4 py-2 rounded-2xl text-sm ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-100 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-3 rounded-full transition-all active:scale-95 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
