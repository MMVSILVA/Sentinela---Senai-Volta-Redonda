import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Upload, Camera } from 'lucide-react';

export function Login() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sector: '',
    role: 'user' as 'user' | 'admin'
  });
  const [photo, setPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const login = useStore(state => state.login);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      login({
        ...formData,
        photo: photo || 'https://picsum.photos/seed/user/200/200' // Fallback photo
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">Sentinela</h1>
          <p className="text-slate-400 text-center mt-2">Identifique-se para acessar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div 
              className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              aria-label="Anexar foto de perfil"
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
                  <span className="text-xs text-slate-400">Anexar Foto</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-bold text-white mb-2">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-slate-500"
              placeholder="Seu nome completo"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-slate-500"
              placeholder="seu@email.com"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-bold text-white mb-2">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-slate-500"
              placeholder="(11) 99999-9999"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="sector" className="block text-sm font-bold text-white mb-2">
              Setor
            </label>
            <input
              id="sector"
              type="text"
              value={formData.sector}
              onChange={(e) => setFormData({...formData, sector: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-slate-500"
              placeholder="Ex: TI, RH, Operações"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="adminToggle" 
              checked={formData.role === 'admin'}
              onChange={(e) => setFormData({...formData, role: e.target.checked ? 'admin' : 'user'})}
              className="w-4 h-4 rounded border-slate-700 text-red-600 focus:ring-red-500 bg-slate-800"
            />
            <label htmlFor="adminToggle" className="text-sm text-slate-400">
              Entrar como Administrador
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#dc2626] hover:bg-red-700 text-white font-bold rounded-lg px-4 py-3 mt-4 transition-colors duration-200"
          >
            Entrar no Sentinela
          </button>
        </form>
      </div>
    </div>
  );
}

