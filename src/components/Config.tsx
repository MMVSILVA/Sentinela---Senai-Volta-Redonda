import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Camera, Upload, Save, LogOut } from 'lucide-react';
import { APP_VERSION } from '../lib/version';

export function Config() {
  const { user, updateProfile, logout } = useStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    sector: user?.sector || '',
  });
  const [photo, setPhoto] = useState<string>(user?.photo || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedPhoto = canvas.toDataURL('image/jpeg', 0.7);
          setPhoto(compressedPhoto);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ ...formData, photo });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar o perfil. Verifique se a foto não é muito grande.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-slate-400">Edite seu perfil e preferências.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-5 bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <div className="flex flex-col items-center justify-center mb-6">
          <div 
            className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors overflow-hidden relative group"
            onClick={() => fileInputRef.current?.click()}
          >
            {photo ? (
              <>
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-400">Alterar Foto</span>
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            readOnly
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-500 mt-1">O email não pode ser alterado diretamente.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Telefone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Setor</label>
          <input
            type="text"
            value={formData.sector}
            onChange={(e) => setFormData({...formData, sector: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Salvando...' : isSaved ? 'Salvo com sucesso!' : 'Salvar Perfil'}
        </button>
      </form>

      <div className="mt-8">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-lg px-4 py-4 transition-colors border border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Sair do Aplicativo
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-xs">Versão do App: {APP_VERSION}</p>
      </div>
    </div>
  );
}
