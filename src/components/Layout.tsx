import React from 'react';
import { useStore } from '../store/useStore';
import { Home as HomeIcon, Bell, Settings, ShieldAlert, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentTab, setTab, currentUser } = useStore();

  const tabs = [
    { id: 'home', label: 'Início', icon: HomeIcon },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'contacts', label: 'Contatos', icon: Users },
    ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert }] : []),
    { id: 'config', label: 'Config', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 px-6 py-3">
        <ul className="flex items-center justify-between max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setTab(tab.id as any)}
                  className="flex flex-col items-center gap-1 p-2"
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
