/**
 * Module de gestion des appels API
 * Centralise toutes les requêtes vers notre backend et services externes
 */

import axios from 'axios';

// Configuration de base de l'instance axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.bestoolsverse.com';
const API_TIMEOUT = 30000; // 30 secondes

// Création d'une instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  response => response,
  error => {
    // Gestion des erreurs 401 (non authentifié)
    if (error.response && error.response.status === 401) {
      // Si le token est expiré ou invalide, déconnexion de l'utilisateur
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Redirection vers la page de connexion si nécessaire
      if (window.location.pathname !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    
    return Promise.reject(error);
  }
);

// API d'authentification
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/user'),
};

// API pour les outils
export const toolsAPI = {
  // Générateur de QR Code
  generateQrCode: (data) => api.post('/tools/qr-code/generate', data),
  saveQrCode: (qrData) => api.post('/tools/qr-code/save', qrData),
  
  // Convertisseur de fichiers
  getConversionOptions: (fileType) => api.get(`/tools/converter/options/${fileType}`),
  convertFile: (fileData, targetFormat, options) => {
    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('targetFormat', targetFormat);
    formData.append('options', JSON.stringify(options));
    
    return api.post('/tools/converter/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  // Éditeur d'images IA
  processImage: (imageData, operations) => {
    const formData = new FormData();
    formData.append('image', imageData);
    formData.append('operations', JSON.stringify(operations));
    
    return api.post('/tools/image-editor/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  // Générateur de contenu
  generateContent: (prompt, options) => api.post('/tools/content-generator/generate', { prompt, options }),
  
  // Calculateur d'empreinte carbone
  calculateCarbon: (data) => api.post('/tools/carbon-calculator/calculate', data),
  
  // Services communs pour tous les outils
  getUserHistory: (toolId) => api.get(`/tools/${toolId}/history`),
  saveToFavorites: (toolId, itemData) => api.post(`/tools/${toolId}/favorites`, itemData),
  getFavorites: (toolId) => api.get(`/tools/${toolId}/favorites`),
  deleteHistoryItem: (toolId, itemId) => api.delete(`/tools/${toolId}/history/${itemId}`),
};

// API utilisateur
export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  getUsageStats: () => api.get('/users/stats'),
  getSubscription: () => api.get('/users/subscription'),
  updateSubscription: (planId) => api.put('/users/subscription', { planId }),
  cancelSubscription: () => api.delete('/users/subscription'),
};

// API pour les paiements
export const paymentAPI = {
  createCheckoutSession: (planId) => api.post('/payments/create-checkout', { planId }),
  getPlans: () => api.get('/payments/plans'),
  getInvoices: () => api.get('/payments/invoices'),
};

// API pour le feedback
export const feedbackAPI = {
  submitFeedback: (toolId, feedback) => api.post('/feedback', { toolId, feedback }),
  reportIssue: (toolId, issue) => api.post('/feedback/issue', { toolId, issue }),
};

// Fonction utilitaire pour télécharger un fichier généré par le serveur
export const downloadFile = async (endpoint, params, filename) => {
  try {
    const response = await api.get(endpoint, {
      params,
      responseType: 'blob'
    });
    
    // Création d'un lien temporaire pour télécharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    throw error;
  }
};

export default {
  authAPI,
  toolsAPI,
  userAPI,
  paymentAPI,
  feedbackAPI,
  downloadFile
};
