import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Vérification des variables d'environnement
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: Afficher les variables d'environnement (sans la clé API pour la sécurité)
console.log('🔧 Firebase Config Debug:', {
  ...requiredEnvVars,
  apiKey: requiredEnvVars.apiKey ? `${requiredEnvVars.apiKey.substring(0, 10)}...` : 'MISSING',
});

// Vérifier que toutes les variables sont présentes
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement Firebase manquantes:', missingVars);
  console.error('📋 Créez un fichier .env.local avec ces variables:');
  missingVars.forEach(varName => {
    console.error(`VITE_FIREBASE_${varName.toUpperCase()}=your_${varName}`);
  });
  throw new Error(`Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}`);
}

const firebaseConfig = requiredEnvVars;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 