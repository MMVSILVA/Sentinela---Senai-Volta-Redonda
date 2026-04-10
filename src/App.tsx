import React from 'react';
import { useStore } from './store/useStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Admin } from './components/Admin';
import { Contacts } from './components/Contacts';
import { AlertsList } from './components/AlertsList';
import { Config } from './components/Config';
import { AlertOverlay } from './components/AlertOverlay';

export default function App() {
  const { currentUser, currentTab } = useStore();

  if (!currentUser) {
    return <Login />;
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
    </>
  );
}
