import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import { Upload, Download, RotateCw, Save, Undo, Redo, Image, 
         Sliders, Sun, Contrast, Droplets, Zap, Eye, 
         Palette, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackEvent } from '../utils/analytics';

const AIImageEditor = () => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('filters');
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sharpen: 0,
    hue: 0,
    sepia: 0,
    grayscale: 0
  });

  const filters = [
    { name: 'Original', filter: 'none' },
    { name: 'Vintage', filter: 'sepia(80%) contrast(85%) brightness(90%)' },
    { name: 'Noir', filter: 'grayscale(100%) contrast(130%)' },
    { name: 'Cool', filter: 'hue-rotate(180deg) saturate(140%)' },
    { name: 'Warm', filter: 'hue-rotate(30deg) saturate(120%) brightness(110%)' },
    { name: 'Dramatic', filter: 'contrast(140%) brightness(90%) saturate(120%)' },
    { name: 'Fade', filter: 'contrast(85%) brightness(120%) saturate(80%)' },
    { name: 'Chrome', filter: 'saturate(150%) contrast(120%)' }
  ];

  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      applyCurrentEffects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustments, previewUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setHistory([reader.result]);
        setCurrentHistoryIndex(0);
        trackEvent('ai_image_editor', 'upload_image', file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setHistory([reader.result]);
        setCurrentHistoryIndex(0);
        trackEvent('ai_image_editor', 'drop_image', file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCurrentEffects = () => {
    if (!previewUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Impossible d\'obtenir le contexte 2D du canvas');
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        // Appliquer les filtres CSS
        const filterString = `
          brightness(${adjustments.brightness}%) 
          contrast(${adjustments.contrast}%) 
          saturate(${adjustments.saturation}%)
          blur(${adjustments.blur}px)
          hue-rotate(${adjustments.hue}deg)
          sepia(${adjustments.sepia}%)
          grayscale(${adjustments.grayscale}%)
        `;

        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0);

        // Appliquer la netteté si nécessaire
        if (adjustments.sharpen > 0) {
          applySharpen(ctx, canvas.width, canvas.height, adjustments.sharpen);
        }
      } catch (error) {
        console.error('Erreur lors de l\'application des effets:', error);
        // Réessayer sans filtres si erreur
        ctx.filter = 'none';
        ctx.drawImage(img, 0, 0);
      }
    };

    img.onerror = () => {
      console.error('Erreur de chargement de l\'image');
      // Afficher un message d'erreur
      const canvas = canvasRef.current; // Définir canvas ici pour cette portée
      const ctx = canvas ? canvas.getContext('2d') : null;
      
      if (canvas && ctx) {
        canvas.width = 400;
        canvas.height = 300;
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Erreur de chargement de l\'image', canvas.width/2, canvas.height/2);
      }
    };

    // Essayer de charger l'image
    if (history[currentHistoryIndex]) {
      img.src = history[currentHistoryIndex];
    } else {
      img.src = previewUrl;
    }
  };

  const applySharpen = (ctx, width, height, amount) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const factor = amount / 100;

    const weights = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);

    const output = ctx.createImageData(width, height);
    const dst = output.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dstOff = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;

            if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
              const srcOff = (scy * width + scx) * 4;
              const wt = weights[cy * side + cx];

              r += data[srcOff] * wt;
              g += data[srcOff + 1] * wt;
              b += data[srcOff + 2] * wt;
            }
          }
        }

        dst[dstOff] = Math.min(255, Math.max(0, r * factor + data[dstOff] * (1 - factor)));
        dst[dstOff + 1] = Math.min(255, Math.max(0, g * factor + data[dstOff + 1] * (1 - factor)));
        dst[dstOff + 2] = Math.min(255, Math.max(0, b * factor + data[dstOff + 2] * (1 - factor)));
        dst[dstOff + 3] = data[dstOff + 3];
      }
    }

    ctx.putImageData(output, 0, 0);
  };

  const applyFilter = (filter) => {
    if (!canvasRef.current) return;

    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setProcessing(false);
      return;
    }

    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = filter.filter;
      ctx.drawImage(img, 0, 0);
      
      saveToHistory(canvas.toDataURL());
      setProcessing(false);
    };

    img.src = previewUrl;
  };

  const saveToHistory = (dataUrl) => {
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setPreviewUrl(dataUrl);
  };

  const handleAdjustmentChange = (property, value) => {
    setAdjustments(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sharpen: 0,
      hue: 0,
      sepia: 0,
      grayscale: 0
    });
  };

  const saveCurrentEdit = () => {
    if (!canvasRef.current) return;
    saveToHistory(canvasRef.current.toDataURL());
    trackEvent('ai_image_editor', 'save_edit');
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setPreviewUrl(history[currentHistoryIndex - 1]);
      trackEvent('ai_image_editor', 'undo');
    }
  };

  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setPreviewUrl(history[currentHistoryIndex + 1]);
      trackEvent('ai_image_editor', 'redo');
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `edited-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    toast.success('Image téléchargée !');
    trackEvent('ai_image_editor', 'download_image');
  };

  const reset = () => {
    if (history.length > 0) {
      setPreviewUrl(history[0]);
      setCurrentHistoryIndex(0);
      resetAdjustments();
      trackEvent('ai_image_editor', 'reset_image');
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>AI Image Editor - BestoolsVerse</title>
        <meta name="description" content="Éditeur d'images AI avec filtres, ajustements et effets avancés" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              AI Image Editor
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Éditez vos images avec des outils d'IA avancés. Appliquez des filtres, ajustez les paramètres et créez des effets époustouflants.
            </p>
          </div>

          {!previewUrl ? (
            <div className="max-w-2xl mx-auto">
              <div
                className="bg-white rounded-2xl shadow-xl p-12 border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Upload className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Télécharger une image</h3>
                  <p className="text-gray-600 mb-4">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow">
                    Choisir une image
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Toolbar */}
                <div className="bg-gray-50 border-b p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={undo}
                        disabled={currentHistoryIndex <= 0}
                        className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Annuler"
                      >
                        <Undo className="w-5 h-5" />
                      </button>
                      <button
                        onClick={redo}
                        disabled={currentHistoryIndex >= history.length - 1}
                        className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refaire"
                      >
                        <Redo className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-2" />
                      <button
                        onClick={reset}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                        title="Réinitialiser"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={saveCurrentEdit}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                        title="Sauvegarder"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Nouvelle image
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row">
                  {/* Sidebar */}
                  <div className="lg:w-80 bg-gray-50 p-4 border-r">
                    {/* Tabs */}
                    <div className="flex mb-4 bg-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('filters')}
                        className={`flex-1 py-2 px-3 rounded-md transition-colors ${
                          activeTab === 'filters'
                            ? 'bg-white text-purple-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Filter className="w-4 h-4 inline-block mr-1" />
                        Filtres
                      </button>
                      <button
                        onClick={() => setActiveTab('adjustments')}
                        className={`flex-1 py-2 px-3 rounded-md transition-colors ${
                          activeTab === 'adjustments'
                            ? 'bg-white text-purple-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Sliders className="w-4 h-4 inline-block mr-1" />
                        Ajustements
                      </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'filters' ? (
                      <div className="space-y-2">
                        {filters.map((filter) => (
                          <button
                            key={filter.name}
                            onClick={() => applyFilter(filter)}
                            className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            <span className="font-medium">{filter.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Brightness */}
                        <div>
                          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              Luminosité
                            </span>
                            <span>{adjustments.brightness}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={adjustments.brightness}
                            onChange={(e) => handleAdjustmentChange('brightness', e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Contrast */}
                        <div>
                          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-2">
                              <Contrast className="w-4 h-4" />
                              Contraste
                            </span>
                            <span>{adjustments.contrast}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={adjustments.contrast}
                            onChange={(e) => handleAdjustmentChange('contrast', e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Saturation */}
                        <div>
                          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-2">
                              <Droplets className="w-4 h-4" />
                              Saturation
                            </span>
                            <span>{adjustments.saturation}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={adjustments.saturation}
                            onChange={(e) => handleAdjustmentChange('saturation', e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Blur */}
                        <div>
                          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Flou
                            </span>
                            <span>{adjustments.blur}px</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={adjustments.blur}
                            onChange={(e) => handleAdjustmentChange('blur', e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Sharpen */}
                        <div>
                          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Netteté
                            </span>
                            <span>{adjustments.sharpen}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={adjustments.sharpen}
                            onChange={(e) => handleAdjustmentChange('sharpen', e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Hue */}
                        <div>
                          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                            <span className="flex items-center gap-2">
                              <Palette className="w-4 h-4" />
                              Teinte
                            </span>
                            <span>{adjustments.hue}°</span>
                          </label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={adjustments.hue}
                            onChange={(e) => handleAdjustmentChange('hue', e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <button
                          onClick={resetAdjustments}
                          className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                          Réinitialiser les ajustements
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Canvas Area */}
                  <div className="flex-1 p-8 bg-gray-100">
                    {processing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <div className="bg-white rounded-lg p-6">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p>Traitement en cours...</p>
                        </div>
                      </div>
                    )}
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto mx-auto"
                      style={{
                        filter: `
                          brightness(${adjustments.brightness}%)
                          contrast(${adjustments.contrast}%)
                          saturate(${adjustments.saturation}%)
                          blur(${adjustments.blur}px)
                          hue-rotate(${adjustments.hue}deg)
                          sepia(${adjustments.sepia}%)
                          grayscale(${adjustments.grayscale}%)
                        `
                      }}
                    />
                    {previewUrl && !canvasRef.current && (
                      <img
                        ref={imageRef}
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full h-auto mx-auto"
                        style={{
                          filter: `
                            brightness(${adjustments.brightness}%)
                            contrast(${adjustments.contrast}%)
                            saturate(${adjustments.saturation}%)
                            blur(${adjustments.blur}px)
                            hue-rotate(${adjustments.hue}deg)
                            sepia(${adjustments.sepia}%)
                            grayscale(${adjustments.grayscale}%)
                          `
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AIImageEditor;