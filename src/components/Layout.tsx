import React from 'react';
import { useStore } from '../store/useStore';
import { Home as HomeIcon, Bell, Settings, ShieldAlert, Users, MessageSquare, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { NotificationManager } from './NotificationManager';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentTab, setTab, user } = useStore();

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
    <div className="h-screen bg-slate-900 flex flex-col font-sans overflow-hidden">
      <NotificationManager />
      <main className={cn("flex-1 relative", !isChat && "overflow-y-auto pb-20")}>
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 px-3 py-2 z-50 backdrop-blur-lg bg-opacity-95 shadow-2xl">
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
