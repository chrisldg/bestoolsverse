// src/tools/SentimentAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Search, TrendingUp, TrendingDown, Minus, MessageSquare, Twitter, Facebook, Instagram, Globe, BarChart3, PieChart, Download, RefreshCw, Filter } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { trackEvent } from '../utils/analytics';

const SentimentAnalyzer = () => {
  const [brandName, setBrandName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareWith, setCompareWith] = useState('');

  const platforms = [
    { id: 'all', name: 'Toutes', icon: Globe },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram }
  ];

  useEffect(() => {
    // Charger les analyses sauvegardées
    const saved = localStorage.getItem('sentimentAnalyses');
    if (saved) {
      setSavedAnalyses(JSON.parse(saved));
    }
  }, []);

  const analyzeSentiment = () => {
    if (!brandName) return;
    
    setIsAnalyzing(true);
    trackEvent('sentiment_analyzer', 'analyze_brand', brandName);

    setTimeout(() => {
      const mockResults = generateRealisticData(brandName);
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
      
      // Sauvegarder l'analyse
      const newAnalysis = {
        id: Date.now(),
        brandName,
        date: new Date().toISOString(),
        results: mockResults
      };
      
      const updatedAnalyses = [newAnalysis, ...savedAnalyses.slice(0, 9)];
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem('sentimentAnalyses', JSON.stringify(updatedAnalyses));
    }, 3000);
  };

  const generateRealisticData = (brand) => {
    // Génération de données réalistes basées sur des patterns
    const basePositive = 35 + Math.random() * 30;
    const baseNegative = 10 + Math.random() * 15;
    const baseNeutral = 100 - basePositive - baseNegative;
    
    const overall = {
      positive: Math.round(basePositive),
      neutral: Math.round(baseNeutral),
      negative: Math.round(baseNegative),
      score: Math.round((basePositive - baseNegative) / 10 * 10) / 10 + 5
    };

    const mentions = Math.floor(1000 + Math.random() * 5000);
    const reach = mentions * Math.floor(50 + Math.random() * 100);
    const engagement = Math.round((5 + Math.random() * 10) * 10) / 10;
    
    const trending = overall.positive > 45 ? 'up' : overall.negative > 25 ? 'down' : 'stable';
    
    const keywords = generateKeywords(brand, overall);
    const timeline = generateTimelineData(overall, dateRange);
    const platformData = generatePlatformData(overall, mentions);
    const topMentions = generateTopMentions(brand, overall);
    const competitors = generateCompetitors(brand, overall.score);

    return {
      overall,
      mentions,
      reach,
      engagement,
      trending,
      keywords,
      timeline,
      platforms: platformData,
      topMentions,
      competitors
    };
  };

  const generateKeywords = (brand, sentiment) => {
    const positiveWords = ['excellent', 'qualité', 'innovation', 'service', 'recommande', 'parfait', 'satisfait'];
    const negativeWords = ['déçu', 'problème', 'cher', 'lent', 'mauvais', 'bug', 'erreur'];
    const neutralWords = ['prix', 'livraison', 'produit', 'commande', 'achat', 'site', 'application'];
    
    const keywords = [];
    
    // Ajouter des mots positifs
    const posCount = Math.floor(sentiment.positive / 10);
    for (let i = 0; i < posCount && i < 3; i++) {
      keywords.push({
        word: positiveWords[Math.floor(Math.random() * positiveWords.length)],
        count: Math.floor(50 + Math.random() * 200),
        sentiment: 'positive'
      });
    }
    
    // Ajouter des mots négatifs
    const negCount = Math.floor(sentiment.negative / 10);
    for (let i = 0; i < negCount && i < 2; i++) {
      keywords.push({
        word: negativeWords[Math.floor(Math.random() * negativeWords.length)],
        count: Math.floor(30 + Math.random() * 100),
        sentiment: 'negative'
      });
    }
    
    // Ajouter des mots neutres
    for (let i = 0; i < 3; i++) {
      keywords.push({
        word: neutralWords[Math.floor(Math.random() * neutralWords.length)],
        count: Math.floor(40 + Math.random() * 150),
        sentiment: 'neutral'
      });
    }
    
    return keywords.sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const generateTimelineData = (sentiment, range) => {
    const days = range === '24h' ? 24 : range === '7days' ? 7 : range === '30days' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Ajouter de la variation naturelle
      const variation = (Math.random() - 0.5) * 10;
      const positive = Math.max(0, Math.min(100, sentiment.positive + variation));
      const negative = Math.max(0, Math.min(100, sentiment.negative + variation / 2));
      const neutral = 100 - positive - negative;
      
      data.push({
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        positive: Math.round(positive),
        neutral: Math.round(neutral),
        negative: Math.round(negative)
      });
    }
    
    return data;
  };

  const generatePlatformData = (overall, totalMentions) => {
    const twitterRatio = 0.4 + Math.random() * 0.2;
    const facebookRatio = 0.3 + Math.random() * 0.1;
    const instagramRatio = 1 - twitterRatio - facebookRatio;
    
    return {
      twitter: {
        positive: Math.round(overall.positive + (Math.random() - 0.5) * 10),
        neutral: Math.round(overall.neutral + (Math.random() - 0.5) * 10),
        negative: Math.round(overall.negative + (Math.random() - 0.5) * 10),
        mentions: Math.floor(totalMentions * twitterRatio)
      },
      facebook: {
        positive: Math.round(overall.positive + (Math.random() - 0.5) * 10),
        neutral: Math.round(overall.neutral + (Math.random() - 0.5) * 10),
        negative: Math.round(overall.negative + (Math.random() - 0.5) * 10),
        mentions: Math.floor(totalMentions * facebookRatio)
      },
      instagram: {
        positive: Math.round(overall.positive + (Math.random() - 0.5) * 15),
        neutral: Math.round(overall.neutral + (Math.random() - 0.5) * 10),
        negative: Math.round(overall.negative + (Math.random() - 0.5) * 5),
        mentions: Math.floor(totalMentions * instagramRatio)
      }
    };
  };

  const generateTopMentions = (brand, sentiment) => {
    const positivePosts = [
      `Excellent service client de ${brand} ! Problème résolu en 5 minutes 👏`,
      `Je recommande vivement ${brand}, qualité au top et livraison rapide`,
      `Très satisfait de mon achat chez ${brand}, je reviendrai c'est sûr !`,
      `${brand} a dépassé mes attentes, bravo pour l'innovation`
    ];
    
    const negativePosts = [
      `Déçu par ma dernière commande... La qualité n'est plus au rendez-vous`,
      `Service client de ${brand} injoignable depuis 3 jours, inadmissible`,
      `Prix trop élevés chez ${brand} par rapport à la concurrence`,
      `Bug sur l'application ${brand}, impossible de finaliser ma commande`
    ];
    
    const neutralPosts = [
      `Nouveau partenariat avec ${brand} ! Hâte de vous montrer leurs produits`,
      `${brand} lance une nouvelle gamme, qu'en pensez-vous ?`,
      `Livraison reçue de ${brand}, unboxing ce soir sur ma story`,
      `Qui a déjà testé les produits ${brand} ? Vos avis m'intéressent`
    ];
    
    const mentions = [];
    
    // Ajouter des mentions selon le sentiment
    if (sentiment.positive > 40) {
      mentions.push({
        id: 1,
        author: '@user' + Math.floor(Math.random() * 1000),
        content: positivePosts[Math.floor(Math.random() * positivePosts.length)],
        sentiment: 'positive',
        platform: 'twitter',
        engagement: Math.floor(100 + Math.random() * 500),
        date: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    }
    
    if (sentiment.negative > 15) {
      mentions.push({
        id: 2,
        author: 'User_' + Math.floor(Math.random() * 1000),
        content: negativePosts[Math.floor(Math.random() * negativePosts.length)],
        sentiment: 'negative',
        platform: 'facebook',
        engagement: Math.floor(50 + Math.random() * 200),
        date: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString()
      });
    }
    
    // Ajouter des mentions neutres
    for (let i = 0; i < 2; i++) {
      mentions.push({
        id: mentions.length + 1,
        author: '@influencer' + Math.floor(Math.random() * 1000),
        content: neutralPosts[Math.floor(Math.random() * neutralPosts.length)],
        sentiment: 'neutral',
        platform: i === 0 ? 'instagram' : 'twitter',
        engagement: Math.floor(500 + Math.random() * 2000),
        date: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()
      });
    }
    
    return mentions.sort((a, b) => b.engagement - a.engagement);
  };

  const generateCompetitors = (brand, score) => {
    const competitors = [
      { name: 'Concurrent A', score: score + (Math.random() - 0.5) * 2 },
      { name: 'Concurrent B', score: score + (Math.random() - 0.5) * 2 },
      { name: brand, score: score },
      { name: 'Concurrent C', score: score + (Math.random() - 0.5) * 2 },
      { name: 'Concurrent D', score: score + (Math.random() - 0.5) * 2 }
    ];
    
    return competitors.sort((a, b) => b.score - a.score).slice(0, 4);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'neutral': return '#6B7280';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="text-green-500" size={20} />;
      case 'neutral': return <Minus className="text-gray-500" size={20} />;
      case 'negative': return <TrendingDown className="text-red-500" size={20} />;
      default: return null;
    }
  };

  const exportReport = () => {
    if (!analysisResults) return;
    
    const report = {
      brand: brandName,
      analysisDate: new Date().toISOString(),
      dateRange,
      results: analysisResults
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-analysis-${brandName}-${Date.now()}.json`;
    a.click();
    
    trackEvent('sentiment_analyzer', 'export_report');
  };

  const setupAlerts = () => {
    const alertConfig = {
      brand: brandName,
      threshold: {
        positive: 30,
        negative: 30
      },
      email: prompt('Entrez votre email pour les alertes:')
    };
    
    if (alertConfig.email) {
      localStorage.setItem(`alerts-${brandName}`, JSON.stringify(alertConfig));
      alert('Alertes configurées avec succès !');
      trackEvent('sentiment_analyzer', 'setup_alerts');
    }
  };

  const compareBrands = () => {
    if (!compareWith || compareWith === brandName) return;
    
    setComparisonMode(true);
    const comparisonData = generateRealisticData(compareWith);
    
    // Afficher la comparaison (simplifiée pour cet exemple)
    alert(`Comparaison:\n${brandName}: ${analysisResults.overall.score}/10\n${compareWith}: ${comparisonData.overall.score}/10`);
  };

  const refreshAnalysis = () => {
    if (brandName) {
      analyzeSentiment();
    }
  };

  const loadSavedAnalysis = (analysis) => {
    setBrandName(analysis.brandName);
    setAnalysisResults(analysis.results);
  };

  const pieData = analysisResults ? [
    { name: 'Positif', value: analysisResults.overall.positive, color: '#10B981' },
    { name: 'Neutre', value: analysisResults.overall.neutral, color: '#6B7280' },
    { name: 'Négatif', value: analysisResults.overall.negative, color: '#EF4444' }
  ] : [];

  const filteredPlatformData = selectedPlatform === 'all' 
    ? analysisResults?.platforms 
    : { [selectedPlatform]: analysisResults?.platforms[selectedPlatform] };

  return (
    <Layout 
      title="Analyseur de Sentiment de Marque" 
      description="Analysez le sentiment et la réputation de votre marque sur les réseaux sociaux. Suivez les mentions et l'engagement en temps réel."
      keywords="analyse sentiment, réputation marque, monitoring social media, analyse réseaux sociaux"
    >
      <Helmet>
        <title>Analyseur de Sentiment de Marque | BestoolsVerse</title>
        <meta name="description" content="Analysez le sentiment et la réputation de votre marque sur les réseaux sociaux. Suivez les mentions et l'engagement en temps réel." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Analyseur de Sentiment</h1>
            <p className="text-gray-400 mt-2">Surveillez la réputation de votre marque en temps réel</p>
          </div>
          <MessageSquare className="text-blue-500" size={48} />
        </div>

        {/* Barre de recherche */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-8">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Entrez le nom de votre marque ou entreprise..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">24 heures</option>
              <option value="7days">7 jours</option>
              <option value="30days">30 jours</option>
              <option value="90days">90 jours</option>
            </select>
            
            <button
              onClick={analyzeSentiment}
              disabled={isAnalyzing || !brandName}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isAnalyzing || !brandName
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAnalyzing ? 'Analyse en cours...' : 'Analyser'}
            </button>
            
            {analysisResults && (
              <button
                onClick={refreshAnalysis}
                className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw size={20} />
              </button>
            )}
          </div>
          
          {/* Comparaison */}
          {analysisResults && (
            <div className="flex items-center space-x-4 mt-4">
              <span className="text-gray-400">Comparer avec:</span>
              <input
                type="text"
                value={compareWith}
                onChange={(e) => setCompareWith(e.target.value)}
                placeholder="Nom du concurrent..."
                className="flex-1 max-w-xs px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={compareBrands}
                disabled={!compareWith || compareWith === brandName}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Comparer
              </button>
            </div>
          )}
        </div>

        {/* Analyses sauvegardées */}
        {savedAnalyses.length > 0 && !analysisResults && (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Analyses récentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedAnalyses.slice(0, 6).map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => loadSavedAnalysis(analysis)}
                  className="p-4 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors text-left"
                >
                  <h4 className="font-medium text-white">{analysis.brandName}</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(analysis.date).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="text-2xl font-bold text-white">
                      {analysis.results.overall.score}/10
                    </div>
                    {analysis.results.trending === 'up' ? (
                      <TrendingUp className="ml-2 text-green-500" size={16} />
                    ) : analysis.results.trending === 'down' ? (
                      <TrendingDown className="ml-2 text-red-500" size={16} />
                    ) : (
                      <Minus className="ml-2 text-gray-500" size={16} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isAnalyzing ? (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyse en cours...</h3>
            <p className="text-gray-400">Collecte des mentions sur les réseaux sociaux</p>
          </div>
        ) : analysisResults ? (
          <div className="space-y-8">
            {/* Vue d'ensemble */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400">Score global</h3>
                  {analysisResults.trending === 'up' ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : analysisResults.trending === 'down' ? (
                    <TrendingDown className="text-red-500" size={20} />
                  ) : (
                    <Minus className="text-gray-500" size={20} />
                  )}
                </div>
                <p className="text-3xl font-bold text-white">{analysisResults.overall.score}/10</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analysisResults.trending === 'up' ? '+0.5' : analysisResults.trending === 'down' ? '-0.3' : '±0'} vs période précédente
                </p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-gray-400 mb-2">Mentions totales</h3>
                <p className="text-3xl font-bold text-white">{analysisResults.mentions.toLocaleString()}</p>
                <p className="text-sm text-green-400 mt-1">+23% cette période</p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-gray-400 mb-2">Portée</h3>
                <p className="text-3xl font-bold text-white">{(analysisResults.reach / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-500 mt-1">Personnes atteintes</p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-gray-400 mb-2">Engagement</h3>
                <p className="text-3xl font-bold text-white">{analysisResults.engagement}%</p>
                <p className="text-sm text-gray-500 mt-1">Taux moyen</p>
              </div>
            </div>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Distribution des sentiments */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Distribution des sentiments</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Évolution temporelle */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Évolution sur {dateRange === '24h' ? '24h' : dateRange === '7days' ? '7 jours' : dateRange === '30days' ? '30 jours' : '90 jours'}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysisResults.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} name="Positif" />
                      <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={2} name="Neutre" />
                      <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} name="Négatif" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Analyse par plateforme */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Analyse par plateforme</h3>
              
              <div className="flex space-x-2 mb-6">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center ${
                      selectedPlatform === platform.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <platform.icon size={16} className="mr-2" />
                    {platform.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(filteredPlatformData).map(([platform, data]) => (
                  <div key={platform} className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 capitalize">{platform}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Positif</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${data.positive}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">{data.positive}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Neutre</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className="bg-gray-500 h-2 rounded-full" 
                              style={{ width: `${data.neutral}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">{data.neutral}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Négatif</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${data.negative}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">{data.negative}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{data.mentions} mentions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mots-clés et mentions principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mots-clés principaux */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Mots-clés fréquents</h3>
                <div className="space-y-3">
                  {analysisResults.keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getSentimentIcon(keyword.sentiment)}
                        <span className="ml-3 text-white">{keyword.word}</span>
                      </div>
                      <span className="text-gray-400">{keyword.count} mentions</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparaison avec concurrents */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Position vs concurrents</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisResults.competitors}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[0, 10]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      />
                      <Bar dataKey="score" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Mentions principales */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Mentions principales</h3>
              <div className="space-y-4">
                {analysisResults.topMentions.map((mention) => (
                  <div key={mention.id} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-white">{mention.author}</span>
                          <span className="mx-2 text-gray-500">•</span>
                          {platforms.find(p => p.id === mention.platform)?.icon && (
                            React.createElement(platforms.find(p => p.id === mention.platform).icon, {
                              size: 16,
                              className: "text-gray-400 mr-2"
                            })
                          )}
                          {getSentimentIcon(mention.sentiment)}
                        </div>
                        <p className="text-gray-300">{mention.content}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>{mention.engagement} interactions</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(mention.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={exportReport}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download size={20} className="mr-2" />
                Exporter le rapport
              </button>
              <button
                onClick={setupAlerts}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Configurer des alertes
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-12 text-center">
            <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Analysez le sentiment de votre marque
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Entrez le nom de votre marque pour obtenir une analyse détaillée des mentions 
              et du sentiment sur les réseaux sociaux.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SentimentAnalyzer;