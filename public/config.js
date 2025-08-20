// Configuration globale de BestoolsVerse
// Ce fichier est chargé avant React et permet de configurer l'environnement

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCyNBflrtWxiQZucgMvdfhjK5G8QpnaDpI",
  authDomain: "bestoolsverse.firebaseapp.com",
  projectId: "bestoolsverse",
  storageBucket: "bestoolsverse.firebasestorage.app",
  messagingSenderId: "268630997122",
  appId: "1:268630997122:web:9902ed87a95605efe89c9b",
  measurementId: "G-GCFFSF9V7Y"
};

// Configuration Stripe
window.STRIPE_PUBLIC_KEY = "pk_test_51RmhP1LIESCcMjQsXjgd5ZQaO2htPVwOlRowXInBVTiF5J5pKy4CgImU69CHT8R71vxyAOzlabWFc1mFu7tY7UU3006hUfmm1Y";

// Configuration API
window.API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://bestoolsverse-api.onrender.com';

// Configuration ReCAPTCHA
window.RECAPTCHA_SITE_KEY = "6LfRQYkrAAAAAEWcI8uO-GYQYC4Tc0kMwzMBLMla";

// Configuration Google Analytics
window.GA_TRACKING_ID = "G-HYMZBD99RN";

// Plans de tarification (IDs Stripe)
window.STRIPE_PRICE_IDS = {
  PRO_MONTHLY: "price_1RmhkCPpjSYdGHJaDYMcsF0C",
  PRO_ANNUAL: "price_1RmhkCPpjSYdGHJaBMYJeee6",
  BUSINESS_MONTHLY: "price_1Rmhq6PpjSYdGHJanxuP40Tv",
  BUSINESS_ANNUAL: "price_1Rmhq6PpjSYdGHJahUpJDkLv"
};

// Configuration de l'environnement
window.ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
window.DEBUG = window.ENV === 'development';

// URLs de redirection après paiement
window.STRIPE_SUCCESS_URL = window.location.origin + '/dashboard?payment=success';
window.STRIPE_CANCEL_URL = window.location.origin + '/pricing?payment=cancelled';

// Configuration des features
window.FEATURES = {
  ENABLE_CHAT: true,
  ENABLE_AR_VR: true,
  ENABLE_AI_TOOLS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PREMIUM_FEATURES: true,
  MAINTENANCE_MODE: false
};

// Messages de maintenance (si activé)
window.MAINTENANCE_MESSAGE = "BestoolsVerse est en maintenance. Nous serons de retour bientôt !";

// Logging helper
window.log = function(...args) {
  if (window.DEBUG) {
    console.log('[BestoolsVerse]', ...args);
  }
};

// Initialisation
window.log('Configuration loaded', {
  env: window.ENV,
  apiUrl: window.API_URL,
  features: window.FEATURES
});