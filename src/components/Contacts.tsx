import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Phone, Shield, Stethoscope, Plus, Edit2, Trash2, X } from 'lucide-react';

export function Contacts() {
  const { contacts, user, addContact, updateContact, deleteContact } = useStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', department: '' });

  const isAdmin = user?.role === 'admin';

  const getIcon = (role: string) => {
    if (role.toLowerCase().includes('médica') || role.toLowerCase().includes('saúde')) return <Stethoscope className="w-5 h-5" />;
    if (role.toLowerCase().includes('brigadista')) return <Shield className="w-5 h-5" />;
    return <Phone className="w-5 h-5" />;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateContact(isEditing, formData);
      setIsEditing(null);
    } else {
      addContact(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', role: '', phone: '', department: '' });
  };

  const startEdit = (contact: any) => {
    setFormData(contact);
    setIsEditing(contact.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsEditing(null);
    setIsAdding(false);
    setFormData({ name: '', role: '', phone: '', department: '' });
  };

  return (
    <div className="p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Contatos</h1>
          <p className="text-slate-400">Equipe de emergência e ramais.</p>
        </div>
        {isAdmin && !isAdding && !isEditing && (
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </header>

      {(isAdding || isEditing) && (
        <form onSubmit={handleSave} className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-semibold">{isEditing ? 'Editar Contato' : 'Novo Contato'}</h3>
            <button type="button" onClick={cancelForm} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <input type="text" placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
          <input type="text" placeholder="Cargo/Função" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
          <input type="text" placeholder="Telefone/Ramal" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
          <input type="text" placeholder="Departamento" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Salvar</button>
        </form>
      )}

      <div className="space-y-4">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  {getIcon(contact.role)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{contact.name}</h3>
                  <p className="text-sm text-slate-400">{contact.role}</p>
                  <p className="text-xs text-slate-500 mt-1">{contact.department}</p>
                </div>
              </div>
              <a 
                href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-colors shrink-0"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
            
            {isAdmin && (
              <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                <button onClick={() => startEdit(contact)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700">
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                <button onClick={() => deleteContact(contact.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
