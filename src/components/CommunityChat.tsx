import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { 
  Send, 
  CheckCheck, 
  Users, 
  Smile, 
  Paperclip, 
  X, 
  Trash2, 
  Edit3, 
  Bold, 
  Italic, 
  List as ListIcon,
  MoreVertical,
  Check,
  FileText,
  Image as ImageIcon,
  Camera,
  Music,
  User as UserContact,
  BarChart2,
  Calendar,
  Sticker
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';

export function CommunityChat() {
  const { 
    communityMessages, 
    sendCommunityMessage, 
    deleteCommunityMessage,
    updateCommunityMessage,
    reactToCommunityMessage,
    subscribeToCommunityMessages, 
    user 
  } = useStore();
  
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageOptionsId, setMessageOptionsId] = useState<string | null>(null);
  const [reactionMsgId, setReactionMsgId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsub = subscribeToCommunityMessages();
    return () => unsub();
  }, [subscribeToCommunityMessages]);

  useEffect(() => {
    if (scrollRef.current && !editingMessageId) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: (communityMessages.length > 5) ? 'smooth' : 'auto'
      });
    }
  }, [communityMessages, editingMessageId]);

  // Close emoji picker, attachment menu and options when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
      if (reactionMenuRef.current && !reactionMenuRef.current.contains(event.target as Node)) {
        setReactionMsgId(null);
      }
      if (messageOptionsId) {
        setMessageOptionsId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [messageOptionsId]);

  const handleSendOrUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanText = text.trim();
    
    if (!cleanText && !selectedImage) return;
    if (isSending) return;
    
    if (!user) {
      setErrorId('Você precisa estar logado.');
      setTimeout(() => setErrorId(null), 3000);
      return;
    }
    
    if ('vibrate' in navigator) navigator.vibrate(50);
    
    setIsSending(true);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    
    try {
      if (editingMessageId) {
        await updateCommunityMessage(editingMessageId, cleanText);
        setEditingMessageId(null);
        setText('');
      } else {
        await sendCommunityMessage(cleanText, selectedImage || undefined);
        setText('');
        setSelectedImage(null);
        setImagePreview(null);
      }
      setErrorId(null);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setErrorId('Erro ao processar. Tente novamente.');
      setTimeout(() => setErrorId(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    setText(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = start + prefix.length + selectedText.length + suffix.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
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
      setShowAttachmentMenu(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente apagar esta mensagem?')) {
      try {
        await deleteCommunityMessage(id);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const startEditing = (msg: any) => {
    setEditingMessageId(msg.id);
    setText(msg.text || '');
    setMessageOptionsId(null);
    textareaRef.current?.focus();
  };

  const formatTime = (ts: number) => {
    if (!ts) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };

  const attachmentOptions = [
    { id: 'doc', label: 'Documento', icon: FileText, color: 'bg-indigo-600' },
    { id: 'media', label: 'Fotos e vídeos', icon: ImageIcon, color: 'bg-blue-500', action: () => fileInputRef.current?.click() },
    { id: 'camera', label: 'Câmera', icon: Camera, color: 'bg-pink-600' },
    { id: 'audio', label: 'Áudio', icon: Music, color: 'bg-orange-500' },
    { id: 'contact', label: 'Contato', icon: UserContact, color: 'bg-blue-400' },
    { id: 'poll', label: 'Enquete', icon: BarChart2, color: 'bg-yellow-500' },
    { id: 'event', label: 'Evento', icon: Calendar, color: 'bg-rose-500' },
    { id: 'sticker', label: 'Nova figurinha', icon: Sticker, color: 'bg-teal-500' },
  ];

  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!user) return;
    setReactionMsgId(null);
    try {
      await reactToCommunityMessage(msgId, emoji);
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const getReactionCounts = (reactions?: Record<string, string>) => {
    if (!reactions) return [];
    const counts: Record<string, number> = {};
    Object.values(reactions).forEach(emoji => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] overflow-hidden relative">
      {/* Header */}
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

      {/* Mensagens */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] custom-scrollbar relative"
      >
        <div className="relative z-10 w-full flex flex-col space-y-3">
          <AnimatePresence initial={false}>
            {communityMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 mt-auto opacity-0" />
            ) : (
              communityMessages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isShownOptions = messageOptionsId === msg.id;
                const isShowingReactions = reactionMsgId === msg.id;
                const msgReactions = getReactionCounts(msg.reactions);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`group flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] sm:max-w-[70%] rounded-lg shadow-md relative transition-all group-hover:shadow-lg ${
                        isMe 
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                          : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                      } ${msg.imageUrl ? 'p-1' : 'px-3 py-1.5'} ${msgReactions.length > 0 ? 'mb-4' : ''}`}
                    >
                      {/* Menu de Reação (WhatsApp Style) */}
                      <AnimatePresence>
                        {isShowingReactions && (
                          <motion.div 
                            ref={reactionMenuRef}
                            initial={{ opacity: 0, scale: 0.8, x: isMe ? 20 : -20 }}
                            animate={{ opacity: 1, scale: 1, x: isMe ? -215 : 45, y: -10 }}
                            exit={{ opacity: 0, scale: 0.8, x: isMe ? 20 : -20 }}
                            className={`absolute z-30 bg-[#233138] rounded-full px-2 py-1 flex gap-1 shadow-2xl border border-white/10 top-0`}
                          >
                            {reactionEmojis.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className="hover:scale-125 transition-transform p-1 text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Botão de Reação e Opções */}
                      <div className={`absolute top-0 ${isMe ? 'left-[-40px]' : 'right-[-40px]'} opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center gap-0.5`}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setReactionMsgId(isShowingReactions ? null : msg.id);
                          }}
                          className="p-1 hover:bg-black/20 rounded-full text-[#8696a0]"
                          title="Reagir"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                        
                        {isMe && (
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setMessageOptionsId(isShownOptions ? null : msg.id);
                              }}
                              className="p-1 hover:bg-black/20 rounded-full text-[#8696a0]"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isShownOptions && (
                              <div className="absolute right-0 top-6 bg-[#233138] rounded shadow-xl py-1 z-20 min-w-[100px] border border-white/10">
                                <button 
                                  onClick={() => startEditing(msg)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#182229] flex items-center gap-2"
                                >
                                  <Edit3 className="w-3 h-3 text-blue-400" /> Editar
                                </button>
                                <button 
                                  onClick={() => handleDelete(msg.id)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#182229] flex items-center gap-2 text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" /> Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

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

                      <div className={`flex flex-col ${msg.imageUrl ? 'px-2 pb-1' : ''}`}>
                        {msg.text && (
                          <div className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words prose prose-invert prose-xs max-w-full">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 self-end mt-1">
                          {(msg as any).isEdited && (
                            <span className="text-[9px] text-[#8696a0] italic">editada</span>
                          )}
                          <span className="text-[9px] text-[#8696a0] font-medium">
                            {formatTime(msg.timestamp)}
                          </span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                        </div>
                      </div>

                      {/* Display de Reações */}
                      {msgReactions.length > 0 && (
                        <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-0.5 bg-[#202c33] border border-white/10 rounded-full px-1.5 py-0.5 shadow-sm`}>
                          {msgReactions.map(([emoji, count]) => (
                            <div key={emoji} className="flex items-center gap-0.5">
                              <span className="text-[10px]">{emoji}</span>
                              {count > 1 && <span className="text-[9px] text-[#8696a0] font-bold">{count}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toolbar de Formatação */}
      <AnimatePresence>
        {(text.length > 0 || editingMessageId) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-[#202c33] border-t border-white/5 flex gap-4 overflow-x-auto no-scrollbar"
          >
            <button 
              onClick={() => applyFormatting('**', '**')}
              className="text-[#8696a0] hover:text-white p-1 hover:bg-white/5 rounded transition-colors"
              title="Negrito"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              onClick={() => applyFormatting('_', '_')}
              className="text-[#8696a0] hover:text-white p-1 hover:bg-white/5 rounded transition-colors"
              title="Itálico"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => applyFormatting('- ', '')}
              className="text-[#8696a0] hover:text-white p-1 hover:bg-white/5 rounded transition-colors"
              title="Lista"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            
            {editingMessageId && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Editando</span>
                <button 
                  onClick={() => { setEditingMessageId(null); setText(''); }}
                  className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview de Imagem */}
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

      {/* Menu de Anexo */}
      <AnimatePresence>
        {showAttachmentMenu && (
          <motion.div 
            ref={attachmentMenuRef}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="absolute bottom-[85px] left-8 bg-[#233138] rounded-xl shadow-2xl z-50 p-4 border border-white/10 min-w-[200px]"
          >
            <div className="grid grid-cols-1 gap-1">
              {attachmentOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={opt.action}
                  className="flex items-center gap-4 px-3 py-2.5 hover:bg-[#182229] rounded-lg transition-colors group w-full text-left"
                >
                  <div className={`p-2 rounded-full ${opt.color} group-hover:scale-110 transition-transform`}>
                    <opt.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[#d1d7db] text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
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
            className="absolute bottom-[85px] left-4 z-30 shadow-2xl"
          >
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              theme={Theme.DARK}
              lazyLoadEmojis={true}
              width={300}
              height={350}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-3 bg-[#202c33] flex flex-col gap-2 z-20">
        {errorId && (
          <div className="text-[10px] text-red-500 font-black px-4 animate-pulse text-center uppercase tracking-tighter">
            {errorId}
          </div>
        )}
        <div className="flex items-end gap-2 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-1 bg-[#2a3942] rounded-2xl flex-1 px-2 py-1 shadow-inner border border-white/5">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-[#8696a0] hover:text-[#00a884] transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>
            
            <TextareaAutosize
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendOrUpdate();
                }
              }}
              placeholder="Mensagem"
              minRows={1}
              maxRows={6}
              className="flex-1 bg-transparent border-none px-2 py-3 text-sm text-[#d1d7db] placeholder-[#8696a0] focus:ring-0 transition-all resize-none custom-scrollbar"
            />

            {!editingMessageId && (
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={`p-2 transition-colors ${showAttachmentMenu ? 'text-[#00a884]' : 'text-[#8696a0] hover:text-[#00a884]'}`}
              >
                <Paperclip className="w-5 h-5 -rotate-45" />
              </button>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            onClick={() => handleSendOrUpdate()}
            disabled={(!text.trim() && !selectedImage) || isSending}
            className={`flex items-center justify-center rounded-full transition-all active:scale-90 min-w-[48px] min-h-[48px] shadow-xl ${
              (text.trim() || selectedImage) ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-[#2a3942] text-[#8696a0]'
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : editingMessageId ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <Send className={`w-5 h-5 ${(text.trim() || selectedImage) ? 'text-white translate-x-0.5' : 'text-[#8696a0]'}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


