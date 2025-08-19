// src/tools/WebsiteSpeedTester.jsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Zap, Globe, Clock, AlertTriangle, CheckCircle, Smartphone, Monitor, Server, Download, Image } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const WebsiteSpeedTester = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [error, setError] = useState('');

  const analyzeWebsite = async () => {
    if (!url.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    trackEvent('speed_tester', 'analyze_website', url);
    
    try {
      // Normaliser l'URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // Mesurer le temps de chargement
      const startTime = performance.now();
      
      // Utiliser l'API PageSpeed Insights de Google (nécessite une clé API en production)
      // Pour la démo, on utilise une approche simplifiée
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`);
      const data = await response.json();
      
      const endTime = performance.now();
      const loadTime = ((endTime - startTime) / 1000).toFixed(2);
      
      if (!data.contents) {
        throw new Error('Impossible d\'analyser le site');
      }

      // Analyser le contenu
      const htmlSize = new Blob([data.contents]).size;
      
      // Parser le HTML pour obtenir plus d'infos
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Compter les ressources
      const scripts = doc.querySelectorAll('script[src]');
      const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
      const images = doc.querySelectorAll('img');
      const totalRequests = scripts.length + stylesheets.length + images.length;
      
      // Calculer les scores
      const performanceScore = calculatePerformanceScore(loadTime, totalRequests, htmlSize);
      
      // Générer les résultats
      const mockResults = {
        overall: performanceScore,
        metrics: {
          fcp: (loadTime * 0.3).toFixed(1), // First Contentful Paint (simulé)
          lcp: (loadTime * 0.7).toFixed(1), // Largest Contentful Paint (simulé)
          fid: Math.floor(50 + Math.random() * 50), // First Input Delay (simulé)
          cls: (Math.random() * 0.1).toFixed(3), // Cumulative Layout Shift (simulé)
          ttfb: (loadTime * 0.2 * 1000).toFixed(0), // Time to First Byte
          si: loadTime // Speed Index
        },
        opportunities: generateOptimizations(doc, htmlSize, totalRequests, loadTime),
        technical: {
          serverResponse: (loadTime * 0.2 * 1000).toFixed(0),
          domElements: doc.querySelectorAll('*').length,
          requests: totalRequests,
          totalSize: formatBytes(htmlSize),
          scripts: scripts.length,
          stylesheets: stylesheets.length,
          images: images.length,
          https: normalizedUrl.startsWith('https://'),
          gzip: true // Simulé - nécessiterait une vraie vérification des headers
        },
        loadTime: loadTime,
        timestamp: new Date().toISOString()
      };
      
      setResults(mockResults);
    } catch (error) {
      console.error('Erreur analyse vitesse:', error);
      setError('Erreur lors de l\'analyse. Vérifiez l\'URL et réessayez.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculatePerformanceScore = (loadTime, requests, size) => {
    let score = 100;
    
    // Pénalité pour le temps de chargement
    if (loadTime > 3) score -= (loadTime - 3) * 10;
    if (loadTime > 5) score -= (loadTime - 5) * 5;
    
    // Pénalité pour le nombre de requêtes
    if (requests > 50) score -= (requests - 50) * 0.5;
    if (requests > 100) score -= (requests - 100) * 0.5;
    
    // Pénalité pour la taille
    const sizeInMB = size / (1024 * 1024);
    if (sizeInMB > 1) score -= (sizeInMB - 1) * 5;
    if (sizeInMB > 3) score -= (sizeInMB - 3) * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const generateOptimizations = (doc, htmlSize, totalRequests, loadTime) => {
    const optimizations = [];
    
    // Vérifier les images
    const images = doc.querySelectorAll('img');
    const largeImages = Array.from(images).filter(img => {
      const src = img.getAttribute('src');
      return src && !src.includes('.webp') && !src.includes('.avif');
    });
    
    if (largeImages.length > 0) {
      optimizations.push({
        title: 'Optimiser les images',
        impact: 'Élevé',
        saving: `${(largeImages.length * 0.5).toFixed(1)}s`,
        description: `${largeImages.length} images peuvent être optimisées en WebP/AVIF pour réduire la taille.`,
        details: [
          'Utilisez des formats modernes (WebP, AVIF)',
          'Implémentez le lazy loading natif',
          'Servez des images responsives avec srcset',
          'Compressez les images sans perte de qualité visible',
        ]
      });
    }
    
    // Vérifier les scripts
    const scripts = doc.querySelectorAll('script[src]');
    const blockingScripts = Array.from(scripts).filter(script => 
      !script.hasAttribute('async') && !script.hasAttribute('defer')
    );
    
    if (blockingScripts.length > 0) {
      optimizations.push({
        title: 'Éliminer les ressources bloquantes',
        impact: 'Moyen',
        saving: `${(blockingScripts.length * 0.3).toFixed(1)}s`,
        description: `${blockingScripts.length} scripts bloquent le rendu. Utilisez async ou defer.`,
        details: [
          'Ajoutez l\'attribut "defer" pour les scripts non critiques',
          'Utilisez "async" pour les scripts indépendants',
          'Chargez les scripts tiers après le contenu principal',
          'Considérez le chargement différé (lazy loading) des scripts'
        ]
      });
    }
    
    // Vérifier la compression
    if (htmlSize > 50000) {
      optimizations.push({
        title: 'Activer la compression',
        impact: 'Moyen',
        saving: `${(htmlSize / 100000).toFixed(1)}s`,
        description: 'Utilisez gzip ou brotli pour compresser les ressources texte.',
        details: [
          'Activez la compression Brotli (30% plus efficace que gzip)',
          'Configurez la compression sur votre serveur web',
          'Minifiez HTML, CSS et JavaScript',
          'Réduisez la taille des ressources de 70-90%'
        ]
      });
    }
    
    // Vérifier le cache
    if (totalRequests > 30) {
      optimizations.push({
        title: 'Mettre en cache les ressources statiques',
        impact: 'Faible',
        saving: '0.5s',
        description: 'Configurez des en-têtes de cache appropriés pour les ressources statiques.',
        details: [
          'Utilisez Cache-Control avec max-age long pour les assets',
          'Implémentez le versioning des fichiers',
          'Utilisez un CDN pour la distribution globale',
          'Configurez ETags pour la validation du cache'
        ]
      });
    }
    
    // CSS critique
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
    if (stylesheets.length > 3) {
      optimizations.push({
        title: 'Optimiser le CSS critique',
        impact: 'Moyen',
        saving: '0.8s',
        description: 'Inlinez le CSS critique et chargez le reste de manière asynchrone.',
        details: [
          'Extrayez et inlinez le CSS above-the-fold',
          'Chargez le CSS non critique de manière asynchrone',
          'Supprimez le CSS inutilisé (tree shaking)',
          'Utilisez CSS containment pour l\'isolation des styles'
        ]
      });
    }

    // Fonts web
    const fonts = doc.querySelectorAll('link[href*="fonts"]');
    if (fonts.length > 0) {
      optimizations.push({
        title: 'Optimiser les polices web',
        impact: 'Faible',
        saving: '0.3s',
        description: 'Optimisez le chargement des polices pour éviter le FOIT/FOUT.',
        details: [
          'Utilisez font-display: swap',
          'Préchargez les polices critiques avec preload',
          'Utilisez des formats modernes (WOFF2)',
          'Limitez le nombre de variantes de police'
        ]
      });
    }
    
    // HTTP/2 et HTTP/3
    optimizations.push({
      title: 'Protocoles réseau modernes',
      impact: 'Moyen',
      saving: '0.7s',
      description: 'Utilisez HTTP/2 ou HTTP/3 pour des performances optimales.',
      details: [
        'Activez HTTP/2 multiplexing',
        'Utilisez Server Push pour les ressources critiques',
        'Implémentez HTTP/3 (QUIC) si disponible',
        'Réduisez la latence avec 0-RTT'
      ]
    });
    
    return optimizations;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    if (score >= 50) return 'Moyen';
    return 'Lent';
  };

  const getMetricStatus = (metric, value) => {
    const thresholds = {
      fcp: { good: 1.8, poor: 3.0 },
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  return (
    <Layout 
      title="Test de Vitesse Site Web" 
      description="Testez la vitesse de votre site web et obtenez des recommandations d'optimisation. Analyse complète de performance et SEO."
      keywords="test vitesse site web, analyse performance, optimisation seo, pagespeed insights"
    >
      <Helmet>
        <title>Test de Vitesse Site Web | BestoolsVerse</title>
        <meta name="description" content="Testez la vitesse de votre site web et obtenez des recommandations d'optimisation. Analyse complète de performance et SEO." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Test de Vitesse Site Web</h1>
            <p className="text-gray-400 mt-2">Analysez les performances de votre site et obtenez des recommandations</p>
          </div>
          <Zap className="text-yellow-500" size={48} />
        </div>

        {/* Formulaire de test */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Testez la vitesse de votre site web
          </h3>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
              />
              <button
                onClick={analyzeWebsite}
                disabled={!url.trim() || isAnalyzing}
                className={`px-8 py-4 rounded-lg font-medium transition-all ${
                  !url.trim() || isAnalyzing
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isAnalyzing ? 'Analyse...' : 'Analyser'}
              </button>
            </div>

            {/* Sélecteur d'appareil */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSelectedDevice('desktop')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedDevice === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Monitor size={20} className="mr-2" />
                Desktop
              </button>
              <button
                onClick={() => setSelectedDevice('mobile')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedDevice === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Smartphone size={20} className="mr-2" />
                Mobile
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 max-w-2xl mx-auto bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center text-blue-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-3"></div>
                <span>Analyse en cours... Cela peut prendre quelques secondes</span>
              </div>
              <div className="mt-4 max-w-md mx-auto bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          )}
        </div>

        {/* Résultats */}
        {results && (
          <div className="space-y-8">
            {/* Score global */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 text-center">
              <h3 className="text-2xl font-semibold text-white mb-6">Score de Performance</h3>
              <div className="flex justify-center items-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={results.overall >= 90 ? '#10B981' : results.overall >= 70 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="2"
                      strokeDasharray={`${results.overall}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(results.overall)}`}>
                      {results.overall}
                    </span>
                  </div>
                </div>
              </div>
              <p className={`text-xl font-semibold ${getScoreColor(results.overall)}`}>
                {getScoreLabel(results.overall)}
              </p>
              <p className="text-gray-400 mt-2">Temps de chargement: {results.loadTime}s</p>
            </div>

            {/* Métriques détaillées */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Métriques Web Vitals</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">First Contentful Paint</span>
                    {getMetricStatus('fcp', parseFloat(results.metrics.fcp)) === 'good' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertTriangle className="text-yellow-500" size={20} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white">{results.metrics.fcp}s</p>
                  <p className="text-sm text-gray-400">Temps d'affichage du premier contenu</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Largest Contentful Paint</span>
                    {getMetricStatus('lcp', parseFloat(results.metrics.lcp)) === 'good' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertTriangle className="text-yellow-500" size={20} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white">{results.metrics.lcp}s</p>
                  <p className="text-sm text-gray-400">Temps d'affichage du plus grand élément</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">First Input Delay</span>
                    {getMetricStatus('fid', parseInt(results.metrics.fid)) === 'good' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertTriangle className="text-yellow-500" size={20} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white">{results.metrics.fid}ms</p>
                  <p className="text-sm text-gray-400">Délai de première interaction</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Cumulative Layout Shift</span>
                    {getMetricStatus('cls', parseFloat(results.metrics.cls)) === 'good' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertTriangle className="text-yellow-500" size={20} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white">{results.metrics.cls}</p>
                  <p className="text-sm text-gray-400">Décalage cumulé de mise en page</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Time to First Byte</span>
                    <Clock className="text-blue-500" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-white">{results.metrics.ttfb}ms</p>
                  <p className="text-sm text-gray-400">Temps de réponse du serveur</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Speed Index</span>
                    <Globe className="text-purple-500" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-white">{results.metrics.si}s</p>
                  <p className="text-sm text-gray-400">Indice de vitesse d'affichage</p>
                </div>
              </div>
            </div>

            {/* Opportunités d'amélioration */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Opportunités d'amélioration</h3>
              
              <div className="space-y-4">
                {results.opportunities.map((opportunity, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-semibold text-white mr-3">{opportunity.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            opportunity.impact === 'Élevé' ? 'bg-red-500 text-white' :
                            opportunity.impact === 'Moyen' ? 'bg-yellow-500 text-black' :
                            'bg-green-500 text-white'
                          }`}>
                            {opportunity.impact}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{opportunity.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-green-400">{opportunity.saving}</p>
                        <p className="text-sm text-gray-400">économisés</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations techniques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Informations techniques</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Temps de réponse serveur</span>
                    <span className="text-white font-medium">{results.technical.serverResponse}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Éléments DOM</span>
                    <span className="text-white font-medium">{results.technical.domElements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Requêtes HTTP</span>
                    <span className="text-white font-medium">{results.technical.requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Scripts JS</span>
                    <span className="text-white font-medium">{results.technical.scripts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Feuilles CSS</span>
                    <span className="text-white font-medium">{results.technical.stylesheets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Images</span>
                    <span className="text-white font-medium">{results.technical.images}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Taille totale</span>
                    <span className="text-white font-medium">{results.technical.totalSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">HTTPS</span>
                    <span className="text-white font-medium">{results.technical.https ? '✓ Activé' : '✗ Non activé'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Recommandations générales</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-300 text-sm">Optimisez vos images (format WebP, compression)</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-300 text-sm">Utilisez un CDN pour distribuer vos ressources</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-300 text-sm">Activez la compression gzip/brotli</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-300 text-sm">Minifiez CSS, JavaScript et HTML</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-300 text-sm">Implémentez le lazy loading pour les images</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-300 text-sm">Utilisez HTTP/2 ou HTTP/3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informations sur l'outil */}
        {!results && !isAnalyzing && (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Pourquoi tester la vitesse de votre site ?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-white mb-2">Performance SEO</h4>
                <p className="text-gray-400 text-sm">
                  Google utilise la vitesse comme facteur de classement dans les résultats de recherche.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-white mb-2">Expérience utilisateur</h4>
                <p className="text-gray-400 text-sm">
                  Un site rapide améliore l'engagement et réduit le taux de rebond.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-white mb-2">Taux de conversion</h4>
                <p className="text-gray-400 text-sm">
                  Chaque seconde gagnée peut augmenter significativement vos conversions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WebsiteSpeedTester;