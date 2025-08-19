import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import { ChevronLeft, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Download, RefreshCw, Calendar, Filter, Search, Globe, Hash, Users, MessageCircle, Eye, Share2, AlertCircle } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { trackEvent } from '../utils/analytics';

const TrendAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendData, setTrendData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [savedReports, setSavedReports] = useState([]);

  const platforms = [
    { id: 'all', name: 'Toutes les plateformes', icon: '🌐' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '📹' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' }
  ];

  const dateRanges = [
    { id: '24hours', name: 'Dernières 24h' },
    { id: '7days', name: '7 derniers jours' },
    { id: '30days', name: '30 derniers jours' },
    { id: '3months', name: '3 derniers mois' },
    { id: '1year', name: 'Dernière année' }
  ];

  useEffect(() => {
    // Charger les rapports sauvegardés
    const saved = localStorage.getItem('savedTrendReports');
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
    
    // Générer des données initiales
    generateTrendData();
  }, []);

  useEffect(() => {
    if (selectedPlatform || dateRange) {
      generateTrendData();
    }
  }, [selectedPlatform, dateRange]);

  const generateTrendData = () => {
    setIsLoading(true);
    trackEvent('trend_analyzer', 'generate_data', `${selectedPlatform}_${dateRange}`);

    setTimeout(() => {
      const data = {
        overview: generateOverviewData(),
        trends: generateTrendsData(),
        demographics: generateDemographicsData(),
        engagement: generateEngagementData(),
        predictions: generatePredictionsData(),
        competitors: generateCompetitorsData()
      };
      
      setTrendData(data);
      setIsLoading(false);
    }, 2000);
  };

  const generateOverviewData = () => {
    const platforms = ['Twitter', 'Instagram', 'TikTok', 'YouTube'];
    const metrics = [];
    
    platforms.forEach(platform => {
      const baseValue = Math.floor(Math.random() * 100000) + 50000;
      metrics.push({
        platform,
        followers: baseValue,
        growth: (Math.random() * 20 - 5).toFixed(1),
        engagement: (Math.random() * 10).toFixed(1),
        reach: baseValue * (Math.random() * 10 + 5)
      });
    });
    
    return {
      totalReach: metrics.reduce((sum, m) => sum + m.reach, 0),
      avgEngagement: (metrics.reduce((sum, m) => sum + parseFloat(m.engagement), 0) / metrics.length).toFixed(1),
      bestPlatform: metrics.reduce((best, m) => parseFloat(m.engagement) > parseFloat(best.engagement) ? m : best).platform,
      metrics
    };
  };

  const generateTrendsData = () => {
    const trends = [
      { name: '#AIRevolution', volume: 125000, change: 45.2, sentiment: 'positive' },
      { name: '#ClimateAction', volume: 98000, change: 23.5, sentiment: 'positive' },
      { name: '#TechLayoffs', volume: 87000, change: -12.3, sentiment: 'negative' },
      { name: '#NewMusic2025', volume: 76000, change: 67.8, sentiment: 'positive' },
      { name: '#HealthyLiving', volume: 65000, change: 15.4, sentiment: 'positive' },
      { name: '#CryptoNews', volume: 54000, change: -23.6, sentiment: 'mixed' },
      { name: '#MovieReview', volume: 43000, change: 8.9, sentiment: 'positive' },
      { name: '#FoodieLife', volume: 38000, change: 12.1, sentiment: 'positive' }
    ];

    // Générer l'historique pour chaque tendance
    trends.forEach(trend => {
      trend.history = generateTimeSeriesData(7);
      trend.platforms = {
        twitter: Math.floor(trend.volume * (Math.random() * 0.3 + 0.2)),
        instagram: Math.floor(trend.volume * (Math.random() * 0.3 + 0.1)),
        tiktok: Math.floor(trend.volume * (Math.random() * 0.3 + 0.3)),
        youtube: Math.floor(trend.volume * (Math.random() * 0.2 + 0.1))
      };
    });

    // Ajouter des variations réalistes basées sur l'heure
    const currentHour = new Date().getHours();
    const peakHours = [9, 12, 18, 21]; // Heures de pointe
    const isPeakHour = peakHours.includes(currentHour);

    trends.forEach(trend => {
      if (isPeakHour) {
        trend.volume = Math.floor(trend.volume * 1.3);
        trend.change = trend.change * 1.2;
      }
    });

    return trends;
  };

  const generateTimeSeriesData = (days) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        value: Math.floor(Math.random() * 10000) + 5000,
        engagement: (Math.random() * 10).toFixed(1)
      });
    }
    
    return data;
  };

  const generateDemographicsData = () => {
    return {
      age: [
        { range: '13-17', value: 12 },
        { range: '18-24', value: 28 },
        { range: '25-34', value: 35 },
        { range: '35-44', value: 15 },
        { range: '45+', value: 10 }
      ],
      gender: [
        { name: 'Femmes', value: 52 },
        { name: 'Hommes', value: 45 },
        { name: 'Autres', value: 3 }
      ],
      location: [
        { country: 'France', value: 45 },
        { country: 'USA', value: 20 },
        { country: 'UK', value: 10 },
        { country: 'Canada', value: 8 },
        { country: 'Autres', value: 17 }
      ],
      devices: [
        { type: 'Mobile', value: 68 },
        { type: 'Desktop', value: 25 },
        { type: 'Tablet', value: 7 }
      ]
    };
  };

  const generateEngagementData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return {
      byDay: days.map(day => ({
        day,
        likes: Math.floor(Math.random() * 5000) + 2000,
        comments: Math.floor(Math.random() * 1000) + 500,
        shares: Math.floor(Math.random() * 500) + 200,
        total: Math.floor(Math.random() * 7000) + 3000
      })),
      byHour: hours.map(hour => ({
        hour: `${hour}h`,
        activity: Math.floor(Math.random() * 100) + 20
      })),
      topPosts: [
        { id: 1, content: 'Post sur l\'IA', likes: 12500, comments: 890, shares: 2100 },
        { id: 2, content: 'Tutoriel Tech', likes: 9800, comments: 567, shares: 1800 },
        { id: 3, content: 'Actualité du jour', likes: 7600, comments: 432, shares: 1200 }
      ]
    };
  };

  const generatePredictionsData = () => {
    const futureMonths = ['Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    
    return {
      growth: futureMonths.map(month => ({
        month,
        optimistic: Math.floor(Math.random() * 20000) + 80000,
        realistic: Math.floor(Math.random() * 15000) + 70000,
        pessimistic: Math.floor(Math.random() * 10000) + 60000
      })),
      emergingTopics: [
        { topic: 'Intelligence Artificielle Générative', probability: 85 },
        { topic: 'Métavers et Réalité Virtuelle', probability: 72 },
        { topic: 'Durabilité et Tech Verte', probability: 68 },
        { topic: 'Cybersécurité', probability: 64 },
        { topic: 'Blockchain et Web3', probability: 58 }
      ],
      recommendations: [
        'Augmenter la fréquence de publication le mardi et jeudi',
        'Créer plus de contenu vidéo pour TikTok et YouTube',
        'Utiliser davantage de hashtags liés à l\'IA',
        'Engager avec la communauté entre 18h et 21h'
      ]
    };
  };

  const generateCompetitorsData = () => {
    const competitors = ['Concurrent A', 'Concurrent B', 'Concurrent C', 'Vous'];
    
    return {
      comparison: competitors.map(name => ({
        name,
        followers: Math.floor(Math.random() * 100000) + 50000,
        engagement: (Math.random() * 10).toFixed(1),
        growth: (Math.random() * 30 - 10).toFixed(1),
        posts: Math.floor(Math.random() * 50) + 20
      })),
      strategies: [
        { competitor: 'Concurrent A', strategy: 'Focus sur le contenu vidéo court', effectiveness: 85 },
        { competitor: 'Concurrent B', strategy: 'Partenariats influenceurs', effectiveness: 78 },
        { competitor: 'Concurrent C', strategy: 'Contenu éducatif long', effectiveness: 72 }
      ]
    };
  };

  const searchTrends = () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    trackEvent('trend_analyzer', 'search', searchQuery);
    
    setTimeout(() => {
      // Simuler une recherche
      const results = trendData.trends.filter(trend => 
        trend.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (results.length > 0) {
        setSelectedTrend(results[0]);
      } else {
        alert('Aucune tendance trouvée pour cette recherche');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const exportReport = (format = 'pdf') => {
    const reportData = {
      date: new Date().toISOString(),
      platform: selectedPlatform,
      dateRange,
      data: trendData
    };
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trend-report-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(`Export ${format.toUpperCase()} en cours de développement`);
    }
    
    trackEvent('trend_analyzer', 'export_report', format);
  };

  const saveReport = () => {
    const name = prompt('Nom du rapport :');
    if (!name) return;
    
    const newReport = {
      id: Date.now(),
      name,
      date: new Date().toISOString(),
      platform: selectedPlatform,
      dateRange,
      data: trendData
    };
    
    const newSaved = [...savedReports, newReport];
    setSavedReports(newSaved);
    localStorage.setItem('savedTrendReports', JSON.stringify(newSaved));
    
    alert('Rapport sauvegardé avec succès !');
    trackEvent('trend_analyzer', 'save_report', name);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  return (
    <Layout 
      title="Analyseur de Tendances" 
      description="Analysez les tendances des réseaux sociaux et optimisez votre stratégie digitale"
      keywords="analyse tendances, social media analytics, trend analysis"
    >
      <Helmet>
        <title>Analyseur de Tendances | BestoolsVerse</title>
        <meta name="description" content="Analysez les tendances des réseaux sociaux et optimisez votre stratégie digitale" />
    </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => window.history.back()}
            className="mb-6 flex items-center text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} className="mr-2" />
            Retour aux outils
          </button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">Trend Analyzer 📊</h1>
            <p className="text-xl text-gray-200">Analysez les tendances et optimisez votre stratégie sociale</p>
          </div>

          {/* Contrôles principaux */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-white mb-2">Plateforme</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white"
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id} className="bg-gray-800">
                      {platform.icon} {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Période</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white"
                >
                  {dateRanges.map(range => (
                    <option key={range.id} value={range.id} className="bg-gray-800">
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Rechercher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchTrends()}
                    className="flex-1 px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300"
                    placeholder="Hashtag, mot-clé..."
                  />
                  <button
                    onClick={searchTrends}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => generateTrendData()}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <RefreshCw size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                <button
                  onClick={saveReport}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title="Sauvegarder le rapport"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'overview', name: 'Vue d\'ensemble', icon: <BarChart3 size={18} /> },
              { id: 'trends', name: 'Tendances', icon: <TrendingUp size={18} /> },
              { id: 'demographics', name: 'Démographie', icon: <Users size={18} /> },
              { id: 'engagement', name: 'Engagement', icon: <MessageCircle size={18} /> },
              { id: 'predictions', name: 'Prédictions', icon: <LineChart size={18} /> },
              { id: 'competitors', name: 'Concurrents', icon: <Eye size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-900'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Contenu principal */}
          {isLoading ? (
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-12 border border-white border-opacity-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Analyse des données en cours...</p>
              </div>
            </div>
          ) : trendData && (
            <>
              {/* Vue d'ensemble */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPIs */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                      <div className="text-gray-300 mb-2">Portée totale</div>
                      <div className="text-3xl font-bold text-white">
                        {(trendData.overview.totalReach / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-green-400 mt-2">+12.5% vs période précédente</div>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                      <div className="text-gray-300 mb-2">Engagement moyen</div>
                      <div className="text-3xl font-bold text-white">{trendData.overview.avgEngagement}%</div>
                      <div className="text-sm text-green-400 mt-2">+2.3% vs période précédente</div>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                      <div className="text-gray-300 mb-2">Meilleure plateforme</div>
                      <div className="text-3xl font-bold text-white">{trendData.overview.bestPlatform}</div>
                      <div className="text-sm text-gray-400 mt-2">Engagement le plus élevé</div>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                      <div className="text-gray-300 mb-2">Tendance globale</div>
                      <div className="flex items-center">
                        <TrendingUp size={32} className="text-green-400 mr-2" />
                        <span className="text-2xl font-bold text-white">+18.7%</span>
                      </div>
                    </div>
                  </div>

                  {/* Graphiques par plateforme */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Performance par plateforme</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trendData.overview.metrics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="platform" stroke="white" />
                        <YAxis stroke="white" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)' 
                          }} 
                        />
                        <Bar dataKey="followers" fill="#8884d8" name="Abonnés" />
                        <Bar dataKey="reach" fill="#82ca9d" name="Portée" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tendances */}
              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Tendances actuelles</h3>
                    <div className="space-y-3">
                      {trendData.trends.map((trend, index) => (
                        <div
                          key={index}
                          className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all cursor-pointer"
                          onClick={() => setSelectedTrend(trend)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Hash size={20} className="text-gray-400" />
                              <div>
                                <div className="font-semibold text-white">{trend.name}</div>
                                <div className="text-sm text-gray-300">{trend.volume.toLocaleString()} mentions</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className={`flex items-center ${trend.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trend.change > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                <span className="ml-1">{Math.abs(trend.change)}%</span>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs ${
                                trend.sentiment === 'positive' ? 'bg-green-600' :
                                trend.sentiment === 'negative' ? 'bg-red-600' : 'bg-yellow-600'
                              } bg-opacity-50`}>
                                {trend.sentiment}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Détails de la tendance sélectionnée */}
                  {selectedTrend && (
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Analyse détaillée : {selectedTrend.name}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-gray-300 mb-3">Évolution sur 7 jours</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={selectedTrend.history}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="date" stroke="white" />
                              <YAxis stroke="white" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(0,0,0,0.8)', 
                                  border: '1px solid rgba(255,255,255,0.2)' 
                                }} 
                              />
                              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h4 className="text-gray-300 mb-3">Répartition par plateforme</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={Object.entries(selectedTrend.platforms).map(([platform, value]) => ({
                                  name: platform,
                                  value
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {Object.entries(selectedTrend.platforms).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Démographie */}
              {activeTab === 'demographics' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Âge */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Répartition par âge</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={trendData.demographics.age}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="range" stroke="white" />
                        <YAxis stroke="white" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)' 
                          }} 
                        />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Genre */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Répartition par genre</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={trendData.demographics.gender}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {trendData.demographics.gender.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Localisation */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Top pays</h3>
                    <div className="space-y-3">
                      {trendData.demographics.location.map((loc, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Globe size={16} className="text-gray-400 mr-2" />
                            <span className="text-white">{loc.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-white bg-opacity-20 rounded-full h-2">
                              <div 
                                className="bg-blue-400 h-full rounded-full"
                                style={{ width: `${loc.value}%` }}
                              />
                            </div>
                            <span className="text-gray-300 text-sm w-12 text-right">{loc.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Appareils */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Appareils utilisés</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={trendData.demographics.devices}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {trendData.demographics.devices.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Engagement */}
              {activeTab === 'engagement' && (
                <div className="space-y-6">
                  {/* Engagement par jour */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Engagement par jour de la semaine</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trendData.engagement.byDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="white" />
                        <YAxis stroke="white" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)' 
                          }} 
                        />
                        <Area type="monotone" dataKey="likes" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="comments" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                        <Area type="monotone" dataKey="shares" stackId="1" stroke="#ffc658" fill="#ffc658" />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Heatmap des heures */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Activité par heure</h3>
                    <div className="grid grid-cols-24 gap-1">
                      {trendData.engagement.byHour.map((hour, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: `rgba(139, 92, 246, ${hour.activity / 100})`,
                            color: hour.activity > 50 ? 'white' : 'rgba(255,255,255,0.5)'
                          }}
                          title={`${hour.hour}: ${hour.activity}% d'activité`}
                        >
                          {index}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-300 mt-2">
                      Les heures avec le plus d'engagement sont en violet foncé
                    </div>
                  </div>

                  {/* Top posts */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Posts les plus performants</h3>
                    <div className="space-y-3">
                      {trendData.engagement.topPosts.map(post => (
                        <div key={post.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                          <div className="font-medium text-white mb-2">{post.content}</div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-300">❤️ {post.likes.toLocaleString()}</span>
                            <span className="text-gray-300">💬 {post.comments.toLocaleString()}</span>
                            <span className="text-gray-300">🔄 {post.shares.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Prédictions */}
              {activeTab === 'predictions' && (
                <div className="space-y-6">
                  {/* Prévisions de croissance */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Prévisions de croissance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData.predictions.growth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="white" />
                        <YAxis stroke="white" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)' 
                          }} 
                        />
                        <Line type="monotone" dataKey="optimistic" stroke="#82ca9d" strokeWidth={2} name="Optimiste" />
                        <Line type="monotone" dataKey="realistic" stroke="#8884d8" strokeWidth={2} name="Réaliste" />
                        <Line type="monotone" dataKey="pessimistic" stroke="#ff7c7c" strokeWidth={2} name="Pessimiste" />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Sujets émergents */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Sujets émergents</h3>
                    <div className="space-y-3">
                      {trendData.predictions.emergingTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-white">{topic.topic}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-white bg-opacity-20 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full"
                                style={{ width: `${topic.probability}%` }}
                              />
                            </div>
                            <span className="text-gray-300 text-sm w-12 text-right">{topic.probability}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommandations */}
                  <div className="bg-blue-600 bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-blue-600 border-opacity-30">
                    <div className="flex items-center mb-4">
                      <AlertCircle size={24} className="text-blue-400 mr-2" />
                      <h3 className="text-xl font-bold text-white">Recommandations stratégiques</h3>
                    </div>
                    <ul className="space-y-2">
                      {trendData.predictions.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          <span className="text-white">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Concurrents */}
              {activeTab === 'competitors' && (
                <div className="space-y-6">
                  {/* Comparaison */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Analyse concurrentielle</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={trendData.competitors.comparison}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey="name" stroke="white" />
                        <PolarRadiusAxis stroke="white" />
                        <Radar name="Followers" dataKey="followers" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tableau comparatif */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Métriques détaillées</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left py-2 px-4 text-gray-300">Compte</th>
                            <th className="text-right py-2 px-4 text-gray-300">Abonnés</th>
                            <th className="text-right py-2 px-4 text-gray-300">Engagement</th>
                            <th className="text-right py-2 px-4 text-gray-300">Croissance</th>
                            <th className="text-right py-2 px-4 text-gray-300">Posts/mois</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trendData.competitors.comparison.map((comp, index) => (
                            <tr key={index} className={`border-b border-gray-700 ${comp.name === 'Vous' ? 'bg-white bg-opacity-10' : ''}`}>
                              <td className="py-3 px-4 text-white font-medium">{comp.name}</td>
                              <td className="py-3 px-4 text-white text-right">{comp.followers.toLocaleString()}</td>
                              <td className="py-3 px-4 text-white text-right">{comp.engagement}%</td>
                              <td className={`py-3 px-4 text-right ${parseFloat(comp.growth) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {comp.growth}%
                              </td>
                              <td className="py-3 px-4 text-white text-right">{comp.posts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Stratégies des concurrents */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-bold text-white mb-4">Stratégies efficaces des concurrents</h3>
                    <div className="space-y-3">
                      {trendData.competitors.strategies.map((strat, index) => (
                        <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{strat.competitor}</h4>
                            <span className="text-sm text-gray-300">Efficacité: {strat.effectiveness}%</span>
                          </div>
                          <p className="text-gray-300">{strat.strategy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Boutons d'export */}
          {trendData && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => exportReport('pdf')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Download size={20} className="mr-2" />
                Exporter PDF
              </button>
              <button
                onClick={() => exportReport('json')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download size={20} className="mr-2" />
                Exporter JSON
              </button>
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Rapport de tendances',
                        text: `Analyse des tendances pour ${selectedPlatform} - ${dateRange}`,
                        url: window.location.href
                      });
                    } catch (err) {
                      console.log('Erreur de partage:', err);
                    }
                  } else {
                    alert('Le partage n\'est pas supporté sur ce navigateur');
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Share2 size={20} className="mr-2" />
                Partager
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrendAnalyzer;