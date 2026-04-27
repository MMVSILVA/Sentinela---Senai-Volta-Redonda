import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Send, User as UserIcon, CheckCheck, Users, Smile, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

export function CommunityChat() {
  const { communityMessages, sendCommunityMessage, subscribeToCommunityMessages, user } = useStore();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToCommunityMessages();
    return () => unsub();
  }, [subscribeToCommunityMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: (communityMessages.length > 5) ? 'smooth' : 'auto'
      });
    }
  }, [communityMessages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    
    if (!cleanText && !selectedImage) return;
    if (isSending) return;
    
    if (!user) {
      setErrorId('Você precisa estar logado para enviar mensagens.');
      setTimeout(() => setErrorId(null), 3000);
      return;
    }
    
    if ('vibrate' in navigator) navigator.vibrate(50);
    
    setIsSending(true);
    setText('');
    setSelectedImage(null);
    setImagePreview(null);
    setErrorId(null);
    setShowEmojiPicker(false);
    
    try {
      await sendCommunityMessage(cleanText, selectedImage || undefined);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setText(cleanText);
      setErrorId('Erro ao enviar. Verifique sua conexão.');
      setTimeout(() => setErrorId(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setText(prev => prev + emojiData.emoji);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorId('Imagem muito grande (máx 5MB)');
        setTimeout(() => setErrorId(null), 3000);
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (ts: number) => {
    if (!ts) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] overflow-hidden relative">
      {/* Header Estilo WhatsApp */}
      <div className="p-4 bg-[#202c33] flex items-center gap-3 shadow-md z-20 border-b border-white/5">
        <div className="bg-blue-600 p-2.5 rounded-full shadow-lg">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-sm">Comunidade Sentinela</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[#8696a0] text-[10px] uppercase tracking-wider font-bold">Time Online</p>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] custom-scrollbar relative"
        style={{
          backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
          backgroundBlendMode: 'soft-light',
          backgroundColor: '#0b141a',
          backgroundSize: '400px'
        }}
      >
        {/* Overlay para suavizar e integrar com a paleta do app */}
        <div className="absolute inset-0 bg-[#0b141a]/90 pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col space-y-3">
          <AnimatePresence initial={false}>
            {communityMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 mt-auto">
                <div className="bg-[#182229] px-4 py-1.5 rounded-lg border border-white/5 shadow-sm">
                  <p className="text-[#8696a0] text-xs font-medium">As mensagens são criptografadas.</p>
                </div>
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
                    <div 
                      className={`max-w-[85%] sm:max-w-[70%] rounded-lg shadow-md relative transition-all ${
                        isMe 
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                          : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                      } ${msg.imageUrl ? 'p-1' : 'px-3 py-1.5'}`}
                    >
                      {!isMe && (
                        <span className="text-[11px] font-black text-blue-400 block mb-0.5 tracking-tight px-2 pt-1">
                          {msg.senderName}
                        </span>
                      )}

                      {msg.imageUrl && (
                        <div className="mb-1 rounded-md overflow-hidden bg-black/20">
                          <img 
                            src={msg.imageUrl} 
                            alt="Chat" 
                            className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.imageUrl, '_blank')}
                          />
                        </div>
                      )}

                      <div className={`flex items-end gap-2 ${msg.imageUrl ? 'px-2 pb-1' : ''}`}>
                        {msg.text && (
                          <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words flex-1">
                            {msg.text}
                          </p>
                        )}
                        <div className={`flex items-center gap-1.5 shrink-0 ${msg.text ? 'mb-[-4px]' : 'ml-auto'}`}>
                          <span className="text-[9px] text-[#8696a0] font-medium">
                            {formatTime(msg.timestamp)}
                          </span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview de Imagem Selecionada */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-[80px] left-4 right-4 bg-[#2a3942] rounded-xl p-3 shadow-2xl z-20 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8696a0] font-medium">Visualização da Imagem</span>
              <button 
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <img src={imagePreview} alt="Preview" className="w-full max-h-[200px] object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div 
            ref={emojiPickerRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-[80px] left-4 z-30 shadow-2xl"
          >
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              theme={Theme.DARK}
              lazyLoadEmojis={true}
              width={300}
              height={400}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de Mensagem Estilo WhatsApp */}
      <div className="p-3 bg-[#202c33] flex flex-col gap-2 z-20">
        {errorId && (
          <div className="text-[10px] text-red-500 font-black px-4 animate-pulse text-center uppercase tracking-tighter">
            {errorId}
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-1 bg-[#2a3942] rounded-full flex-1 px-2 py-1 shadow-inner border border-white/5">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-[#8696a0] hover:text-[#00a884] transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>
            
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Mensagem"
              className="flex-1 bg-transparent border-none px-2 py-2 text-sm text-[#d1d7db] placeholder-[#8696a0] focus:ring-0 transition-all"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#8696a0] hover:text-[#00a884] transition-colors"
            >
              <Paperclip className="w-5 h-5 -rotate-45" />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            type="submit"
            disabled={(!text.trim() && !selectedImage) || isSending}
            className={`flex items-center justify-center rounded-full transition-all active:scale-90 min-w-[48px] min-h-[48px] shadow-xl ${
              (text.trim() || selectedImage) ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-[#2a3942] text-[#8696a0]'
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className={`w-5 h-5 ${(text.trim() || selectedImage) ? 'text-white translate-x-0.5' : 'text-[#8696a0]'}`} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

