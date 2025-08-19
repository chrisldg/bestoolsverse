// src/utils/analytics.js
/**
 * Module de tracking analytics
 * Gère l'envoi d'événements vers Google Analytics et autres services
 */

// Configuration Google Analytics
const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;
const ENABLE_ANALYTICS = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

/**
 * Initialise Google Analytics
 */
export const initGA = () => {
  if (!ENABLE_ANALYTICS || !GA_TRACKING_ID) {
    console.log('Analytics disabled or no tracking ID');
    return;
  }

  // Charger le script Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialiser gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

/**
 * Envoie un événement à Google Analytics
 * @param {string} category - Catégorie de l'événement (ex: 'tool', 'navigation')
 * @param {string} action - Action effectuée (ex: 'click', 'submit')
 * @param {string} label - Label optionnel pour plus de détails
 * @param {number} value - Valeur numérique optionnelle
 */
export const trackEvent = (category, action, label = null, value = null) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Track event:', { category, action, label, value });
    return;
  }

  const eventParams = {
    event_category: category,
    event_label: label,
    value: value
  };

  // Filtrer les paramètres null
  Object.keys(eventParams).forEach(key => {
    if (eventParams[key] === null) {
      delete eventParams[key];
    }
  });

  window.gtag('event', action, eventParams);
};

/**
 * Track une page vue
 * @param {string} path - Chemin de la page
 * @param {string} title - Titre de la page
 */
export const trackPageView = (path, title) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Track page view:', { path, title });
    return;
  }

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title,
    page_path: path
  });
};

/**
 * Track une conversion (ex: inscription, achat)
 * @param {string} conversionId - ID de conversion
 * @param {object} conversionData - Données additionnelles
 */
export const trackConversion = (conversionId, conversionData = {}) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Track conversion:', { conversionId, conversionData });
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    ...conversionData
  });
};

/**
 * Track une exception/erreur
 * @param {string} description - Description de l'erreur
 * @param {boolean} fatal - Si l'erreur est fatale
 */
export const trackException = (description, fatal = false) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.error('Track exception:', { description, fatal });
    return;
  }

  window.gtag('event', 'exception', {
    description: description,
    fatal: fatal
  });
};

/**
 * Track le timing de performance
 * @param {string} category - Catégorie (ex: 'API', 'Tool')
 * @param {string} variable - Variable mesurée (ex: 'load_time')
 * @param {number} value - Temps en millisecondes
 * @param {string} label - Label optionnel
 */
export const trackTiming = (category, variable, value, label = null) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Track timing:', { category, variable, value, label });
    return;
  }

  window.gtag('event', 'timing_complete', {
    name: variable,
    value: value,
    event_category: category,
    event_label: label
  });
};

/**
 * Track l'utilisation d'un outil
 * @param {string} toolName - Nom de l'outil
 * @param {string} action - Action effectuée
 * @param {object} metadata - Métadonnées additionnelles
 */
export const trackToolUsage = (toolName, action, metadata = {}) => {
  trackEvent('tool_usage', action, toolName);
  
  // Envoyer des événements personnalisés pour certains outils
  if (metadata.duration) {
    trackTiming('tool_performance', 'execution_time', metadata.duration, toolName);
  }
  
  if (metadata.success !== undefined) {
    trackEvent('tool_result', metadata.success ? 'success' : 'failure', toolName);
  }
};

/**
 * Track les interactions sociales
 * @param {string} network - Réseau social (ex: 'twitter', 'facebook')
 * @param {string} action - Action (ex: 'share', 'like')
 * @param {string} target - URL ou contenu partagé
 */
export const trackSocial = (network, action, target) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Track social:', { network, action, target });
    return;
  }

  window.gtag('event', 'share', {
    method: network,
    content_type: action,
    item_id: target
  });
};

/**
 * Track la recherche interne
 * @param {string} searchTerm - Terme recherché
 * @param {number} resultsCount - Nombre de résultats
 */
export const trackSearch = (searchTerm, resultsCount = null) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Track search:', { searchTerm, resultsCount });
    return;
  }

  const eventParams = {
    search_term: searchTerm
  };
  
  if (resultsCount !== null) {
    eventParams.results_count = resultsCount;
  }

  window.gtag('event', 'search', eventParams);
};

/**
 * Track l'engagement utilisateur
 * @param {number} timeOnPage - Temps passé sur la page en secondes
 * @param {number} scrollDepth - Profondeur de scroll en pourcentage
 */
export const trackEngagement = (timeOnPage, scrollDepth) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Track engagement:', { timeOnPage, scrollDepth });
    return;
  }

  window.gtag('event', 'user_engagement', {
    engagement_time_msec: timeOnPage * 1000,
    scroll_depth: scrollDepth
  });
};

/**
 * Définir les propriétés utilisateur
 * @param {object} properties - Propriétés utilisateur
 */
export const setUserProperties = (properties) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Set user properties:', properties);
    return;
  }

  window.gtag('set', { user_properties: properties });
};

/**
 * Définir l'ID utilisateur pour le tracking cross-device
 * @param {string} userId - ID utilisateur unique
 */
export const setUserId = (userId) => {
  if (!ENABLE_ANALYTICS || typeof window.gtag !== 'function') {
    console.log('Set user ID:', userId);
    return;
  }

  window.gtag('config', GA_TRACKING_ID, {
    user_id: userId
  });
};

// Exporter toutes les fonctions
export default {
  initGA,
  trackEvent,
  trackPageView,
  trackConversion,
  trackException,
  trackTiming,
  trackToolUsage,
  trackSocial,
  trackSearch,
  trackEngagement,
  setUserProperties,
  setUserId
};