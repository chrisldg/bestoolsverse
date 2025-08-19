// src/tools/StoryGenerator.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, BookOpen, Wand2, Download, RefreshCw, Heart, Share2, Copy, Sparkles, Clock, User, FileText, Trash2 } from 'lucide-react';import { trackEvent } from '../utils/analytics';
import toast from 'react-hot-toast';

const StoryGenerator = () => {
  const [storyConfig, setStoryConfig] = useState({
    genre: 'fantasy',
    ageGroup: 'adult',
    length: 'short',
    protagonist: '',
    theme: '',
    setting: '',
    mood: 'neutral'
  });
  
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');

  const genres = [
    { id: 'fantasy', name: 'Fantasy', icon: '🧙', description: 'Magie, dragons et mondes imaginaires' },
    { id: 'scifi', name: 'Science-Fiction', icon: '🚀', description: 'Futur, technologie et exploration spatiale' },
    { id: 'mystery', name: 'Mystère', icon: '🔍', description: 'Enquêtes et suspense' },
    { id: 'romance', name: 'Romance', icon: '💕', description: 'Histoires d\'amour et relations' },
    { id: 'horror', name: 'Horreur', icon: '👻', description: 'Frissons et terreur' },
    { id: 'adventure', name: 'Aventure', icon: '🗺️', description: 'Quêtes et explorations' },
    { id: 'comedy', name: 'Comédie', icon: '😄', description: 'Humour et situations drôles' },
    { id: 'drama', name: 'Drame', icon: '🎭', description: 'Émotions fortes et conflits' }
  ];

  const ageGroups = [
    { id: 'children', name: 'Enfants (5-10 ans)', icon: '🧸' },
    { id: 'teen', name: 'Adolescents (11-17 ans)', icon: '📚' },
    { id: 'adult', name: 'Adultes (18+)', icon: '📖' }
  ];

  const storyLengths = [
    { id: 'micro', name: 'Micro-récit', words: '50-100 mots', time: '30s' },
    { id: 'short', name: 'Histoire courte', words: '500-1000 mots', time: '3-5 min' },
    { id: 'medium', name: 'Nouvelle', words: '2000-5000 mots', time: '10-20 min' },
    { id: 'long', name: 'Novella', words: '10000+ mots', time: '45+ min' }
  ];

  const themes = [
    'Amitié', 'Courage', 'Famille', 'Liberté', 'Justice', 'Amour',
    'Sacrifice', 'Rédemption', 'Découverte', 'Trahison', 'Espoir', 'Vengeance',
    'Pardon', 'Croissance', 'Aventure', 'Mystère', 'Identité', 'Pouvoir'
  ];

  const moods = [
    { id: 'uplifting', name: 'Inspirant', icon: '🌟' },
    { id: 'dark', name: 'Sombre', icon: '🌙' },
    { id: 'neutral', name: 'Neutre', icon: '⚖️' },
    { id: 'humorous', name: 'Humoristique', icon: '😊' },
    { id: 'melancholic', name: 'Mélancolique', icon: '🌧️' },
    { id: 'thrilling', name: 'Palpitant', icon: '⚡' }
  ];

  const settings = {
    fantasy: ['Royaume médiéval', 'Forêt enchantée', 'Cité volante', 'Monde souterrain', 'Île mystique'],
    scifi: ['Station spatiale', 'Planète lointaine', 'Ville cyberpunk', 'Laboratoire secret', 'Vaisseau colonial'],
    mystery: ['Manoir victorien', 'Petite ville', 'Métropole moderne', 'Île isolée', 'Orient Express'],
    romance: ['Paris', 'Petite librairie', 'Campus universitaire', 'Plage tropicale', 'Café cosy'],
    horror: ['Maison hantée', 'Forêt sombre', 'Hôpital abandonné', 'Cimetière ancien', 'Sous-sol'],
    adventure: ['Jungle mystérieuse', 'Désert', 'Montagne enneigée', 'Océan', 'Temple ancien'],
    comedy: ['Bureau', 'École', 'Centre commercial', 'Restaurant', 'Salle de sport'],
    drama: ['Tribunal', 'Hôpital', 'Famille', 'Théâtre', 'Quartier défavorisé']
  };

  // Charger les histoires sauvegardées
  useEffect(() => {
    const saved = localStorage.getItem('savedStories');
    if (saved) {
      setSavedStories(JSON.parse(saved));
    }
  }, []);

  const generateStory = async () => {
    setIsGenerating(true);
    trackEvent('story_generator', 'generate_story', storyConfig.genre);
    
    // Simulation de génération (en production, appeler une API IA)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const story = {
      id: Date.now(),
      title: generateTitle(),
      content: generateContent(),
      config: { ...storyConfig },
      createdAt: new Date().toISOString(),
      wordCount: Math.floor(Math.random() * 500) + 500,
      readingTime: Math.floor(Math.random() * 5) + 3
    };
    
    setGeneratedStory(story);
    setIsGenerating(false);
  };

  const generateTitle = () => {
    const titles = {
      fantasy: ['Le Dernier Dragon', 'L\'Épée de Cristal', 'Les Chroniques d\'Azura'],
      scifi: ['Horizon 2157', 'Les Colons de Mars', 'Singularité'],
      mystery: ['Le Secret du Manoir', 'Disparition à Minuit', 'L\'Énigme du Phare'],
      romance: ['Un Été à Paris', 'Lettres d\'Amour', 'Rencontre Inattendue'],
      horror: ['La Maison des Ombres', 'Murmures dans la Nuit', 'Le Visiteur'],
      adventure: ['À la Recherche de l\'Eldorado', 'Les Sept Mers', 'L\'Expédition Perdue'],
      comedy: ['Chaos au Bureau', 'Les Vacances Catastrophiques', 'Mon Voisin l\'Alien'],
      drama: ['Les Liens du Sang', 'Seconde Chance', 'Au-delà des Apparences']
    };
    
    const genreTitles = titles[storyConfig.genre] || titles.fantasy;
    return genreTitles[Math.floor(Math.random() * genreTitles.length)];
  };

  const generateContent = () => {
    const protagonist = storyConfig.protagonist || 'Alex';
    const setting = storyConfig.setting || settings[storyConfig.genre][0];
    
    const intros = {
      fantasy: `Dans le royaume lointain de ${setting}, ${protagonist} découvrit un ancien parchemin qui allait changer le destin du monde...`,
      scifi: `L'année 2157. ${protagonist} se réveilla dans la ${setting}, les alarmes hurlant dans les couloirs métalliques...`,
      mystery: `La pluie battait contre les fenêtres du ${setting} quand ${protagonist} reçut l'appel qui changerait tout...`,
      romance: `${protagonist} n'avait jamais cru au coup de foudre, jusqu'à ce jour d'été à ${setting}...`,
      horror: `Les habitants évitaient le ${setting} depuis des générations, mais ${protagonist} n'avait pas le choix...`,
      adventure: `La carte était vieille et déchirée, mais ${protagonist} savait qu'elle menait à ${setting}...`,
      comedy: `Tout commença quand ${protagonist} renversa accidentellement du café sur le PDG dans ${setting}...`,
      drama: `${protagonist} fixait la lettre, les mains tremblantes. Après toutes ces années à ${setting}...`
    };
    
    const intro = intros[storyConfig.genre] || intros.fantasy;
    
    const middleContent = `

Le voyage de ${protagonist} venait de commencer. Les défis qui l'attendaient étaient nombreux, mais sa détermination était plus forte que jamais.

Dans les profondeurs de ${setting}, des secrets anciens attendaient d'être découverts. Chaque pas en avant révélait de nouveaux mystères, de nouvelles questions qui demandaient des réponses.

${storyConfig.theme ? `Le thème de ${storyConfig.theme.toLowerCase()} résonnait à travers chaque action, chaque décision.` : ''}

Les jours passèrent, transformant ${protagonist} de manière inattendue. Ce qui avait commencé comme une simple quête était devenu bien plus : une transformation profonde, une découverte de soi.`;

    const endings = {
      uplifting: `\n\nFinalement, ${protagonist} triompha. Les leçons apprises illumineraient le chemin pour les générations futures.`,
      dark: `\n\nMais certaines victoires ont un prix. ${protagonist} avait gagné, mais à quel coût ?`,
      neutral: `\n\nAinsi se termina cette aventure. ${protagonist} retourna chez soi, changé à jamais par cette expérience.`,
      humorous: `\n\nEt c'est ainsi que ${protagonist} sauva le monde... en chaussettes dépareillées !`,
      melancholic: `\n\nLe soleil se couchait sur ${setting}. ${protagonist} sourit tristement, sachant que rien ne serait plus jamais pareil.`,
      thrilling: `\n\nMais l'histoire ne faisait que commencer. Dans l'ombre, une nouvelle menace se préparait...`
    };
    
    const ending = endings[storyConfig.mood] || endings.neutral;
    
    return intro + middleContent + ending;
  };

  const saveStory = () => {
    if (!generatedStory) return;
    
    const newSavedStories = [...savedStories, generatedStory];
    setSavedStories(newSavedStories);
    localStorage.setItem('savedStories', JSON.stringify(newSavedStories));
    
    toast.success('Histoire sauvegardée !');
    trackEvent('story_generator', 'save_story');
  };

  const deleteStory = (id) => {
    const filtered = savedStories.filter(s => s.id !== id);
    setSavedStories(filtered);
    localStorage.setItem('savedStories', JSON.stringify(filtered));
    
    toast.success('Histoire supprimée');
    trackEvent('story_generator', 'delete_story');
  };

  const copyStory = () => {
    if (!generatedStory) return;
    
    const fullStory = `${generatedStory.title}\n\n${generatedStory.content}`;
    navigator.clipboard.writeText(fullStory);
    
    toast.success('Histoire copiée !');
    trackEvent('story_generator', 'copy_story');
  };

  const downloadStory = () => {
    if (!generatedStory) return;
    
    const fullStory = `${generatedStory.title}\n\n${generatedStory.content}\n\n---\nGénéré par BestoolsVerse Story Generator`;
    const blob = new Blob([fullStory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedStory.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    
    trackEvent('story_generator', 'download_story');
  };

  const shareStory = () => {
    if (!generatedStory) return;
    
    if (navigator.share) {
      navigator.share({
        title: generatedStory.title,
        text: generatedStory.content.substring(0, 200) + '...',
        url: window.location.href
      });
    } else {
      copyStory();
      toast.success('Lien copié pour partager !');
    }
    
    trackEvent('story_generator', 'share_story');
  };

  return (
    <Layout 
      title="Générateur d'Histoires IA" 
      description="Créez des histoires captivantes avec l'IA. Choisissez genre, personnages et laissez la magie opérer."
      keywords="générateur histoires ia, créer récit, écriture créative, storytelling"
    >
      <Helmet>
        <title>Générateur d'Histoires IA | BestoolsVerse</title>
        <meta name="description" content="Créez des histoires captivantes avec l'IA. Choisissez genre, personnages et laissez la magie opérer." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Générateur d'Histoires</h1>
            <p className="text-gray-400 mt-2">Créez des récits uniques avec l'intelligence artificielle</p>
          </div>
          <BookOpen className="text-purple-500" size={48} />
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Wand2 className="inline mr-2" size={18} />
            Générer
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="inline mr-2" size={18} />
            Mes histoires ({savedStories.length})
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration */}
            <div className="lg:col-span-1 space-y-6">
              {/* Genre */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Genre</h3>
                <div className="grid grid-cols-2 gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => setStoryConfig({...storyConfig, genre: genre.id})}
                      className={`p-3 rounded-lg border transition-all ${
                        storyConfig.genre === genre.id
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{genre.icon}</div>
                      <div className="text-sm">{genre.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paramètres */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Paramètres</h3>
                
                {/* Groupe d'âge */}
                <div>
                  <label className="block text-gray-300 mb-2">Public cible</label>
                  <select
                    value={storyConfig.ageGroup}
                    onChange={(e) => setStoryConfig({...storyConfig, ageGroup: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    {ageGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.icon} {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Longueur */}
                <div>
                  <label className="block text-gray-300 mb-2">Longueur</label>
                  <select
                    value={storyConfig.length}
                    onChange={(e) => setStoryConfig({...storyConfig, length: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    {storyLengths.map(length => (
                      <option key={length.id} value={length.id}>
                        {length.name} ({length.words})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ambiance */}
                <div>
                  <label className="block text-gray-300 mb-2">Ambiance</label>
                  <select
                    value={storyConfig.mood}
                    onChange={(e) => setStoryConfig({...storyConfig, mood: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    {moods.map(mood => (
                      <option key={mood.id} value={mood.id}>
                        {mood.icon} {mood.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Protagoniste */}
                <div>
                  <label className="block text-gray-300 mb-2">Nom du protagoniste</label>
                  <input
                    type="text"
                    value={storyConfig.protagonist}
                    onChange={(e) => setStoryConfig({...storyConfig, protagonist: e.target.value})}
                    placeholder="Ex: Alice, Marcus..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white placeholder-gray-500"
                  />
                </div>

                {/* Lieu */}
                <div>
                  <label className="block text-gray-300 mb-2">Lieu</label>
                  <select
                    value={storyConfig.setting}
                    onChange={(e) => setStoryConfig({...storyConfig, setting: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    <option value="">Aléatoire</option>
                    {(settings[storyConfig.genre] || []).map(setting => (
                      <option key={setting} value={setting}>{setting}</option>
                    ))}
                  </select>
                </div>

                {/* Thème */}
                <div>
                  <label className="block text-gray-300 mb-2">Thème principal</label>
                  <select
                    value={storyConfig.theme}
                    onChange={(e) => setStoryConfig({...storyConfig, theme: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    <option value="">Aucun thème spécifique</option>
                    {themes.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bouton de génération */}
              <button
                onClick={generateStory}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={20} />
                    Générer l'histoire
                  </>
                )}
              </button>
            </div>

            {/* Histoire générée */}
            <div className="lg:col-span-2">
              {generatedStory ? (
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{generatedStory.title}</h2>
                      <div className="flex items-center space-x-4 text-gray-400 text-sm">
                        <span className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          {generatedStory.readingTime} min
                        </span>
                        <span className="flex items-center">
                          <FileText size={16} className="mr-1" />
                          {generatedStory.wordCount} mots
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={copyStory}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                        title="Copier"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={downloadStory}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                        title="Télécharger"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={shareStory}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                        title="Partager"
                      >
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={saveStory}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                        title="Sauvegarder"
                      >
                        <Heart size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {generatedStory.content}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <button
                      onClick={generateStory}
                      className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <RefreshCw size={18} className="mr-2" />
                      Générer une nouvelle histoire
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-12 text-center">
                  <BookOpen size={64} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Prêt à créer une histoire ?</h3>
                  <p className="text-gray-400">
                    Configurez vos préférences et cliquez sur "Générer l'histoire" pour commencer
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedStories.map(story => (
                  <div key={story.id} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{story.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {story.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{story.wordCount} mots</span>
                      <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setGeneratedStory(story)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                      >
                        Lire
                      </button>
                      <button
                        onClick={() => deleteStory(story.id)}
                        className="px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-12 text-center">
                <BookOpen size={64} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucune histoire sauvegardée</h3>
                <p className="text-gray-400">
                  Générez et sauvegardez vos histoires préférées pour les retrouver ici
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StoryGenerator;