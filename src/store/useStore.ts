import { create } from 'zustand';

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
  activeAlerts: Alert[];
  alertHistory: Alert[];
  dismissedAlertIds: string[];
  contacts: Contact[];
  currentTab: 'home' | 'alerts' | 'contacts' | 'admin' | 'config';
  
  login: (user: Omit<User, 'id'>) => void;
  logout: () => void;
  setTab: (tab: 'home' | 'alerts' | 'contacts' | 'admin' | 'config') => void;
  triggerAlert: (type: AlertType, location?: { lat: number; lng: number }, specificLocation?: string) => void;
  resolveAlert: (alertId: string, notes?: string) => void;
  dismissAlert: (alertId: string) => void;
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

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  activeAlerts: [],
  alertHistory: [],
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

  triggerAlert: (type, location, specificLocation) => {
    const { currentUser, activeAlerts } = get();
    if (!currentUser) return;

    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      triggeredBy: currentUser,
      timestamp: Date.now(),
      active: true,
      location,
      specificLocation
    };

    set({ activeAlerts: [...activeAlerts, newAlert] });
  },

  resolveAlert: (alertId, notes) => {
    const { activeAlerts, alertHistory } = get();
    const alertToResolve = activeAlerts.find(a => a.id === alertId);
    
    if (alertToResolve) {
      const resolvedAlert = { ...alertToResolve, active: false, resolvedAt: Date.now(), notes };
      set({
        activeAlerts: activeAlerts.filter(a => a.id !== alertId),
        alertHistory: [resolvedAlert, ...alertHistory]
      });
    }
  },

  dismissAlert: (alertId) => {
    set((state) => ({ dismissedAlertIds: [...state.dismissedAlertIds, alertId] }));
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
}));
