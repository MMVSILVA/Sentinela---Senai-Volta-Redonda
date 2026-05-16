import React from 'react';
import { useStore } from '../store/useStore';
import { Home as HomeIcon, Bell, Settings, ShieldAlert, Users, MessageSquare, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { NotificationManager } from './NotificationManager';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentTab, setTab, user, firebaseConnected } = useStore();

  const tabs = [
    { id: 'home', label: 'Início', icon: HomeIcon },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
    { id: 'community', label: 'Chat', icon: MessageSquare },
    { id: 'contacts', label: 'Contatos', icon: Users },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert }] : []),
    { id: 'config', label: 'Config', icon: Settings },
  ] as const;

  const isChat = currentTab === 'community';

  return (
    <div className="h-screen h-[100dvh] bg-slate-900 flex flex-col font-sans overflow-hidden">
      {!firebaseConnected && (
        <div className="bg-red-600 text-white text-[10px] py-1 px-4 text-center font-bold animate-pulse z-[100]">
          SEM CONEXÃO COM O SERVIDOR - MODO OFFLINE ATIVADO
        </div>
      )}
      <NotificationManager />
      <main className={cn(
        "flex-1 relative min-h-0", 
        !isChat && "overflow-y-auto"
      )}>
        {children}
      </main>

      <nav className="bg-[#0f172a] border-t border-slate-800 px-3 py-2 z-50 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <ul className="flex items-center justify-between max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <li key={tab.id} className="flex-1">
                <button
                  onClick={() => setTab(tab.id as any)}
                  className="flex flex-col items-center gap-1 w-full p-1"
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-red-500" : "text-slate-400"
                    )} 
                  />
                  <span 
                    className={cn(
                      "text-xs transition-colors",
                      isActive ? "text-red-500 font-medium" : "text-slate-400"
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
