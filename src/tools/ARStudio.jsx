// src/tools/ARStudio.jsx
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Glasses, Box, Globe, Camera, Download, Share2, Settings, Play, Pause, RotateCcw, Move3D, Eye, Smartphone, QrCode } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { getSafeCanvasContext, safeLocalStorage } from '../components/ToolErrorWrapper';

const ARStudio = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [previewMode, setPreviewMode] = useState('3d');
  const [modelSettings, setModelSettings] = useState({
    scale: 1,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    color: '#3B82F6'
  });
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedTexture, setSelectedTexture] = useState('default');
  const [error, setError] = useState(null);

  const catalogItems = [
    { id: 1, name: 'Cube AR', type: 'geometry', icon: '📦', description: 'Cube 3D simple' },
    { id: 2, name: 'Sphère', type: 'geometry', icon: '🔮', description: 'Sphère parfaite' },
    { id: 3, name: 'Pyramide', type: 'geometry', icon: '🔺', description: 'Pyramide triangulaire' },
    { id: 4, name: 'Cylindre', type: 'geometry', icon: '🥫', description: 'Cylindre 3D' },
    { id: 5, name: 'Torus', type: 'geometry', icon: '🍩', description: 'Forme toroïdale' },
    { id: 6, name: 'Étoile', type: 'geometry', icon: '⭐', description: 'Étoile 3D' }
  ];

  const textures = [
    { id: 'default', name: 'Défaut', color: '#3B82F6' },
    { id: 'metal', name: 'Métal', color: '#6B7280' },
    { id: 'wood', name: 'Bois', color: '#92400E' },
    { id: 'glass', name: 'Verre', color: '#DBEAFE' },
    { id: 'neon', name: 'Néon', color: '#F59E0B' }
  ];

  // Nettoyer l'animation au démontage
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Initialiser le canvas
  useEffect(() => {
    if (canvasRef.current && selectedItem) {
      initCanvas();
      if (isPlaying) {
        animate();
      }
    }
  }, [selectedItem, isPlaying]);

  // Charger les paramètres sauvegardés
  useEffect(() => {
    const saved = safeLocalStorage.getItem('arStudioSettings');
    if (saved) {
      setModelSettings(saved.modelSettings || modelSettings);
      setSelectedTexture(saved.selectedTexture || 'default');
      setZoom(saved.zoom || 1);
    }
  }, []);

  // Sauvegarder les paramètres
  useEffect(() => {
    if (selectedItem) {
      safeLocalStorage.setItem('arStudioSettings', {
        modelSettings,
        selectedTexture,
        zoom
      });
    }
  }, [modelSettings, selectedTexture, zoom, selectedItem]);

  const initCanvas = () => {
    const ctx = getSafeCanvasContext(canvasRef);
    if (!ctx) {
      setError('Impossible d\'initialiser le canvas');
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Nettoyer le canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const animate = () => {
    if (!isPlaying || !canvasRef.current) return;

    const ctx = getSafeCanvasContext(canvasRef);
    if (!ctx) return;

    const canvas = canvasRef.current;
    
    // Effacer le canvas
    ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner l'objet 3D simulé
    drawObject3D(ctx, canvas.width, canvas.height);

    // Rotation automatique
    if (isPlaying) {
      setModelSettings(prev => ({
        ...prev,
        rotation: {
          ...prev.rotation,
          y: (prev.rotation.y + 1) % 360
        }
      }));
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawObject3D = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3 * modelSettings.scale * zoom;

    ctx.save();
    ctx.translate(centerX + modelSettings.position.x, centerY + modelSettings.position.y);
    
    // Rotation simplifiée
    const rotX = (modelSettings.rotation.x * Math.PI) / 180;
    const rotY = (modelSettings.rotation.y * Math.PI) / 180;
    const rotZ = (modelSettings.rotation.z * Math.PI) / 180;

    // Dessiner selon le type d'objet
    if (selectedItem) {
      const texture = textures.find(t => t.id === selectedTexture);
      ctx.strokeStyle = texture?.color || '#3B82F6';
      ctx.lineWidth = 2;

      switch (selectedItem.id) {
        case 1: // Cube
          drawCube(ctx, size, rotX, rotY, rotZ);
          break;
        case 2: // Sphère
          drawSphere(ctx, size);
          break;
        case 3: // Pyramide
          drawPyramid(ctx, size, rotX, rotY, rotZ);
          break;
        case 4: // Cylindre
          drawCylinder(ctx, size);
          break;
        case 5: // Torus
          drawTorus(ctx, size);
          break;
        case 6: // Étoile
          drawStar(ctx, size);
          break;
        default:
          drawCube(ctx, size, rotX, rotY, rotZ);
      }
    }

    ctx.restore();
  };

  const drawCube = (ctx, size, rotX, rotY, rotZ) => {
    // Dessiner un cube simple en 2D avec perspective
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Face arrière
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // Face avant
    ];

    // Appliquer les rotations
    const rotatedVertices = vertices.map(v => {
      let [x, y, z] = v;
      
      // Rotation Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const newX = x * cosY - z * sinY;
      const newZ = x * sinY + z * cosY;
      x = newX;
      z = newZ;

      // Rotation X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const newY = y * cosX - z * sinX;
      const newZ2 = y * sinX + z * cosX;
      y = newY;
      z = newZ2;

      return [x * size/2, y * size/2, z];
    });

    // Projeter en 2D
    const projected = rotatedVertices.map(v => {
      const perspective = 1 / (1 - v[2] / 1000);
      return [v[0] * perspective, v[1] * perspective];
    });

    // Dessiner les faces
    const faces = [
      [0, 1, 2, 3], // Arrière
      [4, 5, 6, 7], // Avant
      [0, 4, 7, 3], // Gauche
      [1, 5, 6, 2], // Droite
      [0, 1, 5, 4], // Bas
      [3, 2, 6, 7]  // Haut
    ];

    faces.forEach(face => {
      ctx.beginPath();
      face.forEach((vertexIndex, i) => {
        const [x, y] = projected[vertexIndex];
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.stroke();
    });
  };

  const drawSphere = (ctx, size) => {
    // Dessiner une sphère avec des cercles
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI;
      const radius = Math.sin(angle) * size;
      const y = Math.cos(angle) * size;
      
      ctx.beginPath();
      ctx.ellipse(0, y, radius, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Méridiens
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * Math.cos(angle), size, angle, 0, Math.PI);
      ctx.stroke();
    }
  };

  const drawPyramid = (ctx, size, rotX, rotY, rotZ) => {
    // Pyramide triangulaire
    const vertices = [
      [0, -size, 0],     // Sommet
      [-size, size, -size], // Base - coin 1
      [size, size, -size],  // Base - coin 2
      [0, size, size]       // Base - coin 3
    ];

    // Rotation simplifiée
    const rotatedVertices = vertices.map(v => {
      let [x, y, z] = v;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const newX = x * cosY - z * sinY;
      const newZ = x * sinY + z * cosY;
      return [newX, y, newZ];
    });

    // Dessiner les arêtes
    const edges = [
      [0, 1], [0, 2], [0, 3], // Du sommet vers la base
      [1, 2], [2, 3], [3, 1]  // Base
    ];

    edges.forEach(edge => {
      ctx.beginPath();
      ctx.moveTo(rotatedVertices[edge[0]][0], rotatedVertices[edge[0]][1]);
      ctx.lineTo(rotatedVertices[edge[1]][0], rotatedVertices[edge[1]][1]);
      ctx.stroke();
    });
  };

  const drawCylinder = (ctx, size) => {
    // Dessiner un cylindre
    const height = size * 1.5;
    const radius = size * 0.5;

    // Cercle du haut
    ctx.beginPath();
    ctx.ellipse(0, -height/2, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Cercle du bas
    ctx.beginPath();
    ctx.ellipse(0, height/2, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lignes verticales
    ctx.beginPath();
    ctx.moveTo(-radius, -height/2);
    ctx.lineTo(-radius, height/2);
    ctx.moveTo(radius, -height/2);
    ctx.lineTo(radius, height/2);
    ctx.stroke();
  };

  const drawTorus = (ctx, size) => {
    // Dessiner un torus simplifié
    const outerRadius = size;
    const innerRadius = size * 0.4;

    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const x = Math.cos(angle) * (outerRadius + innerRadius) / 2;
      const y = Math.sin(angle) * (outerRadius + innerRadius) / 2;
      
      ctx.beginPath();
      ctx.arc(x, y, (outerRadius - innerRadius) / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawStar = (ctx, size) => {
    // Dessiner une étoile
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCameraRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(3, prev + e.deltaY * -0.001)));
  };

  const exportModel = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `ar-model-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    trackEvent('ar_studio', 'export_model', selectedItem?.name);
  };

  const generateQRCode = () => {
    // Générer un QR code pour visualiser en AR sur mobile
    const arUrl = `https://bestoolsverse.com/ar-view/${selectedItem?.id}`;
    trackEvent('ar_studio', 'generate_qr', selectedItem?.name);
    
    // Ouvrir le générateur de QR code avec l'URL pré-remplie
    window.open(`/tools/qr-code?text=${encodeURIComponent(arUrl)}`, '_blank');
  };

  const resetView = () => {
    setModelSettings({
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      color: '#3B82F6'
    });
    setCameraRotation({ x: 0, y: 0 });
    setZoom(1);
    setSelectedTexture('default');
  };

  return (
    <Layout
      title="Studio AR"
      description="Créez et visualisez des modèles 3D en réalité augmentée"
      keywords="ar studio, réalité augmentée, modèles 3D, visualisation AR"
    >
      <Helmet>
        <title>Studio AR - Réalité Augmentée | BestoolsVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center">
              <Glasses className="mr-4 text-purple-500" size={48} />
              Studio AR
            </h1>
            <p className="text-gray-300 text-lg">
              Créez et visualisez des modèles 3D en réalité augmentée
            </p>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Panneau de contrôle */}
            <div className="lg:col-span-1 space-y-6">
              {/* Catalogue d'objets */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Catalogue d'objets</h3>
                <div className="grid grid-cols-2 gap-3">
                  {catalogItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        trackEvent('ar_studio', 'select_item', item.name);
                      }}
                      className={`p-4 rounded-lg transition-all ${
                        selectedItem?.id === item.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm">{item.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textures */}
              {selectedItem && (
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Textures</h3>
                  <div className="space-y-2">
                    {textures.map(texture => (
                      <button
                        key={texture.id}
                        onClick={() => setSelectedTexture(texture.id)}
                        className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                          selectedTexture === texture.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <span>{texture.name}</span>
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-500"
                          style={{ backgroundColor: texture.color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contrôles */}
              {selectedItem && (
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Contrôles</h3>
                  
                  {/* Scale */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">
                      Échelle: {modelSettings.scale.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={modelSettings.scale}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        scale: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>

                  {/* Rotation X */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">
                      Rotation X: {modelSettings.rotation.x}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={modelSettings.rotation.x}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        rotation: { ...prev.rotation, x: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                  </div>

                  {/* Rotation Y */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">
                      Rotation Y: {modelSettings.rotation.y}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={modelSettings.rotation.y}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        rotation: { ...prev.rotation, y: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                  </div>

                  {/* Rotation Z */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">
                      Rotation Z: {modelSettings.rotation.z}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={modelSettings.rotation.z}
                      onChange={(e) => setModelSettings(prev => ({
                        ...prev,
                        rotation: { ...prev.rotation, z: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={resetView}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <RotateCcw size={18} className="mr-2" />
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>

            {/* Zone de prévisualisation */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                {/* Barre d'outils */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <button
                      onClick={generateQRCode}
                      disabled={!selectedItem}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <QrCode size={20} />
                    </button>

                    <button
                      onClick={exportModel}
                      disabled={!selectedItem}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={20} />
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    {['3d', 'ar', 'vr'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setPreviewMode(mode)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          previewMode === mode
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {mode.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas de prévisualisation */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  {selectedItem ? (
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full cursor-move"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onWheel={handleWheel}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Box className="mx-auto text-gray-600 mb-4" size={64} />
                        <p className="text-gray-400 text-lg">
                          Sélectionnez un objet pour commencer
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Indicateur de mode */}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                    <span className="text-white text-sm">Mode: {previewMode.toUpperCase()}</span>
                  </div>

                  {/* Contrôles de zoom */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                    <span className="text-white text-sm">Zoom: {(zoom * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center text-gray-400 text-sm">
                  <p>Utilisez la souris pour faire pivoter • Molette pour zoomer • Boutons pour contrôler</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ARStudio;