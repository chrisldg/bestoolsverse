// src/tools/MemeGenerator.jsx
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Upload, Download, Type, Image, Palette, Share2, Smile, RefreshCw } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const MemeGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [texts, setTexts] = useState({});
  const [textStyle, setTextStyle] = useState({
    fontSize: 40,
    fontFamily: 'Impact',
    color: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 2,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const memeRef = useRef(null);

  // Templates de mèmes populaires avec vraies URLs d'images
  const memeTemplates = [
    {
      id: 1,
      name: 'Drake Reaction',
      category: 'Reaction',
      description: 'Template classique de réaction avec Drake',
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
      width: 1200,
      height: 1200,
      textAreas: [
        { id: 'top', x: 0.5, y: 0.25, width: 0.9, height: 0.2, placeholder: 'Non merci...' },
        { id: 'bottom', x: 0.5, y: 0.75, width: 0.9, height: 0.2, placeholder: 'Oui s\'il vous plaît!' }
      ]
    },
    {
      id: 2,
      name: 'Distracted Boyfriend',
      category: 'Popular',
      description: 'Le petit ami distrait',
      imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
      width: 1200,
      height: 800,
      textAreas: [
        { id: 'girlfriend', x: 0.15, y: 0.85, width: 0.25, height: 0.1, placeholder: 'Actuel' },
        { id: 'boyfriend', x: 0.5, y: 0.2, width: 0.25, height: 0.1, placeholder: 'Moi' },
        { id: 'othergirl', x: 0.8, y: 0.85, width: 0.25, height: 0.1, placeholder: 'Nouveau' }
      ]
    },
    {
      id: 3,
      name: 'One Does Not Simply',
      category: 'Classic',
      description: 'Boromir - On ne peut pas simplement',
      imageUrl: 'https://i.imgflip.com/1bij.jpg',
      width: 568,
      height: 335,
      textAreas: [
        { id: 'top', x: 0.5, y: 0.15, width: 0.9, height: 0.2, placeholder: 'On ne peut pas simplement' },
        { id: 'bottom', x: 0.5, y: 0.85, width: 0.9, height: 0.2, placeholder: 'Faire quelque chose' }
      ]
    },
    {
      id: 4,
      name: 'Batman Slapping Robin',
      category: 'Classic',
      description: 'Batman qui gifle Robin',
      imageUrl: 'https://i.imgflip.com/9ehk.jpg',
      width: 400,
      height: 387,
      textAreas: [
        { id: 'robin', x: 0.25, y: 0.2, width: 0.35, height: 0.15, placeholder: 'Robin dit...' },
        { id: 'batman', x: 0.75, y: 0.2, width: 0.35, height: 0.15, placeholder: 'PAF!' }
      ]
    },
    {
      id: 5,
      name: 'Two Buttons',
      category: 'Choice',
      description: 'Choix difficile entre deux boutons',
      imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
      width: 600,
      height: 908,
      textAreas: [
        { id: 'button1', x: 0.25, y: 0.35, width: 0.35, height: 0.1, placeholder: 'Option 1' },
        { id: 'button2', x: 0.7, y: 0.35, width: 0.35, height: 0.1, placeholder: 'Option 2' },
        { id: 'sweating', x: 0.5, y: 0.85, width: 0.8, height: 0.1, placeholder: 'Moi' }
      ]
    },
    {
      id: 6,
      name: 'Expanding Brain',
      category: 'Brain',
      description: 'Cerveau qui s\'étend en 4 étapes',
      imageUrl: 'https://i.imgflip.com/1jwhww.jpg',
      width: 857,
      height: 1202,
      textAreas: [
        { id: 'level1', x: 0.25, y: 0.125, width: 0.45, height: 0.1, placeholder: 'Basique' },
        { id: 'level2', x: 0.25, y: 0.375, width: 0.45, height: 0.1, placeholder: 'Intelligent' },
        { id: 'level3', x: 0.25, y: 0.625, width: 0.45, height: 0.1, placeholder: 'Génial' },
        { id: 'level4', x: 0.25, y: 0.875, width: 0.45, height: 0.1, placeholder: 'Transcendant' }
      ]
    }
  ];

  const categories = ['Tous', 'Reaction', 'Popular', 'Classic', 'Choice', 'Brain'];
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const fontFamilies = [
    'Impact',
    'Arial Black',
    'Arial',
    'Helvetica',
    'Comic Sans MS',
    'Times New Roman'
  ];

  const filteredTemplates = selectedCategory === 'Tous' 
    ? memeTemplates 
    : memeTemplates.filter(template => template.category === selectedCategory);

  // Fonction pour dessiner les textes sur le canvas
  const drawTexts = (ctx, canvasWidth, canvasHeight) => {
    ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px ${textStyle.fontFamily}`;
    ctx.textAlign = textStyle.textAlign;
    ctx.fillStyle = textStyle.color;
    ctx.strokeStyle = textStyle.strokeColor;
    ctx.lineWidth = textStyle.strokeWidth;
    
    if (selectedTemplate && selectedTemplate.textAreas) {
      // Dessiner les textes pour les zones définies du template
      selectedTemplate.textAreas.forEach(area => {
        const text = texts[area.id] || '';
        if (text) {
          const x = area.x * canvasWidth;
          const y = area.y * canvasHeight;
          
          // Appliquer la transformation de casse
          const displayText = textStyle.textTransform === 'uppercase' ? text.toUpperCase() :
                             textStyle.textTransform === 'lowercase' ? text.toLowerCase() : text;
          
          // Dessiner le contour
          if (textStyle.strokeWidth > 0) {
            ctx.strokeText(displayText, x, y);
          }
          // Dessiner le texte
          ctx.fillText(displayText, x, y);
        }
      });
    } else {
      // Pour les images personnalisées, dessiner en haut et en bas
      if (texts.top) {
        const topText = textStyle.textTransform === 'uppercase' ? texts.top.toUpperCase() :
                       textStyle.textTransform === 'lowercase' ? texts.top.toLowerCase() : texts.top;
        const x = canvasWidth / 2;
        const y = textStyle.fontSize + 20;
        
        if (textStyle.strokeWidth > 0) {
          ctx.strokeText(topText, x, y);
        }
        ctx.fillText(topText, x, y);
      }
      
      if (texts.bottom) {
        const bottomText = textStyle.textTransform === 'uppercase' ? texts.bottom.toUpperCase() :
                          textStyle.textTransform === 'lowercase' ? texts.bottom.toLowerCase() : texts.bottom;
        const x = canvasWidth / 2;
        const y = canvasHeight - 20;
        
        if (textStyle.strokeWidth > 0) {
          ctx.strokeText(bottomText, x, y);
        }
        ctx.fillText(bottomText, x, y);
      }
    }
  };

  useEffect(() => {
    if (selectedTemplate || customImage) {
      drawMeme();
    }
  }, [selectedTemplate, customImage, texts, textStyle]);

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (customImage) {
      const img = new Image();     
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        drawTexts(ctx, canvas.width, canvas.height);
      };
      img.onerror = () => {
        console.error('Erreur de chargement de l\'image personnalisée');
      };
      img.src = customImage;
    } else if (selectedTemplate) {
      const img = new Image();

      // Gestionnaire de succès
      const handleImageLoad = () => {
        canvas.width = selectedTemplate.width || img.width;
        canvas.height = selectedTemplate.height || img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawTexts(ctx, canvas.width, canvas.height);
      };

      // Gestionnaire d'erreur avec fallback
      const handleImageError = () => {
        console.error('Erreur CORS, tentative sans crossOrigin');
        // Réessayer sans crossOrigin
        const imgFallback = new Image();
        imgFallback.onload = handleImageLoad;
        imgFallback.onerror = () => {
          console.error('Impossible de charger l\'image du template');
          // Afficher un message d'erreur sur le canvas
          canvas.width = 600;
          canvas.height = 400;
          ctx.fillStyle = '#333';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#fff';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Erreur de chargement de l\'image', canvas.width/2, canvas.height/2);
        };
        imgFallback.src = selectedTemplate.imageUrl;
      };
      
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      
      // Certains navigateurs nécessitent que crossOrigin soit défini avant src
      if (selectedTemplate.imageUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = selectedTemplate.imageUrl;
    }
  };

  // Fonction pour gérer l'upload d'image personnalisée
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
        setSelectedTemplate(null);
        setTexts({ top: '', bottom: '' });
        trackEvent('meme_generator', 'upload_custom_image');
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadMeme = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      trackEvent('meme_generator', 'download_meme');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement. Essayez de faire une capture d\'écran.');
    }
  };

  const shareMeme = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (navigator.share && blob) {
          const file = new File([blob], 'meme.png', { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: 'Mon mème',
            text: 'Regardez ce mème que j\'ai créé!'
          });
          trackEvent('meme_generator', 'share_meme');
        } else {
          // Fallback: copier l'image dans le presse-papier
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('Image copiée dans le presse-papier!');
        }
      });
    } catch (error) {
      console.error('Erreur partage:', error);
      downloadMeme(); // Fallback au téléchargement
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomImage(null);
    // Initialiser les textes avec les placeholders
    const newTexts = {};
    if (template.textAreas) {
      template.textAreas.forEach(area => {
        newTexts[area.id] = '';
      });
    }
    setTexts(newTexts);
    trackEvent('meme_generator', 'select_template', template.name);
  };

  const handleTextChange = (key, value) => {
    setTexts({ ...texts, [key]: value });
  };

  const randomizeMeme = () => {
    // Phrases drôles prédéfinies
    const funnyPhrases = {
      top: [
        "Quand tu réalises",
        "Moi essayant d'expliquer",
        "Cette sensation quand",
        "Personne:",
        "Tout le monde:",
        "Mon cerveau à 3h du matin:"
      ],
      bottom: [
        "que c'est lundi demain",
        "pourquoi j'ai besoin d'un nouvel écran",
        "tu as oublié de sauvegarder",
        "Absolument personne:",
        "C'est comme ça que ça marche!",
        "Et si on inventait le voyage dans le temps?"
      ]
    };

    if (selectedTemplate) {
      const newTexts = {};
      selectedTemplate.textAreas.forEach(area => {
        const phrases = area.id.includes('top') ? funnyPhrases.top : funnyPhrases.bottom;
        newTexts[area.id] = phrases[Math.floor(Math.random() * phrases.length)];
      });
      setTexts(newTexts);
    } else {
      setTexts({
        top: funnyPhrases.top[Math.floor(Math.random() * funnyPhrases.top.length)],
        bottom: funnyPhrases.bottom[Math.floor(Math.random() * funnyPhrases.bottom.length)]
      });
    }
  };

  return (
    <Layout 
      title="Générateur de Mèmes" 
      description="Créez des mèmes viraux avec nos templates tendance. Générateur simple, rapide et gratuit pour vos réseaux sociaux."
      keywords="créateur mème gratuit, générateur meme, memes viraux, templates memes"
    >
      <Helmet>
        <title>Générateur de Mèmes | BestoolsVerse</title>
        <meta name="description" content="Créez des mèmes viraux avec nos templates tendance. Générateur simple, rapide et gratuit pour vos réseaux sociaux." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Générateur de Mèmes</h1>
            <p className="text-gray-400 mt-2">Créez des mèmes viraux en quelques clics</p>
          </div>
          <Smile className="text-yellow-500" size={48} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Templates</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center"
                >
                  <Upload size={16} className="mr-1" />
                  Image perso
                </button>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Filtres par catégorie */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Liste des templates */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={template.imageUrl} 
                        alt={template.name}
                        className="w-16 h-16 object-cover rounded"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="font-medium text-white">{template.name}</p>
                        <p className="text-xs text-gray-400">{template.description}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Éditeur principal */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
              {/* Barre d'outils */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedTemplate ? selectedTemplate.name : customImage ? 'Image personnalisée' : 'Sélectionnez un template'}
                  </h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={randomizeMeme}
                      disabled={!selectedTemplate && !customImage}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        selectedTemplate || customImage
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Randomiser
                    </button>
                    <button
                      onClick={downloadMeme}
                      disabled={!selectedTemplate && !customImage}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        selectedTemplate || customImage
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Download size={16} className="mr-2" />
                      Télécharger
                    </button>
                    <button
                      onClick={shareMeme}
                      disabled={!selectedTemplate && !customImage}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        selectedTemplate || customImage
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Share2 size={16} className="mr-2" />
                      Partager
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas et contrôles */}
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div ref={memeRef} className="relative max-w-full">
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-600 rounded-lg max-w-full h-auto"
                      style={{ maxHeight: '500px' }}
                    />
                    {!selectedTemplate && !customImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                        <div className="text-center">
                          <Image size={64} className="mx-auto text-gray-600 mb-4" />
                          <p className="text-gray-400">Sélectionnez un template ou uploadez une image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Champs de texte */}
                {(selectedTemplate || customImage) && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <Type size={20} className="mr-2" />
                      Textes
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate && selectedTemplate.textAreas ? (
                        selectedTemplate.textAreas.map((area) => (
                          <div key={area.id}>
                            <label className="block text-gray-300 mb-2 capitalize">
                              {area.id.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                            </label>
                            <input
                              type="text"
                              value={texts[area.id] || ''}
                              onChange={(e) => handleTextChange(area.id, e.target.value)}
                              placeholder={area.placeholder || `Texte ${area.id}...`}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                            />
                          </div>
                        ))
                      ) : (
                        <>
                          <div>
                            <label className="block text-gray-300 mb-2">Texte du haut</label>
                            <input
                              type="text"
                              value={texts.top || ''}
                              onChange={(e) => handleTextChange('top', e.target.value)}
                              placeholder="Texte du haut..."
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-2">Texte du bas</label>
                            <input
                              type="text"
                              value={texts.bottom || ''}
                              onChange={(e) => handleTextChange('bottom', e.target.value)}
                              placeholder="Texte du bas..."
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Style de texte */}
                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-lg font-semibold text-white flex items-center mb-4">
                        <Palette size={20} className="mr-2" />
                        Style du texte
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Police</label>
                          <select
                            value={textStyle.fontFamily}
                            onChange={(e) => setTextStyle({...textStyle, fontFamily: e.target.value})}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                          >
                            {fontFamilies.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Taille</label>
                          <input
                            type="range"
                            min="20"
                            max="80"
                            value={textStyle.fontSize}
                            onChange={(e) => setTextStyle({...textStyle, fontSize: parseInt(e.target.value)})}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{textStyle.fontSize}px</span>
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Couleur</label>
                          <input
                            type="color"
                            value={textStyle.color}
                            onChange={(e) => setTextStyle({...textStyle, color: e.target.value})}
                            className="w-full h-10 rounded border border-gray-600 cursor-pointer"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Contour</label>
                          <input
                            type="color"
                            value={textStyle.strokeColor}
                            onChange={(e) => setTextStyle({...textStyle, strokeColor: e.target.value})}
                            className="w-full h-10 rounded border border-gray-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Épaisseur contour</label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={textStyle.strokeWidth}
                            onChange={(e) => setTextStyle({...textStyle, strokeWidth: parseInt(e.target.value)})}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{textStyle.strokeWidth}px</span>
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Casse</label>
                          <select
                            value={textStyle.textTransform}
                            onChange={(e) => setTextStyle({...textStyle, textTransform: e.target.value})}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                          >
                            <option value="uppercase">MAJUSCULES</option>
                            <option value="none">Normal</option>
                            <option value="lowercase">minuscules</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conseils */}
            <div className="mt-6 bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-800">
              <h4 className="font-semibold text-blue-400 mb-2">💡 Conseils pour des mèmes viraux</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Gardez le texte court et percutant</li>
                <li>• Utilisez des références d'actualité</li>
                <li>• Le timing est crucial - surfez sur les tendances</li>
                <li>• N'ayez pas peur d'être créatif avec les templates classiques</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemeGenerator;