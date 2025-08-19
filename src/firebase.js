// src/firebase.js (ou src/config/firebase.js selon votre structure)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''
};

// Validation de la configuration
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Configuration Firebase incomplète');
    console.warn('Champs manquants:', missingFields.join(', '));
    
    // Mode développement : afficher les instructions
    if (process.env.NODE_ENV === 'development') {
      console.info('📋 Configuration requise dans .env:');
      console.info('REACT_APP_FIREBASE_API_KEY=...');
      console.info('REACT_APP_FIREBASE_AUTH_DOMAIN=...');
      console.info('REACT_APP_FIREBASE_PROJECT_ID=...');
      console.info('REACT_APP_FIREBASE_APP_ID=...');
    }
    
    return false;
  }
  
  // Vérifier que ce ne sont pas les valeurs par défaut
  if (firebaseConfig.apiKey.includes('your-api-key') || 
      firebaseConfig.authDomain.includes('your-auth-domain')) {
    console.warn('⚠️ Configuration Firebase utilise des valeurs par défaut');
    return false;
  }
  
  return true;
};

// Variables pour stocker les services Firebase
let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

// Fonction d'initialisation avec gestion d'erreurs
const initializeFirebase = () => {
  try {
    // Si déjà initialisé, retourner les services existants
    if (app) {
      return { app, auth, db, storage, analytics };
    }

    // Vérifier la configuration
    const isValid = validateConfig();
    
    if (!isValid) {
      console.warn('🔧 Mode démo activé - Firebase non configuré correctement');
      
      // Créer des services mock pour le développement
      const mockAuth = {
        currentUser: null,
        onAuthStateChanged: (callback) => {
          callback(null);
          return () => {};
        },
        signInWithEmailAndPassword: () => Promise.reject(new Error('Mode démo - connexion désactivée')),
        createUserWithEmailAndPassword: () => Promise.reject(new Error('Mode démo - inscription désactivée')),
        signOut: () => Promise.resolve(),
        sendPasswordResetEmail: () => Promise.reject(new Error('Mode démo - réinitialisation désactivée'))
      };
      
      const mockDb = {
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve({ exists: () => false, data: () => null }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve(),
            delete: () => Promise.resolve()
          })
        })
      };
      
      const mockStorage = {
        ref: () => ({
          child: () => ({
            put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('#') } }),
            getDownloadURL: () => Promise.resolve('#'),
            delete: () => Promise.resolve()
          })
        })
      };
      
      auth = mockAuth;
      db = mockDb;
      storage = mockStorage;
      
      return { app: null, auth, db, storage, analytics: null };
    }

    // Initialiser Firebase avec la vraie configuration
    app = initializeApp(firebaseConfig);
    
    // Initialiser les services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Analytics avec vérification de support
    if (firebaseConfig.measurementId) {
      isSupported()
        .then(supported => {
          if (supported) {
            analytics = getAnalytics(app);
            console.log('✅ Firebase Analytics activé');
          }
        })
        .catch(() => {
          console.warn('Analytics non supporté dans cet environnement');
        });
    }
    
    console.log('✅ Firebase initialisé avec succès');
    
    return { app, auth, db, storage, analytics };
    
  } catch (error) {
    console.error('❌ Erreur Firebase:', error.message);
    
    // Retourner des services vides en cas d'erreur critique
    return {
      app: null,
      auth: null,
      db: null,
      storage: null,
      analytics: null
    };
  }
};

// Initialiser Firebase
const firebaseServices = initializeFirebase();

// Extraire les services
auth = firebaseServices.auth;
db = firebaseServices.db;
storage = firebaseServices.storage;
analytics = firebaseServices.analytics;
app = firebaseServices.app;

// Helper pour vérifier si Firebase est configuré
export const isFirebaseConfigured = () => {
  return app !== null && auth !== null && db !== null;
};

// Helper pour obtenir l'état de Firebase
export const getFirebaseStatus = () => {
  if (!app) return 'non-configuré';
  if (!auth?.currentUser) return 'déconnecté';
  return 'connecté';
};

// Export des services
export { app, auth, db, storage, analytics };

// Export par défaut
export default app;