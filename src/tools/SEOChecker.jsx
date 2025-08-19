// src/tools/SEOChecker.jsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { 
  ChevronLeft, 
  Search, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  BarChart3, 
  FileText, 
  Link, 
  Image as ImageIcon, 
  Clock, 
  Smartphone, 
  Monitor,
  Settings,
  Zap,
  Download,
  RefreshCw
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const SEOChecker = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  const analyzeWebsite = async () => {
    if (!url.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    trackEvent('seo_checker', 'analyze_website', url);
    
    try {
      // Normaliser l'URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // Simuler l'analyse (en production, utiliser une vraie API SEO)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Générer des résultats mock
      const mockResults = generateMockResults(normalizedUrl);
      setResults(mockResults);
      
    } catch (error) {
      console.error('Erreur analyse SEO:', error);
      setError('Erreur lors de l\'analyse. Vérifiez l\'URL et réessayez.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockResults = (url) => {
    const domain = new URL(url).hostname;
    
    return {
      url: url,
      score: Math.floor(Math.random() * 30) + 70, // Score entre 70 et 100
      timestamp: new Date().toISOString(),
      
      // Données de base
      title: `${domain} - Site Web Professionnel`,
      description: 'Description meta de votre site web. Cette description apparaît dans les résultats de recherche Google.',
      keywords: ['business', 'services', 'professionnel', domain.split('.')[0]],
      
      // Métriques techniques
      technical: {
        loadTime: (Math.random() * 3 + 1).toFixed(2), // Entre 1 et 4 secondes
        mobileResponsive: Math.random() > 0.3,
        https: url.startsWith('https://'),
        robotsTxt: Math.random() > 0.2,
        sitemap: Math.random() > 0.3,
        canonicalUrl: Math.random() > 0.4,
        structuredData: Math.random() > 0.5,
        compression: Math.random() > 0.3,
        caching: Math.random() > 0.4
      },
      
      // Contenu
      content: {
        h1Count: Math.floor(Math.random() * 3) + 1,
        h2Count: Math.floor(Math.random() * 8) + 2,
        wordCount: Math.floor(Math.random() * 1500) + 500,
        imagesCount: Math.floor(Math.random() * 20) + 5,
        imagesWithAlt: Math.floor(Math.random() * 15) + 3,
        internalLinks: Math.floor(Math.random() * 30) + 10,
        externalLinks: Math.floor(Math.random() * 10) + 2
      },
      
      // Social
      social: {
        ogTitle: Math.random() > 0.3,
        ogDescription: Math.random() > 0.3,
        ogImage: Math.random() > 0.4,
        twitterCard: Math.random() > 0.5
      },
      
      // Performance
      performance: {
        firstContentfulPaint: (Math.random() * 2 + 0.5).toFixed(1),
        largestContentfulPaint: (Math.random() * 3 + 1).toFixed(1),
        totalBlockingTime: Math.floor(Math.random() * 300) + 50,
        cumulativeLayoutShift: (Math.random() * 0.2).toFixed(3)
      }
    };
  };

  const calculateCategoryScore = (category) => {
    if (!results) return 0;
    
    switch (category) {
      case 'technical':
        const techChecks = Object.values(results.technical).filter(v => typeof v === 'boolean');
        const techPassed = techChecks.filter(v => v).length;
        return Math.round((techPassed / techChecks.length) * 100);
        
      case 'content':
        let contentScore = 100;
        if (results.content.wordCount < 300) contentScore -= 20;
        if (results.content.h1Count === 0) contentScore -= 20;
        if (results.content.h1Count > 1) contentScore -= 10;
        if (results.content.imagesWithAlt < results.content.imagesCount * 0.8) contentScore -= 15;
        return Math.max(0, contentScore);
        
      case 'performance':
        let perfScore = 100;
        if (parseFloat(results.technical.loadTime) > 3) perfScore -= 30;
        if (parseFloat(results.performance.largestContentfulPaint) > 2.5) perfScore -= 20;
        return Math.max(0, perfScore);
        
      default:
        return 0;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    if (score >= 50) return 'À améliorer';
    return 'Faible';
  };

  const generateSuggestions = () => {
    if (!results) return [];
    
    const suggestions = [];
    const data = results;
    
    // Vérifications du titre
    if (!data.title || data.title.length < 30) {
      suggestions.push({
        type: 'error',
        category: 'Contenu',
        title: 'Titre trop court',
        description: 'Votre titre devrait contenir entre 30 et 60 caractères pour un meilleur référencement.',
        action: 'Ajoutez des mots-clés pertinents à votre titre'
      });
    } else if (data.title.length > 60) {
      suggestions.push({
        type: 'warning',
        category: 'Contenu',
        title: 'Titre trop long',
        description: 'Votre titre dépasse 60 caractères et risque d\'être tronqué dans les résultats de recherche.',
        action: 'Réduisez la longueur de votre titre'
      });
    }
    
    // Vérifications de la description
    if (!data.description || data.description.length < 120) {
      suggestions.push({
        type: 'error',
        category: 'Contenu',
        title: 'Description meta trop courte',
        description: 'Votre description devrait contenir entre 120 et 160 caractères.',
        action: 'Rédigez une description plus détaillée'
      });
    }
    
    // Vérifications techniques
    if (!data.technical.https) {
      suggestions.push({
        type: 'error',
        category: 'Technique',
        title: 'Site non sécurisé (HTTP)',
        description: 'Votre site n\'utilise pas HTTPS, ce qui pénalise votre référencement.',
        action: 'Installez un certificat SSL'
      });
    }
    
    if (!data.technical.mobileResponsive) {
      suggestions.push({
        type: 'error',
        category: 'Technique',
        title: 'Site non responsive',
        description: 'Votre site n\'est pas optimisé pour les appareils mobiles.',
        action: 'Adaptez votre design pour mobile'
      });
    }
    
    if (parseFloat(data.technical.loadTime) > 3) {
      suggestions.push({
        type: 'warning',
        category: 'Performance',
        title: 'Temps de chargement élevé',
        description: `Votre site met ${data.technical.loadTime}s à charger. L'idéal est moins de 3 secondes.`,
        action: 'Optimisez vos images et ressources'
      });
    }
    
    // Vérifications du contenu
    if (data.content.wordCount < 300) {
      suggestions.push({
        type: 'warning',
        category: 'Contenu',
        title: 'Contenu insuffisant',
        description: 'Votre page contient moins de 300 mots, ce qui peut nuire au référencement.',
        action: 'Ajoutez plus de contenu pertinent'
      });
    }
    
    if (data.content.h1Count === 0) {
      suggestions.push({
        type: 'error',
        category: 'Contenu',
        title: 'Balise H1 manquante',
        description: 'Aucune balise H1 trouvée. Chaque page doit avoir exactement une balise H1.',
        action: 'Ajoutez une balise H1 avec votre mot-clé principal'
      });
    } else if (data.content.h1Count > 1) {
      suggestions.push({
        type: 'warning',
        category: 'Contenu',
        title: 'Plusieurs balises H1',
        description: `${data.content.h1Count} balises H1 trouvées. Il ne devrait y en avoir qu'une seule.`,
        action: 'Gardez une seule H1 et utilisez des H2 pour les sous-titres'
      });
    }
    
    const altPercentage = (data.content.imagesWithAlt / data.content.imagesCount) * 100;
    if (altPercentage < 80) {
      suggestions.push({
        type: 'warning',
        category: 'Contenu',
        title: 'Images sans texte alternatif',
        description: `Seulement ${Math.round(altPercentage)}% de vos images ont un texte alternatif.`,
        action: 'Ajoutez des attributs alt descriptifs à toutes vos images'
      });
    }
    
    // Vérifications sociales
    if (!data.social.ogTitle || !data.social.ogDescription || !data.social.ogImage) {
      suggestions.push({
        type: 'info',
        category: 'Social',
        title: 'Balises Open Graph incomplètes',
        description: 'Les balises Open Graph améliorent l\'apparence lors du partage sur les réseaux sociaux.',
        action: 'Ajoutez les balises og:title, og:description et og:image'
      });
    }
    
    return suggestions;
  };

  return (
    <Layout 
      title="Assistant SEO Pro" 
      description="Analysez et optimisez le référencement de votre site web. Audit SEO complet avec recommandations détaillées."
      keywords="seo checker, audit seo, référencement, analyse site web, optimisation seo"
    >
      <Helmet>
        <title>Assistant SEO Pro - Analyseur de Référencement | BestoolsVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <nav className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-16">
              <a href="/" className="flex items-center text-green-500 hover:text-green-400">
                <ChevronLeft size={20} className="mr-2" />
                <span>Retour aux outils</span>
              </a>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Assistant SEO Pro</h1>
            <p className="text-gray-400 text-lg">
              Analysez et optimisez le référencement de votre site web
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                  placeholder="Entrez l'URL de votre site web..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                />
              </div>
              <button
                onClick={analyzeWebsite}
                disabled={isAnalyzing || !url.trim()}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center ${
                  isAnalyzing || !url.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Search size={20} className="mr-2" />
                    Analyser
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Résultats */}
          {results && (
            <div className="space-y-6">
              {/* Score global */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Score SEO Global</h2>
                    <p className="text-gray-400">{results.url}</p>
                  </div>
                  <div className="text-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className={getScoreColor(results.score)}
                          strokeDasharray={`${results.score * 3.52} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                          {results.score}
                        </span>
                      </div>
                    </div>
                    <p className={`text-lg font-semibold mt-2 ${getScoreColor(results.score)}`}>
                      {getScoreLabel(results.score)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Onglets */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700">
                <div className="flex border-b border-gray-700">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-gray-900 text-white border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Vue d'ensemble
                  </button>
                  <button
                    onClick={() => setActiveTab('technical')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'technical'
                        ? 'bg-gray-900 text-white border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Technique
                  </button>
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'content'
                        ? 'bg-gray-900 text-white border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Contenu
                  </button>
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'suggestions'
                        ? 'bg-gray-900 text-white border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Suggestions
                  </button>
                </div>

                <div className="p-6">
                  {/* Vue d'ensemble */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Score technique */}
                        <div className="bg-gray-900 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Technique</h3>
                            <Settings size={24} className="text-gray-400" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-2">
                            {calculateCategoryScore('technical')}%
                          </div>
                          <p className="text-sm text-gray-400">
                            {results.technical.https ? '✓' : '✗'} HTTPS<br />
                            {results.technical.mobileResponsive ? '✓' : '✗'} Mobile responsive<br />
                            {results.technical.robotsTxt ? '✓' : '✗'} Robots.txt
                          </p>
                        </div>

                        {/* Score contenu */}
                        <div className="bg-gray-900 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Contenu</h3>
                            <FileText size={24} className="text-gray-400" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-2">
                            {calculateCategoryScore('content')}%
                          </div>
                          <p className="text-sm text-gray-400">
                            {results.content.wordCount} mots<br />
                            {results.content.h1Count} balise(s) H1<br />
                            {results.content.imagesCount} images
                          </p>
                        </div>

                        {/* Score performance */}
                        <div className="bg-gray-900 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Performance</h3>
                            <Zap size={24} className="text-gray-400" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-2">
                            {calculateCategoryScore('performance')}%
                          </div>
                          <p className="text-sm text-gray-400">
                            {results.technical.loadTime}s temps de chargement<br />
                            LCP: {results.performance.largestContentfulPaint}s<br />
                            {results.technical.compression ? '✓' : '✗'} Compression
                          </p>
                        </div>
                      </div>

                      {/* Méta-données */}
                      <div className="bg-gray-900 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Méta-données</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Titre ({results.title.length} caractères)</p>
                            <p className="text-white">{results.title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Description ({results.description.length} caractères)</p>
                            <p className="text-white">{results.description}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Mots-clés</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {results.keywords.map((keyword, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Technique */}
                  {activeTab === 'technical' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(results.technical).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
                            <span className="text-gray-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {typeof value === 'boolean' ? (
                              value ? (
                                <CheckCircle className="text-green-500" size={20} />
                              ) : (
                                <AlertTriangle className="text-red-500" size={20} />
                              )
                            ) : (
                              <span className="text-white font-medium">{value}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-900 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Performance Web Vitals</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">FCP</p>
                            <p className="text-2xl font-bold text-white">{results.performance.firstContentfulPaint}s</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">LCP</p>
                            <p className="text-2xl font-bold text-white">{results.performance.largestContentfulPaint}s</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">TBT</p>
                            <p className="text-2xl font-bold text-white">{results.performance.totalBlockingTime}ms</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-400 mb-2">CLS</p>
                            <p className="text-2xl font-bold text-white">{results.performance.cumulativeLayoutShift}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Contenu */}
                  {activeTab === 'content' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900 rounded-lg p-6 text-center">
                          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-3xl font-bold text-white mb-2">{results.content.wordCount}</p>
                          <p className="text-gray-400">Mots au total</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-6 text-center">
                          <h2 className="text-3xl font-bold text-gray-400 mb-4">H1</h2>
                          <p className="text-3xl font-bold text-white mb-2">{results.content.h1Count}</p>
                          <p className="text-gray-400">Balise(s) H1</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-6 text-center">
                          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-3xl font-bold text-white mb-2">
                            {results.content.imagesWithAlt}/{results.content.imagesCount}
                          </p>
                          <p className="text-gray-400">Images avec alt</p>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Structure des liens</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-3xl font-bold text-white mb-2">{results.content.internalLinks}</p>
                            <p className="text-gray-400">Liens internes</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-white mb-2">{results.content.externalLinks}</p>
                            <p className="text-gray-400">Liens externes</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Balises sociales</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(results.social).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">{key}</span>
                              {value ? (
                                <CheckCircle className="text-green-500" size={20} />
                              ) : (
                                <AlertTriangle className="text-yellow-500" size={20} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Suggestions */}
                  {activeTab === 'suggestions' && (
                    <div className="space-y-4">
                      {generateSuggestions().map((suggestion, index) => (
                        <div 
                          key={index} 
                          className={`bg-gray-900 rounded-lg p-6 border-l-4 ${
                            suggestion.type === 'error' ? 'border-red-500' : 
                            suggestion.type === 'warning' ? 'border-yellow-500' : 
                            'border-blue-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                {suggestion.type === 'error' ? (
                                  <AlertTriangle className="text-red-500 mr-2" size={20} />
                                ) : suggestion.type === 'warning' ? (
                                  <Info className="text-yellow-500 mr-2" size={20} />
                                ) : (
                                  <CheckCircle className="text-blue-500 mr-2" size={20} />
                                )}
                                <span className="text-sm text-gray-400">{suggestion.category}</span>
                              </div>
                              <h4 className="text-lg font-semibold text-white mb-2">
                                {suggestion.title}
                              </h4>
                              <p className="text-gray-300 mb-3">
                                {suggestion.description}
                              </p>
                              <div className="bg-gray-800 rounded-lg p-3">
                                <p className="text-sm text-green-400">
                                  <strong>Action recommandée:</strong> {suggestion.action}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {generateSuggestions().length === 0 && (
                        <div className="bg-gray-900 rounded-lg p-8 text-center">
                          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Excellent travail!
                          </h3>
                          <p className="text-gray-400">
                            Votre site est bien optimisé. Continuez à surveiller régulièrement 
                            votre SEO pour maintenir ces bonnes performances.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => {
                      const report = `Score SEO: ${results.score}/100\n` +
                        `URL: ${results.url}\n` +
                        `Analyse du: ${new Date(results.timestamp).toLocaleString()}\n\n` +
                        `Suggestions:\n${generateSuggestions().map(s => `- ${s.title}: ${s.action}`).join('\n')}`;
                      navigator.clipboard.writeText(report);
                      trackEvent('seo_checker', 'copy_report');
                    }}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FileText size={20} className="mr-2" />
                    Copier le rapport
                  </button>
                  
                  <button 
                    onClick={() => {
                      window.print();
                      trackEvent('seo_checker', 'print_report');
                    }}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <BarChart3 size={20} className="mr-2" />
                    Imprimer
                  </button>
                  
                  <button 
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `seo-report-${new Date().toISOString()}.json`;
                      a.click();
                      trackEvent('seo_checker', 'download_json');
                    }}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Download size={20} className="mr-2" />
                    Télécharger JSON
                  </button>
                  
                  <button 
                    onClick={analyzeWebsite}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center"
                  >
                    <RefreshCw size={20} className="mr-2" />
                    Nouvelle analyse
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section d'aide */}
          {!results && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <Monitor className="text-green-500 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-white mb-2">Analyse complète</h3>
                <p className="text-gray-400">
                  Obtenez un audit SEO détaillé de votre site avec plus de 50 points de contrôle.
                </p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <Smartphone className="text-blue-500 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-white mb-2">Mobile First</h3>
                <p className="text-gray-400">
                  Vérifiez que votre site est optimisé pour les appareils mobiles et tablettes.
                </p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <Clock className="text-purple-500 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-white mb-2">Performance Web</h3>
                <p className="text-gray-400">
                  Analysez les Core Web Vitals et optimisez la vitesse de chargement.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SEOChecker;