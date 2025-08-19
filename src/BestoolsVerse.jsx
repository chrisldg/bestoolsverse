// src/BestoolsVerse.jsx
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Zap, Star, ArrowRight, X } from 'lucide-react';
import { Helmet } from 'react-helmet';
import Layout from './components/Layout';
import ToolCard from './components/ToolCard';
import { trackEvent } from './utils/analytics';

const BestoolsVerse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner
    const bannerDismissed = localStorage.getItem('bannerDismissed');
    if (bannerDismissed) {
      setShowBanner(false);
    }
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('bannerDismissed', 'true');
    trackEvent('banner', 'dismiss');
  };

  const tools = [
    {
      id: 'qr-code',
      name: 'Générateur de QR Code',
      description: 'Créez des QR codes personnalisés et artistiques',
      category: 'design',
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
      popularity: 95,
      link: '/tools/qr-code'
    },
    {
      id: 'file-converter',
      name: 'Convertisseur de Fichiers',
      description: 'Convertissez entre tous les formats populaires',
      category: 'productivity',
      icon: '🔄',
      color: 'from-blue-500 to-cyan-500',
      popularity: 98,
      link: '/tools/file-converter'
    },
    {
      id: 'ai-image-editor',
      name: 'Éditeur d\'Images IA',
      description: 'Retouchez et transformez vos images avec l\'IA',
      category: 'ai',
      icon: '🎨',
      color: 'from-green-500 to-teal-500',
      popularity: 96,
      link: '/tools/ai-image-editor'
    },
    {
      id: 'content-generator',
      name: 'Générateur de Contenu IA',
      description: 'Créez du contenu de qualité instantanément',
      category: 'ai',
      icon: '✍️',
      color: 'from-orange-500 to-red-500',
      popularity: 94,
      link: '/tools/content-generator'
    },
    {
      id: 'carbon-calculator',
      name: 'Calculateur d\'Empreinte Carbone',
      description: 'Mesurez votre impact environnemental',
      category: 'business',
      icon: '🌱',
      color: 'from-green-600 to-emerald-500',
      popularity: 85,
      link: '/tools/carbon-calculator'
    },
    {
      id: 'trend-analyzer',
      name: 'Analyseur de Tendances',
      description: 'Prédisez les tendances futures avec l\'IA',
      category: 'business',
      icon: '📈',
      color: 'from-indigo-500 to-purple-500',
      popularity: 89,
      link: '/tools/trend-analyzer'
    },
    {
      id: 'ar-studio',
      name: 'Studio AR',
      description: 'Créez des expériences en réalité augmentée',
      category: 'ar-vr',
      icon: '🥽',
      color: 'from-purple-600 to-pink-600',
      popularity: 87,
      link: '/tools/ar-studio'
    },
    {
      id: 'file-compressor',
      name: 'Compresseur de Fichiers',
      description: 'Réduisez la taille de vos fichiers intelligemment',
      category: 'productivity',
      icon: '📦',
      color: 'from-yellow-500 to-orange-500',
      popularity: 92,
      link: '/tools/file-compressor'
    },
    {
      id: 'color-palette',
      name: 'Générateur de Palettes',
      description: 'Créez des combinaisons de couleurs harmonieuses',
      category: 'design',
      icon: '🎨',
      color: 'from-pink-500 to-rose-500',
      popularity: 91,
      link: '/tools/color-palette'
    },
    {
      id: 'meme-generator',
      name: 'Créateur de Mèmes',
      description: 'Générez des mèmes viraux facilement',
      category: 'design',
      icon: '😂',
      color: 'from-yellow-400 to-amber-500',
      popularity: 93,
      link: '/tools/meme-generator'
    },
    {
      id: 'website-speed',
      name: 'Testeur de Vitesse',
      description: 'Analysez les performances de votre site',
      category: 'business',
      icon: '⚡',
      color: 'from-blue-600 to-indigo-600',
      popularity: 95,
      link: '/tools/website-speed'
    },
    {
      id: 'meal-planner',
      name: 'Planificateur de Repas IA',
      description: 'Plans de repas personnalisés et sains',
      category: 'ai',
      icon: '🍽️',
      color: 'from-green-500 to-lime-500',
      popularity: 88,
      link: '/tools/meal-planner'
    },
    {
      id: 'seo-checker',
      name: 'Vérificateur SEO',
      description: 'Optimisez votre référencement naturel',
      category: 'business',
      icon: '🔍',
      color: 'from-purple-500 to-indigo-500',
      popularity: 97,
      link: '/tools/seo-checker'
    },
    {
      id: 'travel-planner',
      name: 'Planificateur de Voyages',
      description: 'Itinéraires personnalisés avec l\'IA',
      category: 'ai',
      icon: '✈️',
      color: 'from-cyan-500 to-blue-500',
      popularity: 90,
      link: '/tools/travel-planner'
    },
    {
      id: 'presentation-creator',
      name: 'Créateur de Présentations',
      description: 'Présentations interactives modernes',
      category: 'productivity',
      icon: '📊',
      color: 'from-indigo-500 to-blue-500',
      popularity: 89,
      link: '/tools/presentation-creator'
    },
    {
      id: 'nft-studio',
      name: 'Studio NFT',
      description: 'Créez et mintez votre art numérique',
      category: 'design',
      icon: '🎭',
      color: 'from-purple-600 to-violet-600',
      popularity: 86,
      link: '/tools/nft-studio'
    },
    {
      id: 'investment-simulator',
      name: 'Simulateur d\'Investissements',
      description: 'Visualisez la croissance de vos investissements',
      category: 'business',
      icon: '💰',
      color: 'from-green-600 to-teal-600',
      popularity: 92,
      link: '/tools/investment-simulator'
    },
    {
      id: 'collaborative-editor',
      name: 'Éditeur Collaboratif',
      description: 'Travaillez à plusieurs en temps réel',
      category: 'productivity',
      icon: '👥',
      color: 'from-blue-500 to-purple-500',
      popularity: 88,
      link: '/tools/collaborative-editor'
    },
    {
      id: 'sentiment-analyzer',
      name: 'Analyseur de Sentiment',
      description: 'Surveillez la réputation de votre marque',
      category: 'business',
      icon: '💭',
      color: 'from-red-500 to-pink-500',
      popularity: 85,
      link: '/tools/sentiment-analyzer'
    },
    {
      id: 'vr-studio',
      name: 'Studio VR',
      description: 'Créez des expériences de réalité virtuelle',
      category: 'ar-vr',
      icon: '🎮',
      color: 'from-violet-600 to-indigo-600',
      popularity: 84,
      link: '/tools/vr-studio'
    },
    {
      id: 'story-generator',
      name: 'Générateur d\'Histoires',
      description: 'Créez des récits captivants avec l\'IA',
      category: 'ai',
      icon: '📚',
      color: 'from-amber-500 to-orange-500',
      popularity: 90,
      link: '/tools/story-generator'
    },
    {
      id: 'finance-tracker',
      name: 'Gestionnaire de Finances',
      description: 'Suivez et gérez vos finances personnelles',
      category: 'business',
      icon: '💳',
      color: 'from-emerald-500 to-green-500',
      popularity: 94,
      link: '/tools/finance-tracker'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous', icon: '🌟' },
    { id: 'ai', name: 'Intelligence Artificielle', icon: '🤖' },
    { id: 'design', name: 'Design & Créativité', icon: '🎨' },
    { id: 'productivity', name: 'Productivité', icon: '⚡' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'ar-vr', name: 'AR/VR', icon: '🥽' }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTools = tools
    .filter(tool => tool.popularity >= 93)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  return (
    <Layout>
      <Helmet>
        <title>BestoolsVerse - Suite d'outils IA gratuits pour booster votre productivité</title>
        <meta name="description" content="Plus de 20 outils IA gratuits : générateur QR code, éditeur d'images IA, convertisseur de fichiers, et plus. Boostez votre productivité avec BestoolsVerse." />
        <meta name="keywords" content="outils ia gratuits, générateur qr code, éditeur images ia, convertisseur fichiers, productivité, outils web" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Banner */}
        {showBanner && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles size={20} className="mr-2" />
                <p className="text-sm font-medium">
                  🎉 Nouveaux outils disponibles : Studio VR et Analyseur de Sentiment !
                </p>
              </div>
              <button
                onClick={dismissBanner}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center mt-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 bg-opacity-20 rounded-full text-blue-400 text-sm font-medium mb-6">
            <Zap size={16} className="mr-2" />
            20+ outils puissants et gratuits
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            L'univers des meilleurs
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> outils web</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Boostez votre productivité avec notre collection d'outils gratuits : 
            IA, design, business et plus encore. Tout ce dont vous avez besoin, en un seul endroit.
          </p>

          {/* Barre de recherche principale */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                trackEvent('search', 'query', e.target.value);
              }}
              placeholder="Rechercher un outil..."
              className="w-full pl-14 pr-4 py-4 bg-gray-800 bg-opacity-50 backdrop-blur-lg text-white rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
            />
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  trackEvent('filter', 'category', category.id);
                }}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Outils populaires */}
      {!searchTerm && selectedCategory === 'all' && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">🔥 Les plus populaires</h2>
                <p className="text-gray-400">Les outils préférés de nos utilisateurs</p>
              </div>
              <Star className="text-yellow-500" size={32} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tous les outils */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {searchTerm ? `Résultats pour "${searchTerm}"` : 'Tous nos outils'}
            </h2>
            <p className="text-gray-400">
              {filteredTools.length} outil{filteredTools.length > 1 ? 's' : ''} disponible{filteredTools.length > 1 ? 's' : ''}
            </p>
          </div>
          
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400 mb-4">Aucun outil trouvé</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à booster votre productivité ?
              </h2>
              <p className="text-xl text-white text-opacity-90 mb-8">
                Rejoignez des milliers d'utilisateurs qui utilisent nos outils chaque jour
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Découvrir nos offres
                <ArrowRight className="ml-2" size={20} />
              </a>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BestoolsVerse;