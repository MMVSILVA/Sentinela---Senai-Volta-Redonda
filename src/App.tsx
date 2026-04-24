import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Admin } from './components/Admin';
import { Contacts } from './components/Contacts';
import { AlertsList } from './components/AlertsList';
import { Config } from './components/Config';
import { AlertOverlay } from './components/AlertOverlay';
import { InstallPWA } from './components/InstallPWA';
import { UpdatePrompt } from './components/UpdatePrompt';

export default function App() {
  const { user, initialized, currentTab, init } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <InstallPWA />
        <UpdatePrompt />
      </>
    );
  }

  return (
    <>
      <Layout>
        {currentTab === 'home' && <Home />}
        {currentTab === 'admin' && <Admin />}
        {currentTab === 'contacts' && <Contacts />}
        {currentTab === 'alerts' && <AlertsList />}
        {currentTab === 'config' && <Config />}
      </Layout>
      
      <AlertOverlay />
      <InstallPWA />
      <UpdatePrompt />
    </>
  );
}
