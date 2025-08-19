import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import { ChevronLeft, Sparkles, Copy, Download, RefreshCw, Save, Trash2, Edit3, Hash, Image, Video, FileText, Mic, Calendar, Clock, Target, Zap, TrendingUp, Users, Heart, MessageCircle, Share2, Eye, X } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const ContentGenerator = () => {
  const [contentType, setContentType] = useState('post');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('professionnel');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [savedContent, setSavedContent] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [contentVariations, setContentVariations] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contentCalendar, setContentCalendar] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');

  const contentTypes = [
    { id: 'post', name: 'Post', icon: <FileText size={20} />, description: 'Post pour réseaux sociaux' },
    { id: 'caption', name: 'Caption', icon: <Hash size={20} />, description: 'Légende Instagram' },
    { id: 'story', name: 'Story', icon: <Image size={20} />, description: 'Story ou Reel' },
    { id: 'video', name: 'Script vidéo', icon: <Video size={20} />, description: 'Script pour vidéo' },
    { id: 'blog', name: 'Article blog', icon: <FileText size={20} />, description: 'Article de blog' },
    { id: 'newsletter', name: 'Newsletter', icon: <Mic size={20} />, description: 'Email newsletter' }
  ];

  const platforms = [
    { id: 'instagram', name: 'Instagram', maxLength: 2200, hashtags: 30 },
    { id: 'twitter', name: 'Twitter/X', maxLength: 280, hashtags: 5 },
    { id: 'linkedin', name: 'LinkedIn', maxLength: 3000, hashtags: 5 },
    { id: 'facebook', name: 'Facebook', maxLength: 63206, hashtags: 10 },
    { id: 'tiktok', name: 'TikTok', maxLength: 150, hashtags: 10 },
    { id: 'youtube', name: 'YouTube', maxLength: 5000, hashtags: 15 }
  ];

  const tones = [
    { id: 'professionnel', name: 'Professionnel', emoji: '👔' },
    { id: 'amical', name: 'Amical', emoji: '😊' },
    { id: 'humoristique', name: 'Humoristique', emoji: '😂' },
    { id: 'inspirant', name: 'Inspirant', emoji: '✨' },
    { id: 'educatif', name: 'Éducatif', emoji: '📚' },
    { id: 'urgent', name: 'Urgent', emoji: '🚨' },
    { id: 'storytelling', name: 'Storytelling', emoji: '📖' },
    { id: 'promotionnel', name: 'Promotionnel', emoji: '🎯' }
  ];

  const contentTemplates = [
    {
      id: 'problem-solution',
      name: 'Problème-Solution',
      structure: '🤔 [Problème]\n\n💡 [Solution]\n\n✅ [Bénéfices]\n\n👉 [Call to action]'
    },
    {
      id: 'before-after',
      name: 'Avant-Après',
      structure: '❌ Avant : [Situation initiale]\n\n✅ Après : [Transformation]\n\n🎯 [Comment y arriver]'
    },
    {
      id: 'tips-list',
      name: 'Liste de conseils',
      structure: '📌 [Titre accrocheur]\n\n1️⃣ [Conseil 1]\n2️⃣ [Conseil 2]\n3️⃣ [Conseil 3]\n\n💬 [Question engagement]'
    },
    {
      id: 'storytelling',
      name: 'Storytelling',
      structure: '📖 [Hook]\n\n🎬 [Contexte]\n\n⚡ [Conflit/Défi]\n\n🎯 [Résolution]\n\n💡 [Leçon/Morale]'
    }
  ];

  useEffect(() => {
    // Charger le contenu sauvegardé
    const saved = localStorage.getItem('savedContent');
    if (saved) {
      setSavedContent(JSON.parse(saved));
    }
    
    // Charger le calendrier
    const calendar = localStorage.getItem('contentCalendar');
    if (calendar) {
      setContentCalendar(JSON.parse(calendar));
    }
  }, []);

  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const generateContent = () => {
    if (!topic) {
      alert('Veuillez entrer un sujet');
      return;
    }
    
    setIsGenerating(true);
    trackEvent('content_generator', 'generate', `${contentType}_${platform}`);
    
    setTimeout(() => {
      const content = generateContentByType();
      setGeneratedContent(content);
      
      // Générer des variations
      const variations = generateVariations(content);
      setContentVariations(variations);
      
      setIsGenerating(false);
    }, 2500);
  };

  const generateContentByType = () => {
    const platformConfig = platforms.find(p => p.id === platform);
    const toneConfig = tones.find(t => t.id === tone);
    
    let content = '';
    
    switch (contentType) {
      case 'post':
        content = generatePost();
        break;
      case 'caption':
        content = generateCaption();
        break;
      case 'story':
        content = generateStory();
        break;
      case 'video':
        content = generateVideoScript();
        break;
      case 'blog':
        content = generateBlogArticle();
        break;
      case 'newsletter':
        content = generateNewsletter();
        break;
      default:
        content = generatePost();
    }
    
    // Ajouter des hashtags si applicable
    if (platform !== 'blog' && platform !== 'newsletter') {
      content += '\n\n' + generateHashtags(platformConfig.hashtags);
    }
    
    return content;
  };

  const generatePost = () => {
    const hooks = [
      `Saviez-vous que ${topic} peut transformer votre quotidien ?`,
      `${topic} : La méthode qui fait toute la différence`,
      `J'ai testé ${topic} pendant 30 jours, voici ce qui s'est passé...`,
      `Comment ${topic} m'a aidé à atteindre mes objectifs`,
      `La vérité sur ${topic} que personne ne vous dit`
    ];
    
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    
    const bodies = [
      `\n\nAprès des années d'expérience, j'ai découvert que ${topic} est bien plus qu'une simple tendance.\n\n✨ Les 3 points clés :\n• Amélioration significative de la productivité\n• Résultats visibles en quelques semaines\n• Applicable dans tous les domaines\n\nLe plus important ? La constance et la méthode.`,
      `\n\nVoici pourquoi ${topic} devrait faire partie de votre stratégie :\n\n1️⃣ Gain de temps considérable\n2️⃣ ROI mesurable et prouvé\n3️⃣ Évolutif selon vos besoins\n\nMais attention, l'erreur #1 est de vouloir aller trop vite.`,
      `\n\n${topic} n'est pas juste une mode passagère.\n\nC'est une approche qui a fait ses preuves :\n→ +45% d'efficacité en moyenne\n→ Adopté par les leaders du secteur\n→ Résultats durables\n\nLa clé ? Commencer petit et rester régulier.`
    ];
    
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    
    const ctas = [
      '\n\n💬 Quelle est votre expérience avec ce sujet ?',
      '\n\n👇 Partagez vos résultats en commentaire !',
      '\n\n🔄 Sauvegardez ce post pour plus tard',
      '\n\n➡️ Suivez pour plus de conseils comme celui-ci',
      '\n\n❓ Des questions ? Je réponds en commentaire !'
    ];
    
    const cta = ctas[Math.floor(Math.random() * ctas.length)];
    
    return hook + body + cta;
  };

  const generateCaption = () => {
    const styles = {
      inspirant: `✨ ${topic} ✨\n\nParfois, il suffit d'un petit changement pour créer de grandes transformations.\n\nCe que j'ai appris aujourd'hui :\n• La patience est une vertu\n• Chaque pas compte\n• Le progrès > la perfection\n\nRappel du jour : Vous êtes exactement là où vous devez être. 🌟`,
      educatif: `📚 ${topic} expliqué simplement\n\nVoici ce que vous devez savoir :\n\n1. Les bases fondamentales\n2. Les erreurs à éviter\n3. Les meilleures pratiques\n\nLa suite en story ! 👆\n\nSauvegardez pour ne pas oublier 📌`,
      promotionnel: `🎯 NOUVEAU : ${topic} est disponible !\n\n✅ Caractéristiques principales\n✅ Résultats garantis\n✅ Support inclus\n\n🔥 Offre limitée : -20% cette semaine\n\nLien en bio 🔗`
    };
    
    return styles[tone] || styles.inspirant;
  };

  const generateStory = () => {
    return `[SLIDE 1]\n🎬 ${topic}\nSwipe pour découvrir →\n\n[SLIDE 2]\n❓ Le saviez-vous ?\n[Fait intéressant sur ${topic}]\n\n[SLIDE 3]\n💡 3 conseils rapides\n1. [Conseil 1]\n2. [Conseil 2]\n3. [Conseil 3]\n\n[SLIDE 4]\n📊 Les résultats\n[Statistiques ou témoignage]\n\n[SLIDE 5]\n🎯 Passez à l'action !\n[CTA clair]\n\n💬 Répondez en DM pour plus d'infos`;
  };

  const generateVideoScript = () => {
    return `🎬 SCRIPT VIDÉO : ${topic}\n\n⏱️ Durée cible : 60 secondes\n\n[0-3s] HOOK\n"${topic} - ce que personne ne vous dit !"\n\n[3-10s] INTRODUCTION\nPrésentation rapide du problème/contexte\n\n[10-40s] CONTENU PRINCIPAL\n• Point 1 : [Explication]\n• Point 2 : [Démonstration]\n• Point 3 : [Exemple concret]\n\n[40-55s] RÉSULTATS/BÉNÉFICES\nMontrer la transformation possible\n\n[55-60s] CALL TO ACTION\n"Suivez pour plus de conseils !"\n\n📝 Notes de tournage :\n- Utiliser des visuels dynamiques\n- Sous-titres obligatoires\n- Musique énergique`;
  };

  const generateBlogArticle = () => {
    return `# ${topic} : Le Guide Complet pour 2025\n\n## Introduction\n\nDans un monde en constante évolution, ${topic} est devenu un élément incontournable pour quiconque souhaite rester compétitif et pertinent.\n\n## Pourquoi ${topic} est important\n\n### 1. L'évolution du marché\n\nLes statistiques récentes montrent que...\n\n### 2. Les bénéfices concrets\n\n- Amélioration de la productivité\n- Réduction des coûts\n- Augmentation de la satisfaction\n\n## Comment implémenter ${topic}\n\n### Étape 1 : La préparation\n\n[Contenu détaillé]\n\n### Étape 2 : La mise en œuvre\n\n[Contenu détaillé]\n\n### Étape 3 : L'optimisation\n\n[Contenu détaillé]\n\n## Études de cas\n\n### Entreprise A\n\nRésultats : +45% de performance\n\n### Entreprise B\n\nRésultats : 3x ROI en 6 mois\n\n## Conclusion\n\n${topic} n'est pas seulement une tendance, c'est une nécessité stratégique.\n\n## Ressources additionnelles\n\n- [Lien 1]\n- [Lien 2]\n- [Lien 3]`;
  };

  const generateNewsletter = () => {
    return `Objet : 🚀 ${topic} - Les secrets enfin révélés\n\nBonjour [Prénom],\n\nJ'espère que vous allez bien !\n\nAujourd'hui, je voulais partager avec vous quelque chose qui a complètement transformé ma façon de voir ${topic}.\n\n## 📌 Les 3 points clés à retenir\n\n1. **La simplicité est la clé**\n   Contrairement à ce qu'on pourrait penser...\n\n2. **Les résultats parlent d'eux-mêmes**\n   Nos clients ont constaté...\n\n3. **C'est le moment idéal**\n   Avec les changements actuels...\n\n## 🎯 Passez à l'action\n\n[CTA Button: Découvrir maintenant]\n\n## 📊 Le chiffre de la semaine\n\n87% des professionnels qui ont adopté ${topic} ont vu une amélioration significative.\n\n## 🎁 Ressource gratuite\n\nTéléchargez notre guide PDF : "10 façons d'optimiser ${topic}"\n\nÀ très bientôt,\n[Signature]\n\nP.S. : Répondez à cet email si vous avez des questions !`;
  };

  const generateHashtags = (maxHashtags) => {
    const hashtags = [
      `#${topic.replace(/\s+/g, '')}`,
      '#Innovation2025',
      '#Tendances',
      '#Conseils',
      '#Strategie',
      '#Business',
      '#Marketing',
      '#Digital',
      '#Croissance',
      '#Succes',
      '#Motivation',
      '#Entrepreneuriat',
      '#Productivite',
      '#Tips',
      '#Astuce'
    ];
    
    // Ajouter des hashtags spécifiques aux mots-clés
    if (keywords) {
      const keywordList = keywords.split(',').map(k => `#${k.trim().replace(/\s+/g, '')}`);
      hashtags.push(...keywordList);
    }
    
    // Mélanger et limiter
    const shuffled = hashtags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(maxHashtags, shuffled.length)).join(' ');
  };

  const generateVariations = (originalContent) => {
    const variations = [];
    
    // Variation 1 : Plus courte
    variations.push({
      type: 'Courte',
      content: originalContent.split('\n').slice(0, 3).join('\n') + '\n\n' + generateHashtags(5)
    });
    
    // Variation 2 : Avec emojis
    variations.push({
      type: 'Avec emojis',
      content: originalContent.replace(/\./g, ' 💫').replace(/!/g, ' 🚀').replace(/\?/g, ' 🤔')
    });
    
    // Variation 3 : Format liste
    const points = originalContent.split('.').filter(p => p.trim().length > 20);
    variations.push({
      type: 'Format liste',
      content: `📌 ${topic}\n\n` + points.slice(0, 5).map((p, i) => `${i + 1}. ${p.trim()}`).join('\n')
    });
    
    return variations;
  };

  const saveContent = () => {
    if (!generatedContent) return;
    
    const name = prompt('Nom du contenu :');
    if (!name) return;
    
    const newContent = {
      id: Date.now(),
      name,
      type: contentType,
      platform,
      content: generatedContent,
      createdAt: new Date().toISOString(),
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0
      }
    };
    
    const newSaved = [...savedContent, newContent];
    setSavedContent(newSaved);
    saveToLocalStorage('savedContent', newSaved);
    
    alert('Contenu sauvegardé !');
    trackEvent('content_generator', 'save_content', contentType);
  };

  const deleteContent = (id) => {
    const newSaved = savedContent.filter(c => c.id !== id);
    setSavedContent(newSaved);
    saveToLocalStorage('savedContent', newSaved);
  };

  const loadContent = (content) => {
    setGeneratedContent(content.content);
    setContentType(content.type);
    setPlatform(content.platform);
    setActiveTab('generator');
  };

  const updateMetrics = (id, metric, value) => {
    const updated = savedContent.map(content => {
      if (content.id === id) {
        return {
          ...content,
          metrics: {
            ...content.metrics,
            [metric]: parseInt(value) || 0
          }
        };
      }
      return content;
    });
    
    setSavedContent(updated);
    saveToLocalStorage('savedContent', updated);
  };

  const scheduleContent = (content) => {
    const date = prompt('Date de publication (JJ/MM/AAAA) :');
    const time = prompt('Heure de publication (HH:MM) :');
    
    if (!date || !time) return;
    
    const scheduled = {
      ...content,
      scheduledDate: date,
      scheduledTime: time,
      status: 'scheduled'
    };
    
    const newCalendar = [...contentCalendar, scheduled];
    setContentCalendar(newCalendar);
    saveToLocalStorage('contentCalendar', newCalendar);
    
    alert('Contenu programmé !');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Contenu copié !');
    trackEvent('content_generator', 'copy_content');
  };

  const downloadContent = () => {
    if (!generatedContent) return;
    
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${contentType}-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    trackEvent('content_generator', 'download_content', contentType);
  };

  const applyTemplate = (template) => {
    setGeneratedContent(template.structure.replace(/\[([^\]]+)\]/g, (match, p1) => {
      return `[${p1} pour ${topic}]`;
    }));
    setSelectedTemplate(template.id);
  };

  const calculateEngagementScore = (metrics) => {
    const total = metrics.likes + metrics.comments * 2 + metrics.shares * 3;
    const reach = metrics.reach || 1;
    return ((total / reach) * 100).toFixed(1);
  };

  return (
    <Layout>
    <Helmet>
      <title>Content Generator - Créez du contenu engageant | BestoolsVerse</title>
      <meta name="description" content="Générez du contenu optimisé pour chaque plateforme sociale" />
    </Helmet>  
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => window.history.back()}
            className="mb-6 flex items-center text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} className="mr-2" />
            Retour aux outils
          </button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">Content Generator ✨</h1>
            <p className="text-xl text-gray-200">Créez du contenu engageant optimisé pour chaque plateforme</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-1">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeTab === 'generator'
                    ? 'bg-white text-purple-900'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Générateur
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeTab === 'saved'
                    ? 'bg-white text-purple-900'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Contenu sauvegardé ({savedContent.length})
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-white text-purple-900'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Calendrier ({contentCalendar.length})
              </button>
            </div>
          </div>

          {activeTab === 'generator' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Panneau de configuration */}
              <div className="space-y-6">
                {/* Type de contenu */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h3 className="text-lg font-semibold text-white mb-4">Type de contenu</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {contentTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`p-4 rounded-lg border transition-all ${
                          contentType === type.id
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white bg-opacity-20 border-gray-300 text-white hover:bg-opacity-30'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">{type.icon}</div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs opacity-80">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plateforme */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h3 className="text-lg font-semibold text-white mb-4">Plateforme</h3>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white"
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id} className="bg-gray-800">
                        {p.name} (max {p.maxLength} caractères)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Paramètres */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h3 className="text-lg font-semibold text-white mb-4">Paramètres</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Sujet principal *</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300"
                        placeholder="Ex: Marketing digital, IA, Productivité..."
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Mots-clés (séparés par des virgules)</label>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300"
                        placeholder="innovation, stratégie, croissance..."
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Ton</label>
                      <div className="grid grid-cols-4 gap-2">
                        {tones.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTone(t.id)}
                            className={`p-3 rounded-lg border transition-all ${
                              tone === t.id
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-white bg-opacity-20 border-gray-300 text-white hover:bg-opacity-30'
                            }`}
                          >
                            <div className="text-xl mb-1">{t.emoji}</div>
                            <div className="text-xs">{t.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Templates */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h3 className="text-lg font-semibold text-white mb-4">Templates</h3>
                  <div className="space-y-2">
                    {contentTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedTemplate === template.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                        }`}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs opacity-80 mt-1">{template.structure.split('\n')[0]}...</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bouton de génération */}
                <button
                  onClick={generateContent}
                  disabled={isGenerating || !topic}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="mr-2" />
                      Générer le contenu
                    </>
                  )}
                </button>
              </div>

              {/* Panneau de résultat */}
              <div className="space-y-6">
                {/* Contenu généré */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Contenu généré</h3>
                    {generatedContent && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(generatedContent)}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Copier"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={downloadContent}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="Télécharger"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={saveContent}
                          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          title="Sauvegarder"
                        >
                          <Save size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {generatedContent ? (
                    <div className="space-y-4">
                      <textarea
                        value={editingContent !== null ? editingContent : generatedContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onBlur={() => {
                          if (editingContent !== null) {
                            setGeneratedContent(editingContent);
                            setEditingContent(null);
                          }
                        }}
                        className="w-full h-64 px-4 py-3 bg-white bg-opacity-10 border border-gray-300 rounded-lg text-white resize-none"
                      />
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span>
                          {generatedContent.length} / {platforms.find(p => p.id === platform)?.maxLength || 0} caractères
                        </span>
                        <span>
                          {generatedContent.split(' ').length} mots
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Votre contenu apparaîtra ici</p>
                    </div>
                  )}
                </div>

                {/* Variations */}
                {contentVariations.length > 0 && (
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <h3 className="text-lg font-semibold text-white mb-4">Variations</h3>
                    <div className="space-y-3">
                      {contentVariations.map((variation, index) => (
                        <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{variation.type}</span>
                            <button
                              onClick={() => {
                                setGeneratedContent(variation.content);
                                copyToClipboard(variation.content);
                              }}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm line-clamp-3">{variation.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conseils d'optimisation */}
                {generatedContent && (
                  <div className="bg-yellow-600 bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-600 border-opacity-30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Zap size={20} className="mr-2" />
                      Conseils d'optimisation
                    </h3>
                    <ul className="space-y-2 text-sm text-white">
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        Publiez aux heures de pointe : 8h-9h, 12h-13h, 18h-20h
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        Utilisez des visuels accrocheurs pour augmenter l'engagement
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        Répondez aux commentaires dans les 2 premières heures
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        Testez différentes variations pour trouver ce qui fonctionne
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-6">Contenu sauvegardé</h3>
              
              {savedContent.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Save size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Aucun contenu sauvegardé</p>
                  <p className="text-sm mt-2">Générez et sauvegardez votre premier contenu !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedContent.map(content => (
                    <div key={content.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{content.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                            <span className="flex items-center">
                              <FileText size={14} className="mr-1" />
                              {content.type}
                            </span>
                            <span className="flex items-center">
                              <Target size={14} className="mr-1" />
                              {content.platform}
                            </span>
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(content.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadContent(content)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Charger"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => scheduleContent(content)}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Planifier"
                          >
                            <Calendar size={16} />
                          </button>
                          <button
                            onClick={() => deleteContent(content.id)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{content.content}</p>

                      {/* Métriques */}
                      <div className="grid grid-cols-5 gap-2">
                        <div className="bg-white bg-opacity-10 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <Heart size={14} className="text-red-400" />
                            <input
                              type="number"
                              value={content.metrics.likes}
                              onChange={(e) => updateMetrics(content.id, 'likes', e.target.value)}
                              className="w-16 px-1 py-0.5 bg-transparent text-white text-sm text-right border-b border-gray-600"
                            />
                          </div>
                          <div className="text-xs text-gray-400">Likes</div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <MessageCircle size={14} className="text-blue-400" />
                            <input
                              type="number"
                              value={content.metrics.comments}
                              onChange={(e) => updateMetrics(content.id, 'comments', e.target.value)}
                              className="w-16 px-1 py-0.5 bg-transparent text-white text-sm text-right border-b border-gray-600"
                            />
                          </div>
                          <div className="text-xs text-gray-400">Commentaires</div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <Share2 size={14} className="text-green-400" />
                            <input
                              type="number"
                              value={content.metrics.shares}
                              onChange={(e) => updateMetrics(content.id, 'shares', e.target.value)}
                              className="w-16 px-1 py-0.5 bg-transparent text-white text-sm text-right border-b border-gray-600"
                            />
                          </div>
                          <div className="text-xs text-gray-400">Partages</div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <Users size={14} className="text-purple-400" />
                            <input
                              type="number"
                              value={content.metrics.reach}
                              onChange={(e) => updateMetrics(content.id, 'reach', e.target.value)}
                              className="w-16 px-1 py-0.5 bg-transparent text-white text-sm text-right border-b border-gray-600"
                            />
                          </div>
                          <div className="text-xs text-gray-400">Portée</div>
                        </div>
                        <div className="bg-purple-600 bg-opacity-30 rounded p-2 text-center">
                          <div className="text-lg font-bold text-white">
                            {calculateEngagementScore(content.metrics)}%
                          </div>
                          <div className="text-xs text-gray-300">Engagement</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-6">Calendrier de publication</h3>
              
              {contentCalendar.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Aucun contenu planifié</p>
                  <p className="text-sm mt-2">Planifiez votre contenu depuis l'onglet "Contenu sauvegardé"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentCalendar
                    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
                    .map(content => (
                      <div key={content.id} className="bg-white bg-opacity-10 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-white font-medium">
                              {content.scheduledDate} à {content.scheduledTime}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              content.status === 'scheduled' ? 'bg-yellow-600' : 'bg-green-600'
                            } bg-opacity-50`}>
                              {content.status === 'scheduled' ? 'Planifié' : 'Publié'}
                            </span>
                          </div>
                          <h4 className="font-medium text-white">{content.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                            <span>{content.type}</span>
                            <span>•</span>
                            <span>{content.platform}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadContent(content)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const newCalendar = contentCalendar.filter(c => c.id !== content.id);
                              setContentCalendar(newCalendar);
                              saveToLocalStorage('contentCalendar', newCalendar);
                            }}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Statistiques du calendrier */}
              {contentCalendar.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{contentCalendar.length}</div>
                    <div className="text-sm text-gray-300">Posts planifiés</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {contentCalendar.filter(c => c.status === 'scheduled').length}
                    </div>
                    <div className="text-sm text-gray-300">En attente</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {[...new Set(contentCalendar.map(c => c.platform))].length}
                    </div>
                    <div className="text-sm text-gray-300">Plateformes</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContentGenerator;