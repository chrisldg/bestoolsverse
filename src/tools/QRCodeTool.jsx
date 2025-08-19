import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Download, Copy, Sliders, ImageIcon, Code, Palette, Layout } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { trackEvent } from '../utils/analytics';

const QRCodeTool = () => { // Nom corrigé
  const [text, setText] = useState('https://bestoolsverse.com');
  const [size, setSize] = useState(300);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cornerColor, setCornerColor] = useState('#000000');
  const [qrStyle, setQrStyle] = useState('dots');
  const [logoImage, setLogoImage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [isCopied, setIsCopied] = useState(false);
  const [errorLevel, setErrorLevel] = useState('H');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const qrRef = useRef(null);
  const qrCodeRef = useRef(null);

  // Initialiser et mettre à jour le QR code
  useEffect(() => {
    if (!qrRef.current) return;

    try {
      setError(null);
      setIsGenerating(true);

      // Configuration du QR code
      const options = {
        width: size,
        height: size,
        type: 'canvas',
        data: text || 'https://bestoolsverse.com',
        image: logoPreview || undefined,
        dotsOptions: {
          color: foregroundColor,
          type: qrStyle === 'dots' ? 'rounded' : 'square'
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          color: cornerColor,
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: cornerColor,
          type: 'dot'
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 5,
          imageSize: 0.4
        },
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: errorLevel
        }
      };

      // Créer ou mettre à jour le QR code
      if (!qrCodeRef.current) {
        qrCodeRef.current = new QRCodeStyling(options);
        qrCodeRef.current.append(qrRef.current);
      } else {
        qrCodeRef.current.update(options);
      }
      
      setIsGenerating(false);
    } catch (err) {
      console.error('Erreur génération QR Code:', err);
      setError('Erreur lors de la génération du QR Code');
      setIsGenerating(false);
    }
  }, [text, size, foregroundColor, backgroundColor, cornerColor, qrStyle, logoPreview, errorLevel]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Le logo ne doit pas dépasser 5MB');
        return;
      }
      
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.onerror = () => {
        setError('Erreur lors du chargement du logo');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (format = 'png') => {
    if (!qrCodeRef.current) return;
    
    try {
      trackEvent('qr_code_tool', 'download', format);
      
      await qrCodeRef.current.download({
        name: `qrcode-${Date.now()}`,
        extension: format
      });
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      setError('Erreur lors du téléchargement');
    }
  };

  const handleCopyToClipboard = async () => {
    if (!qrCodeRef.current) return;
    
    try {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) {
        setError('Impossible de copier le QR Code');
        return;
      }
      
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          trackEvent('qr_code_tool', 'copy_clipboard');
        } catch (err) {
          console.error('Erreur lors de la copie:', err);
          handleDownload('png'); // Fallback
        }
      });
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la copie');
    }
  };

  const presetStyles = [
    {
      name: 'Classic',
      style: 'squares',
      foreground: '#000000',
      background: '#ffffff',
      corners: '#000000'
    },
    {
      name: 'Ocean',
      style: 'dots',
      foreground: '#006994',
      background: '#E6F3FF',
      corners: '#004466'
    },
    {
      name: 'Sunset',
      style: 'dots',
      foreground: '#FF6B6B',
      background: '#FFE5B4',
      corners: '#FF4444'
    },
    {
      name: 'Forest',
      style: 'squares',
      foreground: '#228B22',
      background: '#F0FFF0',
      corners: '#006400'
    }
  ];

  const applyPresetStyle = (preset) => {
    setQrStyle(preset.style);
    setForegroundColor(preset.foreground);
    setBackgroundColor(preset.background);
    setCornerColor(preset.corners);
    trackEvent('qr_code_tool', 'apply_preset', preset.name);
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      className={`flex items-center py-3 px-4 border-b-2 transition-colors ${
        activeTab === id
          ? 'border-blue-500 text-blue-500'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={18} className="mr-2" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16">
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Générateur de QR Code Artistique</h1>
        
        {/* Afficher les erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panneau d'édition */}
          <div className="lg:col-span-1 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="flex border-b border-gray-700 mb-6">
              <TabButton id="content" icon={Code} label="Contenu" />
              <TabButton id="design" icon={Palette} label="Design" />
              <TabButton id="advanced" icon={Sliders} label="Avancé" />
            </div>
            
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">URL ou texte</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white min-h-[100px]"
                    placeholder="https://example.com ou votre texte"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Logo (optionnel)</label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center justify-center w-16 h-16 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded" />
                      ) : (
                        <ImageIcon size={24} className="text-gray-500" />
                      )}
                    </label>
                    {logoImage && (
                      <button
                        onClick={() => {
                          setLogoImage(null);
                          setLogoPreview(null);
                        }}
                        className="text-sm text-red-500 hover:text-red-400"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-3">Styles prédéfinis</label>
                  <div className="grid grid-cols-2 gap-2">
                    {presetStyles.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPresetStyle(preset)}
                        className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Style de points</label>
                  <select
                    value={qrStyle}
                    onChange={(e) => setQrStyle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                  >
                    <option value="dots">Points arrondis</option>
                    <option value="squares">Carrés</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Couleur principale</label>
                  <div className="flex">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-16 h-10 bg-gray-900 border border-gray-700 rounded-l-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-r-lg p-3 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Couleur de fond</label>
                  <div className="flex">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-10 bg-gray-900 border border-gray-700 rounded-l-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-r-lg p-3 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Taille (pixels)</label>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="50"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-gray-400 text-sm mt-1">
                    <span>200px</span>
                    <span>{size}px</span>
                    <span>800px</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Correction d'erreur</label>
                  <select 
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                  >
                    <option value="L">Faible (7%)</option>
                    <option value="M">Moyenne (15%)</option>
                    <option value="Q">Qualité (25%)</option>
                    <option value="H">Haute (30%)</option>
                  </select>
                  <p className="text-sm text-gray-400 mt-1">
                    Plus la correction est élevée, plus le QR code peut être endommagé tout en restant lisible.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Zone de prévisualisation */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Aperçu</h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={isGenerating}
                    className="flex items-center bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg px-4 py-2 disabled:opacity-50"
                  >
                    <Copy size={18} className="mr-2" />
                    {isCopied ? 'Copié !' : 'Copier'}
                  </button>
                  <button
                    onClick={() => handleDownload('png')}
                    disabled={isGenerating}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 disabled:opacity-50"
                  >
                    <Download size={18} className="mr-2" />
                    Télécharger
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center items-center p-6 bg-white rounded-xl min-h-[400px]">
                {isGenerating ? (
                  <div className="text-gray-500">Génération en cours...</div>
                ) : (
                  <div ref={qrRef}></div>
                )}
              </div>
              
              <div className="mt-6 w-full">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex mb-2">
                    <Layout size={18} className="text-gray-400 mr-2" />
                    <h4 className="text-gray-300">Exemples d'utilisation</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    • Carte de visite digitale<br />
                    • Menu de restaurant interactif<br />
                    • Lien vers vos réseaux sociaux<br />
                    • Accès WiFi pour vos invités<br />
                    • Partage facile d'informations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeTool;