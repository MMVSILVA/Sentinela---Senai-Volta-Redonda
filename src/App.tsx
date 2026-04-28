import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Admin } from './components/Admin';
import { Contacts } from './components/Contacts';
import { AlertsList } from './components/AlertsList';
import { Config } from './components/Config';
import { CommunityChat } from './components/CommunityChat';
import { CalendarView } from './components/CalendarView';
import { AlertOverlay } from './components/AlertOverlay';
import { InstallPWA } from './components/InstallPWA';
import { audioManager } from './lib/audio';

export default function App() {
  const { user, initialized, currentTab, init, updateFCMToken } = useStore();
  const [initStarted, setInitStarted] = useState(false);

  useEffect(() => {
    if (!initStarted) {
      init();
      audioManager.preload();
      setInitStarted(true);
    }
  }, [init, initStarted]);

  useEffect(() => {
    if (user && initialized) {
      // Request notifications permission and update FCM token
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            updateFCMToken();
          }
        });
      }
    }
  }, [user, initialized, updateFCMToken]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Login />
        <InstallPWA />
      </div>
    );
  }

  const renderTab = () => {
    switch (currentTab) {
      case 'home': return <Home />;
      case 'admin': return <Admin />;
      case 'contacts': return <Contacts />;
      case 'alerts': return <AlertsList />;
      case 'calendar': return <CalendarView />;
      case 'community': return <CommunityChat />;
      case 'config': return <Config />;
      default: return <Home />;
    }
  };

  return (
    <>
      <Layout>
        {renderTab()}
      </Layout>
      
      <AlertOverlay />
      <InstallPWA />
    </>
  );
}
