// src/utils/seo.js
/**
 * Module utilitaire pour l'optimisation SEO
 * Gère les meta tags, structured data, et autres éléments SEO
 */

/**
 * Configuration SEO par défaut
 */
export const defaultSEO = {
  title: 'BestoolsVerse - Les Meilleurs Outils Web Réunis',
  description: 'Découvrez 20 outils web innovants pour créer, analyser et transformer vos contenus numériques. QR codes, conversion de fichiers, IA, et plus encore - tout gratuit.',
  keywords: 'outils web gratuits, générateur qr code, convertisseur fichiers, éditeur image ia, outils en ligne',
  author: 'BestoolsVerse',
  image: '/og-image.png',
  url: 'https://bestoolsverse.com',
  siteName: 'BestoolsVerse',
  twitterHandle: '@BestoolsVerse',
  locale: 'fr_FR',
  type: 'website'
};

/**
 * Génère les meta tags pour une page
 * @param {object} config - Configuration SEO spécifique à la page
 * @returns {object} Meta tags à injecter
 */
export const generateMetaTags = (config = {}) => {
  const seo = { ...defaultSEO, ...config };
  
  return {
    title: seo.title,
    meta: [
      // Meta tags de base
      { name: 'description', content: seo.description },
      { name: 'keywords', content: seo.keywords },
      { name: 'author', content: seo.author },
      { name: 'robots', content: 'index, follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      
      // Open Graph
      { property: 'og:title', content: seo.title },
      { property: 'og:description', content: seo.description },
      { property: 'og:image', content: seo.image },
      { property: 'og:url', content: seo.url },
      { property: 'og:site_name', content: seo.siteName },
      { property: 'og:type', content: seo.type },
      { property: 'og:locale', content: seo.locale },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seo.title },
      { name: 'twitter:description', content: seo.description },
      { name: 'twitter:image', content: seo.image },
      { name: 'twitter:site', content: seo.twitterHandle },
      { name: 'twitter:creator', content: seo.twitterHandle },
      
      // Autres
      { name: 'theme-color', content: '#3b82f6' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
    ],
    link: [
      { rel: 'canonical', href: seo.url },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.json' }
    ]
  };
};

/**
 * Génère les données structurées (Schema.org)
 * @param {string} type - Type de schema
 * @param {object} data - Données spécifiques
 * @returns {string} JSON-LD string
 */
export const generateStructuredData = (type, data = {}) => {
  const schemas = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'BestoolsVerse',
      url: 'https://bestoolsverse.com',
      logo: 'https://bestoolsverse.com/logo.png',
      description: defaultSEO.description,
      sameAs: [
        'https://twitter.com/BestoolsVerse',
        'https://facebook.com/BestoolsVerse',
        'https://linkedin.com/company/bestoolsverse'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '',
        contactType: 'customer service',
        availableLanguage: ['French', 'English']
      }
    },
    
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'BestoolsVerse',
      url: 'https://bestoolsverse.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://bestoolsverse.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    
    softwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: data.name || 'BestoolsVerse Tool',
      applicationCategory: 'WebApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.rating || '4.8',
        ratingCount: data.ratingCount || '1250'
      }
    },
    
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: (data.items || []).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    },
    
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (data.questions || []).map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    },
    
    howTo: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: data.name,
      description: data.description,
      step: (data.steps || []).map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        image: step.image
      }))
    }
  };
  
  const schema = schemas[type] || schemas.website;
  return JSON.stringify({ ...schema, ...data });
};

/**
 * Optimise le titre pour le SEO
 * @param {string} title - Titre original
 * @param {string} suffix - Suffixe à ajouter
 * @returns {string} Titre optimisé
 */
export const optimizeTitle = (title, suffix = 'BestoolsVerse') => {
  const maxLength = 60;
  let optimizedTitle = title;
  
  // Ajouter le suffixe si pas déjà présent
  if (!title.includes(suffix)) {
    optimizedTitle = `${title} | ${suffix}`;
  }
  
  // Tronquer si trop long
  if (optimizedTitle.length > maxLength) {
    optimizedTitle = title.substring(0, maxLength - suffix.length - 3) + '... | ' + suffix;
  }
  
  return optimizedTitle;
};

/**
 * Optimise la description pour le SEO
 * @param {string} description - Description originale
 * @returns {string} Description optimisée
 */
export const optimizeDescription = (description) => {
  const minLength = 120;
  const maxLength = 160;
  
  // Si trop courte, ajouter du contexte
  if (description.length < minLength) {
    description += ' Découvrez cet outil gratuit sur BestoolsVerse.';
  }
  
  // Si trop longue, tronquer intelligemment
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }
  
  return description;
};

/**
 * Génère un sitemap XML
 * @param {array} urls - Liste des URLs
 * @returns {string} Contenu XML du sitemap
 */
export const generateSitemap = (urls) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || new Date().toISOString()}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
};

/**
 * Analyse le texte pour extraire les mots-clés
 * @param {string} text - Texte à analyser
 * @param {number} maxKeywords - Nombre max de mots-clés
 * @returns {array} Liste de mots-clés
 */
export const extractKeywords = (text, maxKeywords = 10) => {
  // Mots vides à ignorer
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais',
    'pour', 'avec', 'sans', 'sur', 'dans', 'par', 'à', 'au', 'aux',
    'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
    'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs',
    'qui', 'que', 'quoi', 'dont', 'où', 'si', 'ne', 'pas', 'plus'
  ]);
  
  // Nettoyer et diviser le texte
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Compter les occurrences
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Trier et retourner les plus fréquents
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

/**
 * Vérifie la densité de mots-clés
 * @param {string} text - Texte à analyser
 * @param {string} keyword - Mot-clé à vérifier
 * @returns {number} Densité en pourcentage
 */
export const checkKeywordDensity = (text, keyword) => {
  const words = text.toLowerCase().split(/\s+/);
  const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;
  return ((keywordCount / words.length) * 100).toFixed(2);
};

/**
 * Génère des suggestions de meta tags basées sur le contenu
 * @param {object} content - Contenu de la page
 * @returns {object} Suggestions de meta tags
 */
export const generateMetaSuggestions = (content) => {
  const suggestions = {
    title: optimizeTitle(content.title || ''),
    description: optimizeDescription(content.description || ''),
    keywords: extractKeywords(content.text || '').join(', ')
  };
  
  // Ajouter des recommandations
  const recommendations = [];
  
  if (suggestions.title.length < 30) {
    recommendations.push('Le titre est trop court. Visez 30-60 caractères.');
  }
  
  if (suggestions.description.length < 120) {
    recommendations.push('La description est trop courte. Visez 120-160 caractères.');
  }
  
  if (suggestions.keywords.split(',').length < 5) {
    recommendations.push('Ajoutez plus de mots-clés pertinents (5-10 recommandés).');
  }
  
  return { suggestions, recommendations };
};

/**
 * Valide l'URL pour le SEO
 * @param {string} url - URL à valider
 * @returns {object} Résultat de validation
 */
export const validateURL = (url) => {
  const issues = [];
  
  // Vérifier la longueur
  if (url.length > 100) {
    issues.push('URL trop longue (> 100 caractères)');
  }
  
  // Vérifier les caractères spéciaux
  if (!/^[a-z0-9\-\/]+$/.test(url)) {
    issues.push('Utilisez uniquement des lettres minuscules, chiffres et tirets');
  }
  
  // Vérifier les underscores
  if (url.includes('_')) {
    issues.push('Remplacez les underscores par des tirets');
  }
  
  // Vérifier les paramètres
  if (url.includes('?')) {
    issues.push('Évitez les paramètres dans l\'URL si possible');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    score: Math.max(0, 100 - (issues.length * 25))
  };
};

// Exporter toutes les fonctions
export default {
  defaultSEO,
  generateMetaTags,
  generateStructuredData,
  optimizeTitle,
  optimizeDescription,
  generateSitemap,
  extractKeywords,
  checkKeywordDensity,
  generateMetaSuggestions,
  validateURL
};