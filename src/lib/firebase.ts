import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// O USUÁRIO DEVE SUBSTITUIR ISSO PELAS CREDENCIAIS DO FIREBASE DELE
// Para obter essas chaves, crie um projeto no Firebase Console (https://console.firebase.google.com/)
// Adicione um aplicativo Web e copie o objeto firebaseConfig para cá.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "SUA_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "SEU_PROJETO.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "SEU_PROJETO",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "SEU_PROJETO.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "SEU_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "SEU_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Verifica se o usuário já configurou o Firebase
export const isFirebaseConfigured = firebaseConfig.apiKey !== "SUA_API_KEY" && firebaseConfig.apiKey !== "";

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const analytics = app && firebaseConfig.measurementId ? getAnalytics(app) : null;
