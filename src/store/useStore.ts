import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  deleteDoc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
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

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
};

interface AppState {
  user: User | null;
  alerts: Alert[];
  messages: Record<string, Message[]>;
  communityMessages: Message[];
  dismissedAlertIds: string[];
  contacts: Contact[];
  currentTab: 'home' | 'alerts' | 'contacts' | 'admin' | 'config' | 'community';
  localUsers: (User & { password?: string })[];
  initialized: boolean;
  isLoading: boolean;
  
  init: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (user: Omit<User, 'id'>, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setTab: (tab: 'home' | 'alerts' | 'contacts' | 'admin' | 'config' | 'community') => void;
  setAlerts: (alerts: Alert[]) => void;
  triggerAlert: (type: AlertType, location?: { lat: number; lng: number }, specificLocation?: string) => Promise<void>;
  resolveAlert: (alertId: string, notes?: string) => Promise<void>;
  dismissAlert: (alertId: string) => void;
  sendMessage: (alertId: string, text: string) => Promise<void>;
  sendCommunityMessage: (text?: string, imageFile?: File) => Promise<void>;
  subscribeToAlertMessages: (alertId: string) => () => void;
  subscribeToCommunityMessages: () => () => void;
  resetAlerts: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateFCMToken: () => Promise<void>;
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
      messages: {},
      communityMessages: [],
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
          let unsubscribeAlerts: (() => void) | null = null;

          auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
              const path = `users/${firebaseUser.uid}`;
              try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                  const userData = userDoc.data() as User;
                  // Ensure ID is present and matches the auth UID
                  const sanitizedUser = { ...userData, id: firebaseUser.uid };
                  set({ user: sanitizedUser, initialized: true });

                  // Subscribe to alerts ONLY when user is authenticated
                  if (!unsubscribeAlerts) {
                    // Use metadata.fromCache to prioritize speed if needed, 
                    // but here we just ensure the listener is active
                    unsubscribeAlerts = onSnapshot(collection(db, 'alerts'), (snapshot) => {
                      const alerts = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                      })) as Alert[];
                      // Immediate state update
                      set({ alerts: alerts.sort((a, b) => b.timestamp - a.timestamp) });
                    }, (error) => {
                      console.error("Alerts sync error:", error);
                      if (error.code !== 'permission-denied') {
                        handleFirestoreError(error, OperationType.GET, 'alerts');
                      }
                    });
                  }
                } else {
                  set({ user: null, initialized: true });
                  if (unsubscribeAlerts) {
                    unsubscribeAlerts();
                    unsubscribeAlerts = null;
                  }
                }
              } catch (error) {
                console.error("Error fetching user doc:", error);
                handleFirestoreError(error, OperationType.GET, path);
              }
            } else {
              set({ user: null, initialized: true, alerts: [] });
              if (unsubscribeAlerts) {
                unsubscribeAlerts();
                unsubscribeAlerts = null;
              }
            }
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
            const path = `users/${userCredential.user.uid}`;
            try {
              const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                const sanitizedUser = { ...userData, id: userCredential.user.uid };
                set({ user: sanitizedUser, currentTab: sanitizedUser.role === 'admin' ? 'admin' : 'home' });
              } else {
                throw new Error("Perfil de usuário não encontrado no banco de dados.");
              }
            } catch (error) {
              handleFirestoreError(error, OperationType.GET, path);
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
            const path = `users/${newUser.id}`;
            try {
              await setDoc(doc(db, 'users', newUser.id), newUser);
              set({ user: newUser, currentTab: newUser.role === 'admin' ? 'admin' : 'home' });
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, path);
            }
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
          try {
            await sendPasswordResetEmail(auth, email);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'resetPassword');
          }
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

        // Limpar dados sensíveis/pesados para o snapshot
        const triggererSnapshot = {
          id: user.id,
          name: user.name,
          sector: user.sector,
          phone: user.phone,
          // Limitamos o tamanho da foto no snapshot se for muito grande
          photo: user.photo?.length > 50000 ? user.photo.substring(0, 500) + '...' : user.photo
        };

        const alertData = {
          type,
          triggeredBy: triggererSnapshot,
          timestamp: Date.now(),
          active: true,
          location: location || null,
          specificLocation: specificLocation || null
        };

        if (isFirebaseConfigured && db) {
          try {
            await addDoc(collection(db, 'alerts'), alertData);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'alerts');
          }
        } else {
          const newAlert = { ...alertData, id: Math.random().toString(36).substr(2, 9) } as Alert;
          set({ alerts: [newAlert, ...alerts] });
        }
      },

      resolveAlert: async (alertId, notes) => {
        const { alerts } = get();
        
        if (isFirebaseConfigured && db) {
          const path = `alerts/${alertId}`;
          try {
            const alertRef = doc(db, 'alerts', alertId);
            await updateDoc(alertRef, {
              active: false,
              resolvedAt: Date.now(),
              notes: notes || null
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
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

      sendMessage: async (alertId: string, text: string) => {
        const { user } = get();
        if (!user || !isFirebaseConfigured || !db) return;

        const messagePath = `alerts/${alertId}/messages`;
        try {
          await addDoc(collection(db, 'alerts', alertId, 'messages'), {
            senderId: user.id,
            senderName: user.name,
            text,
            timestamp: Date.now()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, messagePath);
        }
      },

      subscribeToAlertMessages: (alertId: string) => {
        if (!isFirebaseConfigured || !db) return () => {};

        const messagesPath = `alerts/${alertId}/messages`;
        const q = collection(db, 'alerts', alertId, 'messages');
        
        return onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          
          set(state => ({
            messages: {
              ...state.messages,
              [alertId]: newMessages.sort((a, b) => a.timestamp - b.timestamp)
            }
          }));
        }, (error) => {
          if (error.code !== 'permission-denied') {
            handleFirestoreError(error, OperationType.GET, messagesPath);
          }
        });
      },

      subscribeToCommunityMessages: () => {
        if (!isFirebaseConfigured || !db) return () => {};

        // Query optimized: limit to latest 50 messages
        const q = query(
          collection(db, 'community_messages'), 
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        
        return onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Fallback for timestamp if using serverTimestamp which might be null initially
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now())
            };
          }) as Message[];
          
          set({
            communityMessages: newMessages.sort((a, b) => a.timestamp - b.timestamp)
          });
        }, (error) => {
          if (error.code !== 'permission-denied') {
            handleFirestoreError(error, OperationType.GET, 'community_messages');
          }
        });
      },

      sendCommunityMessage: async (text?: string, imageFile?: File) => {
        const { user } = get();
        if (!user || !isFirebaseConfigured || !db) {
          throw new Error("Usuário não autenticado ou Firebase não configurado");
        }

        try {
          let imageUrl = '';
          if (imageFile) {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const { storage } = await import('../lib/firebase');
            const fileRef = ref(storage, `community/${Date.now()}_${imageFile.name}`);
            const uploadResult = await uploadBytes(fileRef, imageFile);
            imageUrl = await getDownloadURL(uploadResult.ref);
          }

          if (!text && !imageUrl) return;

          await addDoc(collection(db, 'community_messages'), {
            senderId: user.id,
            senderName: user.name,
            senderPhoto: user.photo || '',
            text: text || '',
            imageUrl,
            timestamp: serverTimestamp()
          });
        } catch (error) {
          console.error("Failed to send community message:", error);
          handleFirestoreError(error, OperationType.WRITE, 'community_messages');
          throw error;
        }
      },

      resetAlerts: async () => {
        if (isFirebaseConfigured && db) {
          try {
            const snapshot = await getDocs(collection(db, 'alerts'));
            const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'alerts', d.id)));
            await Promise.all(deletePromises);
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, 'alerts');
          }
        } else {
          set({ alerts: [], dismissedAlertIds: [] });
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;

        const previousUser = { ...user };
        const updatedUser = { ...user, ...data };
        
        // Update local state immediately for responsiveness
        set({ user: updatedUser });

        if (isFirebaseConfigured && db) {
          const path = `users/${user.id}`;
          try {
            await updateDoc(doc(db, 'users', user.id), data);
          } catch (error) {
            // Rollback local state on error
            set({ user: previousUser });
            console.error("Error updating profile in Firestore:", error);
            handleFirestoreError(error, OperationType.UPDATE, path);
          }
        }
      },

      updateFCMToken: async () => {
        const { user } = get();
        if (!user || !isFirebaseConfigured || !db) return;

        try {
          const { messaging } = await import('../lib/firebase');
          if (!messaging) return;

          const { getToken } = await import('firebase/messaging');
          
          // Get the registered service worker
          const registration = await navigator.serviceWorker.getRegistration('/sw.js');
          
          const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            vapidKey: 'BMc7jO2vK-Xz7Jv2F9vM0j9X8y4vX_yv_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v' 
          });

          if (token) {
            await updateDoc(doc(db, 'users', user.id), { fcmToken: token });
            set(state => ({ user: state.user ? { ...state.user, fcmToken: token } : null }));
          }
        } catch (error) {
          console.error("Failed to get FCM token:", error);
        }
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
