import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, getDocs, deleteDoc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

export type UserRole = 'user' | 'admin';
export type AlertType = 'emergency' | 'fire' | 'firstaid' | 'simulated' | 'lockdown';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  photo: string;
  role: UserRole;
  fcmToken?: string;
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
  user: User | null;
  alerts: Alert[];
  dismissedAlertIds: string[];
  contacts: Contact[];
  currentTab: 'home' | 'alerts' | 'contacts' | 'admin' | 'config';
  localUsers: (User & { password?: string })[];
  initialized: boolean;
  isLoading: boolean;
  
  init: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (user: Omit<User, 'id'>, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
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
  // CIPA
  { id: '1', name: 'Patrícia', role: 'Presidente', phone: '-', department: 'CIPA' },
  { id: '2', name: 'Aline', role: 'Vice Presidente', phone: '-', department: 'CIPA' },
  { id: '3', name: 'Eduardo', role: 'Secretário', phone: '-', department: 'CIPA' },
  { id: '4', name: 'Joel', role: 'Suplente', phone: '-', department: 'CIPA' },
  
  // Brigadistas
  { id: '5', name: 'Tatiane', role: 'Coordenadora ADM', phone: '-', department: 'Brigada de Incêndio' },
  { id: '6', name: 'Wesley', role: 'Líder EP', phone: '-', department: 'Brigada de Incêndio' },
  { id: '7', name: 'Acristei', role: 'Brigadista ADM', phone: '-', department: 'Brigada de Incêndio' },
  { id: '8', name: 'Charles', role: 'Brigadista EB', phone: '-', department: 'Brigada de Incêndio' },
  { id: '9', name: 'Karen', role: 'Brigadista EP', phone: '-', department: 'Brigada de Incêndio' },
  { id: '10', name: 'Márcia', role: 'Brigadista EP', phone: '-', department: 'Brigada de Incêndio' },
  { id: '11', name: 'Tatiana', role: 'Brigadista EB', phone: '-', department: 'Brigada de Incêndio' },
  { id: '12', name: 'Thais', role: 'Brigadista ADM', phone: '-', department: 'Brigada de Incêndio' },

  // Guardiões da Integridade e Risco
  { id: '13', name: 'Carolina Arieira', role: 'Guardiã de Integridade', phone: '-', department: 'Guardiões de Risco e Integridade' },
  { id: '14', name: 'Marilia Brito', role: 'Guardiã de Integridade', phone: '-', department: 'Guardiões de Risco e Integridade' },
  { id: '15', name: 'Paola Silva', role: 'Guardiã de Risco', phone: '-', department: 'Guardiões de Risco e Integridade' },
  { id: '16', name: 'Glenda Ribeiro', role: 'Guardiã de Risco', phone: '-', department: 'Guardiões de Risco e Integridade' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      alerts: [],
      dismissedAlertIds: [],
      contacts: MOCK_CONTACTS,
      currentTab: 'home',
      localUsers: [{
        id: 'admin-fallback',
        name: 'Administrador (Fallback)',
        email: 'admin@sentinela.com',
        phone: '123456789',
        sector: 'TI',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        role: 'admin',
        password: 'admin'
      }],
      initialized: false,
      isLoading: false,

      init: () => {
        if (get().initialized) return;

        if (isFirebaseConfigured && auth && db) {
          auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
              try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                  const userData = userDoc.data() as User;
                  set({ user: userData, initialized: true });
                } else {
                  // Se o usuário autenticou mas não tem perfil, limpa o auth
                  set({ user: null, initialized: true });
                }
              } catch (error) {
                console.error("Error fetching user profile:", error);
                set({ user: null, initialized: true });
              }
            } else {
              set({ user: null, initialized: true });
            }
          });

          // Subscribe to alerts
          onSnapshot(collection(db, 'alerts'), (snapshot) => {
            const alerts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Alert[];
            set({ alerts: alerts.sort((a, b) => b.timestamp - a.timestamp) });
          });
        } else {
          set({ initialized: true });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          if (isFirebaseConfigured && auth && db) {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              set({ user: userData, currentTab: userData.role === 'admin' ? 'admin' : 'home' });
            } else {
              throw new Error("Perfil de usuário não encontrado no banco de dados.");
            }
          } else {
            const foundUser = get().localUsers.find(u => u.email === email && u.password === password);
            if (foundUser) {
              const { password: _, ...userData } = foundUser;
              set({ user: userData, currentTab: userData.role === 'admin' ? 'admin' : 'home' });
            } else {
              throw new Error("Usuário ou senha inválidos.");
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData, password) => {
        set({ isLoading: true });
        try {
          if (isFirebaseConfigured && auth && db) {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            const newUser = { ...userData, id: userCredential.user.uid };
            await setDoc(doc(db, 'users', newUser.id), newUser);
            set({ user: newUser, currentTab: newUser.role === 'admin' ? 'admin' : 'home' });
          } else {
            const newUser = { ...userData, id: Math.random().toString(36).substr(2, 9) };
            set(state => ({
              localUsers: [...state.localUsers, { ...newUser, password }],
              user: newUser,
              currentTab: newUser.role === 'admin' ? 'admin' : 'home'
            }));
          }
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email) => {
        if (isFirebaseConfigured && auth) {
          await sendPasswordResetEmail(auth, email);
        } else {
          throw new Error("Firebase não configurado.");
        }
      },

      logout: async () => {
        if (isFirebaseConfigured && auth) {
          await signOut(auth);
        }
        set({ user: null, currentTab: 'home', dismissedAlertIds: [] });
      },

      setTab: (tab) => set({ currentTab: tab }),

      setAlerts: (alerts) => set({ alerts }),

      triggerAlert: async (type, location, specificLocation) => {
        const { user, alerts } = get();
        if (!user) return;

        const alertData = {
          type,
          triggeredBy: user,
          timestamp: Date.now(),
          active: true,
          location: location || null,
          specificLocation: specificLocation || null
        };

        if (isFirebaseConfigured && db) {
          try {
            await addDoc(collection(db, 'alerts'), alertData);
          } catch (error) {
            console.error("Erro ao salvar alerta:", error);
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
            console.error("Erro ao resolver alerta:", error);
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
            console.error("Erro ao deletar alertas:", error);
          }
        } else {
          set({ alerts: [], dismissedAlertIds: [] });
        }
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null
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
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          persistedState.contacts = MOCK_CONTACTS;
        }
        return persistedState as AppState;
      },
      partialize: (state) => ({ 
        user: state.user, 
        contacts: state.contacts,
        localUsers: state.localUsers
      }),
    }
  )
);
