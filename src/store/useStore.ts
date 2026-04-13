import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type AlertType = 'emergency' | 'fire';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  photo: string;
  role: UserRole;
};

export type Alert = {
  id: string;
  type: AlertType;
  triggeredBy: User;
  timestamp: number;
  active: boolean;
  location?: { lat: number; lng: number };
  specificLocation?: string;
  resolvedAt?: number;
  notes?: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  department: string;
};

interface AppState {
  currentUser: User | null;
  alerts: Alert[];
  dismissedAlertIds: string[];
  contacts: Contact[];
  currentTab: 'home' | 'alerts' | 'contacts' | 'admin' | 'config';
  
  login: (user: Omit<User, 'id'>) => void;
  logout: () => void;
  setTab: (tab: 'home' | 'alerts' | 'contacts' | 'admin' | 'config') => void;
  setAlerts: (alerts: Alert[]) => void;
  triggerAlert: (type: AlertType, location?: { lat: number; lng: number }, specificLocation?: string) => void;
  resolveAlert: (alertId: string, notes?: string) => void;
  dismissAlert: (alertId: string) => void;
  resetAlerts: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Carlos Silva', role: 'Presidente CIPA', phone: '(11) 98888-1111', department: 'Segurança do Trabalho' },
  { id: '2', name: 'Ana Paula', role: 'Brigadista Líder', phone: '(11) 98888-2222', department: 'Operações' },
  { id: '3', name: 'Posto Médico', role: 'Emergência Médica', phone: '192', department: 'Saúde' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      alerts: [],
      dismissedAlertIds: [],
      contacts: MOCK_CONTACTS,
      currentTab: 'home',

      login: (userData) => {
        const newUser: User = { 
          ...userData, 
          id: Math.random().toString(36).substr(2, 9) 
        };
        set({ 
          currentUser: newUser,
          currentTab: newUser.role === 'admin' ? 'admin' : 'home'
        });
      },

      logout: () => set({ currentUser: null, currentTab: 'home', dismissedAlertIds: [] }),

      setTab: (tab) => set({ currentTab: tab }),

      setAlerts: (alerts) => set({ alerts }),

      triggerAlert: async (type, location, specificLocation) => {
        const { currentUser, alerts } = get();
        if (!currentUser) return;

        const alertData = {
          type,
          triggeredBy: currentUser,
          timestamp: Date.now(),
          active: true,
          location: location || null,
          specificLocation: specificLocation || null
        };

        if (isFirebaseConfigured && db) {
          try {
            await addDoc(collection(db, 'alerts'), alertData);
          } catch (error) {
            console.error("Erro ao salvar alerta no Firebase:", error);
          }
        } else {
          const newAlert = { ...alertData, id: Math.random().toString(36).substr(2, 9) } as Alert;
          set({ alerts: [newAlert, ...alerts] });
        }
      },

      resolveAlert: async (alertId, notes) => {
        const { alerts } = get();
        
        if (isFirebaseConfigured && db) {
          try {
            const alertRef = doc(db, 'alerts', alertId);
            await updateDoc(alertRef, {
              active: false,
              resolvedAt: Date.now(),
              notes: notes || null
            });
          } catch (error) {
            console.error("Erro ao resolver alerta no Firebase:", error);
          }
        } else {
          set({
            alerts: alerts.map(a => a.id === alertId ? { ...a, active: false, resolvedAt: Date.now(), notes } : a)
          });
        }
      },

      dismissAlert: (alertId) => {
        set((state) => ({ dismissedAlertIds: [...state.dismissedAlertIds, alertId] }));
      },

      resetAlerts: async () => {
        if (isFirebaseConfigured && db) {
          try {
            const snapshot = await getDocs(collection(db, 'alerts'));
            const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'alerts', d.id)));
            await Promise.all(deletePromises);
          } catch (error) {
            console.error("Erro ao resetar alertas no Firebase:", error);
          }
        } else {
          set({ alerts: [], dismissedAlertIds: [] });
        }
      },

      updateProfile: (data) => {
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...data } : null
        }));
      },

      addContact: (contact) => {
        set((state) => ({
          contacts: [...state.contacts, { ...contact, id: Math.random().toString(36).substr(2, 9) }]
        }));
      },

      updateContact: (id, data) => {
        set((state) => ({
          contacts: state.contacts.map(c => c.id === id ? { ...c, ...data } : c)
        }));
      },

      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter(c => c.id !== id)
        }));
      }
    }),
    {
      name: 'sentinela-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser, 
        contacts: state.contacts 
      }), // Only persist user and contacts
    }
  )
);
