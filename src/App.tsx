import React, { useEffect } from 'react';
import { useStore, Alert } from './store/useStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Admin } from './components/Admin';
import { Contacts } from './components/Contacts';
import { AlertsList } from './components/AlertsList';
import { Config } from './components/Config';
import { AlertOverlay } from './components/AlertOverlay';
import { InstallPWA } from './components/InstallPWA';
import { db, isFirebaseConfigured } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function App() {
  const { currentUser, currentTab, setAlerts } = useStore();

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      setAlerts(alertsData);
    });

    return () => unsubscribe();
  }, [setAlerts]);

  if (!currentUser) {
    return (
      <>
        <Login />
        <InstallPWA />
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
    </>
  );
}
