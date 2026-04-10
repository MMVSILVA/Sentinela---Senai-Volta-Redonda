import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Users, Plus, LogIn, LogOut } from 'lucide-react';

export function GroupSelect() {
  const { currentUser, groups, createGroup, joinGroup, selectGroup, logout } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      createGroup(inputValue.trim());
      setInputValue('');
      setIsCreating(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      joinGroup(inputValue.trim());
      setInputValue('');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 flex flex-col">
      <header className="flex items-center justify-between py-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Olá, {currentUser?.name}</h1>
          <p className="text-sm text-zinc-400">Selecione um grupo de emergência</p>
        </div>
        <button 
          onClick={logout}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="grid gap-4 mb-8">
        {groups.map(group => (
          <button
            key={group.id}
            onClick={() => selectGroup(group.id)}
            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-500/50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                <Users className="w-6 h-6 text-zinc-400 group-hover:text-red-500 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{group.name}</h3>
                <p className="text-sm text-zinc-500">ID: {group.id}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-4">
        {isCreating ? (
          <form onSubmit={handleCreate} className="col-span-2 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nome do grupo"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <button type="submit" className="bg-red-600 text-white px-6 rounded-xl font-medium">Criar</button>
            <button type="button" onClick={() => setIsCreating(false)} className="bg-zinc-800 text-white px-4 rounded-xl">X</button>
          </form>
        ) : isJoining ? (
          <form onSubmit={handleJoin} className="col-span-2 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ID do grupo"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <button type="submit" className="bg-red-600 text-white px-6 rounded-xl font-medium">Entrar</button>
            <button type="button" onClick={() => setIsJoining(false)} className="bg-zinc-800 text-white px-4 rounded-xl">X</button>
          </form>
        ) : (
          <>
            <button
              onClick={() => setIsCreating(true)}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors text-zinc-300"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">Criar Grupo</span>
            </button>
            <button
              onClick={() => setIsJoining(true)}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors text-zinc-300"
            >
              <LogIn className="w-6 h-6" />
              <span className="text-sm font-medium">Entrar em Grupo</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
