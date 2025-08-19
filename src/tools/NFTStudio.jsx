// src/tools/NFTStudio.jsx
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Download, Share2, Sparkles, Zap, Save, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { getSafeCanvasContext, loadImageSafely } from '../components/ToolErrorWrapper';

const NFTStudio = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [artStyle, setArtStyle] = useState('abstract');
  const [colors, setColors] = useState(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']);
  const [complexity, setComplexity] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArt, setGeneratedArt] = useState(null);
  const [nftMetadata, setNftMetadata] = useState({
    name: 'Mon NFT Art',
    description: '',
    collection: 'Art Collection',
    attributes: []
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [savedNFTs, setSavedNFTs] = useState([]);
  const [error, setError] = useState(null);
  const animationRef = useRef(null);

  const artStyles = {
    abstract: { name: 'Abstrait', description: 'Formes et couleurs abstraites' },
    geometric: { name: 'Géométrique', description: 'Motifs géométriques précis' },
    pixel: { name: 'Pixel Art', description: 'Style rétro pixelisé' },
    generative: { name: 'Génératif', description: 'Art algorithmique unique' },
    fractal: { name: 'Fractal', description: 'Motifs fractals complexes' },
    glitch: { name: 'Glitch', description: 'Effet de distorsion numérique' }
  };

  // Charger les NFTs sauvegardés
  useEffect(() => {
    const saved = localStorage.getItem('savedNFTs');
    if (saved) {
      setSavedNFTs(JSON.parse(saved));
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const generateArt = async () => {
    setIsGenerating(true);
    setError(null);
    trackEvent('nft_studio', 'generate_art', artStyle);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas non disponible');
      
      const ctx = getSafeCanvasContext(canvasRef, '2d');
      if (!ctx) throw new Error('Impossible d\'obtenir le contexte 2D');

      const width = canvas.width;
      const height = canvas.height;

      // Nettoyer le canvas
      ctx.clearRect(0, 0, width, height);

      // Si une image est uploadée, l'utiliser comme base
      if (uploadedImage) {
        try {
          const img = await loadImageSafely(uploadedImage);
          ctx.drawImage(img, 0, 0, width, height);
          applyArtEffect(ctx, width, height);
        } catch (err) {
          console.error('Erreur chargement image:', err);
          generateProceduralArt(ctx, width, height);
        }
      } else {
        generateProceduralArt(ctx, width, height);
      }

      // Sauvegarder l'art généré
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedArt(dataUrl);
      
      // Ajouter des attributs aléatoires
      const attributes = generateAttributes();
      setNftMetadata(prev => ({ ...prev, attributes }));

    } catch (err) {
      console.error('Erreur génération:', err);
      setError('Erreur lors de la génération de l\'art');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateProceduralArt = (ctx, width, height) => {
    switch (artStyle) {
      case 'abstract':
        generateAbstractArt(ctx, width, height);
        break;
      case 'geometric':
        generateGeometricArt(ctx, width, height);
        break;
      case 'pixel':
        generatePixelArt(ctx, width, height);
        break;
      case 'generative':
        generateGenerativeArt(ctx, width, height);
        break;
      case 'fractal':
        generateFractalArt(ctx, width, height);
        break;
      case 'glitch':
        generateGlitchArt(ctx, width, height);
        break;
    }
  };

  const generateAbstractArt = (ctx, width, height) => {
    // Fond avec gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Formes organiques
    for (let i = 0; i < complexity * 3; i++) {
      ctx.save();
      ctx.globalAlpha = Math.random() * 0.7 + 0.3;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      ctx.beginPath();
      const points = 3 + Math.floor(Math.random() * 5);
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const radius = Math.random() * 100 + 50;
      
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius * (0.5 + Math.random());
        const y = centerY + Math.sin(angle) * radius * (0.5 + Math.random());
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          const cp1x = centerX + Math.cos(angle - 0.5) * radius;
          const cp1y = centerY + Math.sin(angle - 0.5) * radius;
          ctx.quadraticCurveTo(cp1x, cp1y, x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  const generateGeometricArt = (ctx, width, height) => {
    // Fond noir
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const gridSize = 40;
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        if (Math.random() > 0.3) {
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          ctx.fillStyle = color;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          
          switch (shape) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(x + gridSize/2, y + gridSize/2, gridSize/3, 0, Math.PI * 2);
              if (Math.random() > 0.5) {
                ctx.fill();
              } else {
                ctx.stroke();
              }
              break;
              
            case 'square':
              const size = gridSize * 0.6;
              const offset = (gridSize - size) / 2;
              if (Math.random() > 0.5) {
                ctx.fillRect(x + offset, y + offset, size, size);
              } else {
                ctx.strokeRect(x + offset, y + offset, size, size);
              }
              break;
              
            case 'triangle':
              ctx.beginPath();
              ctx.moveTo(x + gridSize/2, y + gridSize * 0.2);
              ctx.lineTo(x + gridSize * 0.2, y + gridSize * 0.8);
              ctx.lineTo(x + gridSize * 0.8, y + gridSize * 0.8);
              ctx.closePath();
              if (Math.random() > 0.5) {
                ctx.fill();
              } else {
                ctx.stroke();
              }
              break;
          }
        }
      }
    }
  };

  const generatePixelArt = (ctx, width, height) => {
    const pixelSize = 10;
    const noiseLevel = 0.1;
    
    // Générer un pattern de base
    for (let x = 0; x < width; x += pixelSize) {
      for (let y = 0; y < height; y += pixelSize) {
        if (Math.random() > noiseLevel) {
          const colorIndex = Math.floor(
            (x / width + y / height) * colors.length
          ) % colors.length;
          ctx.fillStyle = colors[colorIndex];
        } else {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        }
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
    
    // Ajouter des détails
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < complexity * 10; i++) {
      const x = Math.floor(Math.random() * width / pixelSize) * pixelSize;
      const y = Math.floor(Math.random() * height / pixelSize) * pixelSize;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
    ctx.globalAlpha = 1;
  };

  const generateGenerativeArt = (ctx, width, height) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    const particles = [];
    const particleCount = complexity * 20;
    
    // Créer des particules
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 100
      });
    }
    
    // Dessiner les particules et leurs connexions
    ctx.globalAlpha = 0.8;
    particles.forEach((particle, i) => {
      // Dessiner la particule
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Dessiner des connexions
      particles.slice(i + 1).forEach(other => {
        const distance = Math.sqrt(
          Math.pow(particle.x - other.x, 2) + 
          Math.pow(particle.y - other.y, 2)
        );
        
        if (distance < 100) {
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = (1 - distance / 100) * 2;
          ctx.globalAlpha = (1 - distance / 100) * 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      });
    });
    ctx.globalAlpha = 1;
  };

  const generateFractalArt = (ctx, width, height) => {
    const maxDepth = Math.min(complexity, 8); // Limiter la profondeur pour éviter stack overflow
    
    // Fond avec gradient
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const drawFractal = (x, y, size, depth, angle = 0) => {
      if (depth === 0 || size < 2) return;
      
      const colorIndex = depth % colors.length;
      ctx.strokeStyle = colors[colorIndex];
      ctx.fillStyle = colors[colorIndex] + '40';
      ctx.lineWidth = Math.max(1, depth / 2);
      
      // Dessiner le cercle principal
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Récursion pour les branches
      const branches = 6;
      const angleStep = (Math.PI * 2) / branches;
      
      for (let i = 0; i < branches; i++) {
        const newAngle = angle + angleStep * i;
        const newX = x + Math.cos(newAngle) * size * 1.5;
        const newY = y + Math.sin(newAngle) * size * 1.5;
        
        // Ligne de connexion
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(newX, newY);
        ctx.stroke();
        
        // Appel récursif avec taille réduite
        drawFractal(newX, newY, size * 0.4, depth - 1, newAngle);
      }
    };
    
    // Commencer le fractal au centre
    drawFractal(width/2, height/2, Math.min(width, height) / 8, maxDepth);
  };

  const generateGlitchArt = (ctx, width, height) => {
    // Créer une base colorée
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Effet de glitch
    const glitchStrips = complexity * 5;
    
    for (let i = 0; i < glitchStrips; i++) {
      const y = Math.random() * height;
      const stripHeight = Math.random() * 20 + 5;
      const offset = (Math.random() - 0.5) * 50;
      
      // Copier et décaler une bande
      const imageData = ctx.getImageData(0, y, width, stripHeight);
      ctx.putImageData(imageData, offset, y);
      
      // Ajouter des artefacts colorés
      if (Math.random() > 0.5) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '40';
        ctx.fillRect(0, y, width, stripHeight);
      }
    }
    
    // Ajouter du bruit
    const noiseData = ctx.getImageData(0, 0, width, height);
    const pixels = noiseData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
      if (Math.random() > 0.98) {
        const brightness = Math.random() > 0.5 ? 255 : 0;
        pixels[i] = brightness;
        pixels[i + 1] = brightness;
        pixels[i + 2] = brightness;
      }
    }
    
    ctx.putImageData(noiseData, 0, 0);
  };

  const applyArtEffect = (ctx, width, height) => {
    // Appliquer un effet artistique sur l'image uploadée
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    switch (artStyle) {
      case 'abstract':
        // Effet de peinture
        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i] = Math.floor(pixels[i] / 32) * 32;
          pixels[i + 1] = Math.floor(pixels[i + 1] / 32) * 32;
          pixels[i + 2] = Math.floor(pixels[i + 2] / 32) * 32;
        }
        break;
        
      case 'glitch':
        // Effet de corruption
        for (let i = 0; i < pixels.length; i += 4) {
          if (Math.random() > 0.95) {
            pixels[i] = Math.random() * 255;
            pixels[i + 1] = Math.random() * 255;
            pixels[i + 2] = Math.random() * 255;
          }
        }
        break;
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const generateAttributes = () => {
    const rarityLevels = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    const attributes = [
      {
        trait_type: 'Style',
        value: artStyles[artStyle].name
      },
      {
        trait_type: 'Complexity',
        value: complexity
      },
      {
        trait_type: 'Rarity',
        value: rarityLevels[Math.floor(Math.random() * rarityLevels.length)]
      },
      {
        trait_type: 'Color Scheme',
        value: `${colors.length} colors`
      },
      {
        trait_type: 'Generation',
        value: 'Gen 1'
      }
    ];
    
    return attributes;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        trackEvent('nft_studio', 'upload_image');
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadNFT = () => {
    if (!generatedArt) return;
    
    // Télécharger l'image
    const link = document.createElement('a');
    link.download = `${nftMetadata.name.replace(/\s+/g, '-')}.png`;
    link.href = generatedArt;
    link.click();
    
    // Télécharger les métadonnées
    const metadata = {
      ...nftMetadata,
      image: `${nftMetadata.name.replace(/\s+/g, '-')}.png`,
      created_at: new Date().toISOString()
    };
    
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const metadataUrl = URL.createObjectURL(metadataBlob);
    const metadataLink = document.createElement('a');
    metadataLink.download = `${nftMetadata.name.replace(/\s+/g, '-')}-metadata.json`;
    metadataLink.href = metadataUrl;
    metadataLink.click();
    
    URL.revokeObjectURL(metadataUrl);
    trackEvent('nft_studio', 'download_nft');
  };

  const saveNFT = () => {
    if (!generatedArt) return;
    
    const nft = {
      id: Date.now(),
      ...nftMetadata,
      image: generatedArt,
      created_at: new Date().toISOString()
    };
    
    const newSavedNFTs = [...savedNFTs, nft];
    setSavedNFTs(newSavedNFTs);
    localStorage.setItem('savedNFTs', JSON.stringify(newSavedNFTs));
    
    alert('NFT sauvegardé avec succès !');
    trackEvent('nft_studio', 'save_nft');
  };

  const deleteNFT = (id) => {
    const newSavedNFTs = savedNFTs.filter(nft => nft.id !== id);
    setSavedNFTs(newSavedNFTs);
    localStorage.setItem('savedNFTs', JSON.stringify(newSavedNFTs));
    trackEvent('nft_studio', 'delete_nft');
  };

  const addCustomColor = () => {
    const newColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    setColors([...colors, newColor]);
  };

  const removeColor = (index) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  return (
    <Layout 
      title="Studio NFT & Art Digital" 
      description="Créez et générez des œuvres d'art numériques uniques pour vos NFTs. Styles variés et personnalisation avancée."
      keywords="nft creator, art generator, digital art, crypto art, nft studio"
    >
      <Helmet>
        <title>Studio NFT & Art Digital | BestoolsVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <nav className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-16">
              <a href="/" className="flex items-center text-purple-500 hover:text-purple-400">
                <ChevronLeft size={20} className="mr-2" />
                <span>Retour aux outils</span>
              </a>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Studio NFT & Art Digital</h1>
            <p className="text-gray-400 text-lg">
              Créez des œuvres d'art numériques uniques pour vos collections NFT
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panneau de configuration */}
            <div className="lg:col-span-1 space-y-6">
              {/* Style d'art */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Style d'art</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(artStyles).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => setArtStyle(key)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        artStyle === key
                          ? 'border-purple-500 bg-purple-500 bg-opacity-20 text-white'
                          : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs mt-1 opacity-80">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleurs */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Palette de couleurs</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <div key={index} className="relative group">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            const newColor = prompt('Nouvelle couleur (hex):', color);
                            if (newColor) {
                              const newColors = [...colors];
                              newColors[index] = newColor;
                              setColors(newColors);
                            }
                          }}
                        />
                        {colors.length > 2 && (
                          <button
                            onClick={() => removeColor(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {colors.length < 8 && (
                      <button
                        onClick={addCustomColor}
                        className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-400 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Complexité */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Complexité</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={complexity}
                    onChange={(e) => setComplexity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Simple</span>
                    <span className="text-white font-medium">{complexity}/10</span>
                    <span>Complexe</span>
                  </div>
                </div>
              </div>

              {/* Upload d'image */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Image de base (optionnel)</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <Upload size={20} className="mr-2" />
                  {uploadedImage ? 'Changer l\'image' : 'Uploader une image'}
                </button>
                {uploadedImage && (
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="w-full mt-2 py-2 bg-red-900 bg-opacity-50 text-red-400 rounded-lg hover:bg-opacity-70 transition-colors"
                  >
                    Supprimer l'image
                  </button>
                )}
              </div>
            </div>

            {/* Zone de prévisualisation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Canvas de génération */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Aperçu</h3>
                  <button
                    onClick={generateArt}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={20} className="mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} className="mr-2" />
                        Générer l'art
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={512}
                    height={512}
                    className="w-full h-auto max-w-md mx-auto rounded-lg"
                    style={{ imageRendering: artStyle === 'pixel' ? 'pixelated' : 'auto' }}
                  />
                </div>
                
                {generatedArt && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={downloadNFT}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Download size={20} className="mr-2" />
                      Télécharger NFT
                    </button>
                    <button
                      onClick={saveNFT}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Save size={20} className="mr-2" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => {
                        const shareUrl = `https://bestoolsverse.com/nft/${Date.now()}`;
                        navigator.clipboard.writeText(shareUrl);
                        alert('Lien copié !');
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Métadonnées NFT */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Métadonnées NFT</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Nom du NFT</label>
                    <input
                      type="text"
                      value={nftMetadata.name}
                      onChange={(e) => setNftMetadata({...nftMetadata, name: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      placeholder="Mon NFT Art #001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      value={nftMetadata.description}
                      onChange={(e) => setNftMetadata({...nftMetadata, description: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white resize-none"
                      rows="3"
                      placeholder="Une œuvre d'art numérique unique créée avec l'IA..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Collection</label>
                    <input
                      type="text"
                      value={nftMetadata.collection}
                      onChange={(e) => setNftMetadata({...nftMetadata, collection: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      placeholder="Art Collection"
                    />
                  </div>
                  
                  {nftMetadata.attributes.length > 0 && (
                    <div>
                      <label className="block text-gray-300 mb-2">Attributs</label>
                      <div className="bg-gray-900 rounded-lg p-3 space-y-2">
                        {nftMetadata.attributes.map((attr, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-400">{attr.trait_type}</span>
                            <span className="text-white font-medium">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* NFTs sauvegardés */}
              {savedNFTs.length > 0 && (
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">NFTs sauvegardés</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {savedNFTs.map((nft) => (
                      <div key={nft.id} className="relative group">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                          <p className="text-white text-sm font-medium text-center mb-2">{nft.name}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setGeneratedArt(nft.image);
                                setNftMetadata({
                                  name: nft.name,
                                  description: nft.description,
                                  collection: nft.collection,
                                  attributes: nft.attributes
                                });
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Charger
                            </button>
                            <button
                              onClick={() => deleteNFT(nft.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NFTStudio;