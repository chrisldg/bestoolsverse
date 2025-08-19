import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import { ChevronLeft, Palette, Download, Copy, RefreshCw, Save, Trash2, Lock, Unlock, Eye, EyeOff, Upload, Shuffle, Droplet, X } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const ColorPaletteCreator = () => {
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [palettes, setPalettes] = useState([]);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [colorScheme, setColorScheme] = useState('monochromatic');
  const [lockedColors, setLockedColors] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [palettePreview, setPalettePreview] = useState('cards');
  const [exportFormat, setExportFormat] = useState('hex');
  const fileInputRef = useRef(null);

  const colorSchemes = [
    { id: 'monochromatic', name: 'Monochromatique', description: 'Variations d\'une seule couleur' },
    { id: 'analogous', name: 'Analogues', description: 'Couleurs adjacentes sur le cercle' },
    { id: 'complementary', name: 'Complémentaires', description: 'Couleurs opposées' },
    { id: 'triadic', name: 'Triadique', description: 'Trois couleurs équidistantes' },
    { id: 'tetradic', name: 'Tétradique', description: 'Quatre couleurs en rectangle' },
    { id: 'split', name: 'Split-complémentaire', description: 'Une couleur et deux adjacentes à sa complémentaire' }
  ];

  useEffect(() => {
    // Charger les palettes sauvegardées
    const saved = localStorage.getItem('savedColorPalettes');
    if (saved) {
      setSavedPalettes(JSON.parse(saved));
    }
    
    // Générer une palette initiale
    generatePalettes();
  }, []);

  useEffect(() => {
    generatePalettes();
  }, [baseColor, colorScheme]);

  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const generatePalettes = () => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let newPalettes = [];

    switch (colorScheme) {
      case 'monochromatic':
        newPalettes = generateMonochromatic(hsl);
        break;
      case 'analogous':
        newPalettes = generateAnalogous(hsl);
        break;
      case 'complementary':
        newPalettes = generateComplementary(hsl);
        break;
      case 'triadic':
        newPalettes = generateTriadic(hsl);
        break;
      case 'tetradic':
        newPalettes = generateTetradic(hsl);
        break;
      case 'split':
        newPalettes = generateSplitComplementary(hsl);
        break;
      default:
        newPalettes = generateMonochromatic(hsl);
    }

    // Préserver les couleurs verrouillées
    const finalPalettes = newPalettes.map((palette, index) => {
      if (lockedColors.includes(index) && palettes[index]) {
        return palettes[index];
      }
      return palette;
    });

    setPalettes(finalPalettes);
  };

  const generateMonochromatic = (hsl) => {
    const colors = [];
    const variations = [
      { l: Math.max(10, hsl.l - 40) },
      { l: Math.max(20, hsl.l - 20) },
      { l: hsl.l },
      { l: Math.min(80, hsl.l + 20) },
      { l: Math.min(90, hsl.l + 40) }
    ];

    variations.forEach(variation => {
      const rgb = hslToRgb(hsl.h, hsl.s, variation.l);
      colors.push({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb: rgb,
        hsl: { h: hsl.h, s: hsl.s, l: variation.l }
      });
    });

    return colors;
  };

  const generateAnalogous = (hsl) => {
    const colors = [];
    const angles = [-60, -30, 0, 30, 60];

    angles.forEach(angle => {
      const newHue = (hsl.h + angle + 360) % 360;
      const rgb = hslToRgb(newHue, hsl.s, hsl.l);
      colors.push({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb: rgb,
        hsl: { h: newHue, s: hsl.s, l: hsl.l }
      });
    });

    return colors;
  };

  const generateComplementary = (hsl) => {
    const colors = [];
    const complementHue = (hsl.h + 180) % 360;
    
    // Variations de la couleur de base
    colors.push(...generateMonochromatic(hsl).slice(0, 3));
    
    // Variations de la couleur complémentaire
    const complementHsl = { h: complementHue, s: hsl.s, l: hsl.l };
    colors.push(...generateMonochromatic(complementHsl).slice(2, 5));

    return colors.slice(0, 5);
  };

  const generateTriadic = (hsl) => {
    const colors = [];
    const angles = [0, 120, 240];
    
    angles.forEach(angle => {
      const newHue = (hsl.h + angle) % 360;
      const rgb = hslToRgb(newHue, hsl.s, hsl.l);
      colors.push({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb: rgb,
        hsl: { h: newHue, s: hsl.s, l: hsl.l }
      });
    });

    // Ajouter des variations
    const lightRgb = hslToRgb(hsl.h, hsl.s, Math.min(90, hsl.l + 20));
    const darkRgb = hslToRgb((hsl.h + 120) % 360, hsl.s, Math.max(20, hsl.l - 20));
    
    colors.push({
      hex: rgbToHex(lightRgb.r, lightRgb.g, lightRgb.b),
      rgb: lightRgb,
      hsl: { h: hsl.h, s: hsl.s, l: Math.min(90, hsl.l + 20) }
    });
    
    colors.push({
      hex: rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b),
      rgb: darkRgb,
      hsl: { h: (hsl.h + 120) % 360, s: hsl.s, l: Math.max(20, hsl.l - 20) }
    });

    return colors;
  };

  const generateTetradic = (hsl) => {
    const colors = [];
    const angles = [0, 90, 180, 270];
    
    angles.forEach(angle => {
      const newHue = (hsl.h + angle) % 360;
      const rgb = hslToRgb(newHue, hsl.s, hsl.l);
      colors.push({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb: rgb,
        hsl: { h: newHue, s: hsl.s, l: hsl.l }
      });
    });

    // Ajouter une variation neutre
    const neutralRgb = hslToRgb(hsl.h, 10, 50);
    colors.push({
      hex: rgbToHex(neutralRgb.r, neutralRgb.g, neutralRgb.b),
      rgb: neutralRgb,
      hsl: { h: hsl.h, s: 10, l: 50 }
    });

    return colors;
  };

  const generateSplitComplementary = (hsl) => {
    const colors = [];
    const complementHue = (hsl.h + 180) % 360;
    
    // Couleur de base
    const baseRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    colors.push({
      hex: rgbToHex(baseRgb.r, baseRgb.g, baseRgb.b),
      rgb: baseRgb,
      hsl: hsl
    });

    // Couleurs split (adjacentes à la complémentaire)
    const split1 = (complementHue - 30 + 360) % 360;
    const split2 = (complementHue + 30) % 360;
    
    const split1Rgb = hslToRgb(split1, hsl.s, hsl.l);
    const split2Rgb = hslToRgb(split2, hsl.s, hsl.l);
    
    colors.push({
      hex: rgbToHex(split1Rgb.r, split1Rgb.g, split1Rgb.b),
      rgb: split1Rgb,
      hsl: { h: split1, s: hsl.s, l: hsl.l }
    });
    
    colors.push({
      hex: rgbToHex(split2Rgb.r, split2Rgb.g, split2Rgb.b),
      rgb: split2Rgb,
      hsl: { h: split2, s: hsl.s, l: hsl.l }
    });

    // Variations
    const lightRgb = hslToRgb(hsl.h, hsl.s, Math.min(90, hsl.l + 30));
    const darkRgb = hslToRgb(split1, hsl.s, Math.max(20, hsl.l - 30));
    
    colors.push({
      hex: rgbToHex(lightRgb.r, lightRgb.g, lightRgb.b),
      rgb: lightRgb,
      hsl: { h: hsl.h, s: hsl.s, l: Math.min(90, hsl.l + 30) }
    });
    
    colors.push({
      hex: rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b),
      rgb: darkRgb,
      hsl: { h: split1, s: hsl.s, l: Math.max(20, hsl.l - 30) }
    });

    return colors;
  };

  const generateRandomPalette = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setBaseColor(randomColor);
    setLockedColors([]);
    trackEvent('color_palette', 'generate_random');
  };

  const toggleColorLock = (index) => {
    setLockedColors(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    trackEvent('color_palette', 'copy_color', text);
  };

  const copyPalette = () => {
    let paletteText = '';
    
    switch (exportFormat) {
      case 'hex':
        paletteText = palettes.map(color => color.hex).join(', ');
        break;
      case 'rgb':
        paletteText = palettes.map(color => `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`).join(', ');
        break;
      case 'hsl':
        paletteText = palettes.map(color => `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`).join(', ');
        break;
      case 'css':
        paletteText = palettes.map((color, index) => `--color-${index + 1}: ${color.hex};`).join('\n');
        break;
      case 'scss':
        paletteText = palettes.map((color, index) => `$color-${index + 1}: ${color.hex};`).join('\n');
        break;
      case 'json':
        paletteText = JSON.stringify(palettes.map(color => ({
          hex: color.hex,
          rgb: color.rgb,
          hsl: color.hsl
        })), null, 2);
        break;
    }
    
    navigator.clipboard.writeText(paletteText);
    alert('Palette copiée dans le presse-papier !');
    trackEvent('color_palette', 'copy_palette', exportFormat);
  };

  const downloadPalette = () => {
    let content = '';
    let filename = '';
    let mimeType = '';
    
    switch (exportFormat) {
      case 'ase':
        // Créer un fichier ASE basique (format simplifié)
        const aseContent = createSimpleASE(palettes);
        const blob = new Blob([aseContent], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'palette.ase';
        a.click();
        URL.revokeObjectURL(url);
        break;
      case 'json':
        content = JSON.stringify({
          name: `Palette_${new Date().toISOString()}`,
          scheme: colorScheme,
          colors: palettes.map(color => ({
            hex: color.hex,
            rgb: color.rgb,
            hsl: color.hsl
          }))
        }, null, 2);
        filename = 'palette.json';
        mimeType = 'application/json';
        break;
      case 'css':
        content = `:root {\n${palettes.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join('\n')}\n}`;
        filename = 'palette.css';
        mimeType = 'text/css';
        break;
      case 'scss':
        content = palettes.map((color, index) => `$color-${index + 1}: ${color.hex};`).join('\n');
        filename = 'palette.scss';
        mimeType = 'text/plain';
        break;
      default:
        content = palettes.map(color => color.hex).join('\n');
        filename = 'palette.txt';
        mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    trackEvent('color_palette', 'download_palette', exportFormat);
  };

  const createSimpleASE = (colors) => {
    // Format ASE simplifié - structure basique
    let content = 'ASEF'; // Signature
    content += '\x00\x01\x00\x00'; // Version
    content += String.fromCharCode(0, 0, 0, colors.length * 3); // Nombre de blocs
    
    colors.forEach(color => {
      // Convertir hex en RGB
      const rgb = hexToRgb(color.hex);
      content += '\x00\x01'; // Type de couleur (RGB)
      content += String.fromCharCode(0, color.hex.length);
      content += color.hex;
      content += 'RGB ';
      content += String.fromCharCode(rgb.r / 255, rgb.g / 255, rgb.b / 255);
      content += '\x00\x00'; // Fin du bloc
    });
    
    return content;
  };

  const savePalette = () => {
    const name = prompt('Nom de la palette :');
    if (!name) return;
    
    const newPalette = {
      id: Date.now(),
      name,
      scheme: colorScheme,
      colors: palettes,
      createdAt: new Date().toISOString()
    };
    
    const newSaved = [...savedPalettes, newPalette];
    setSavedPalettes(newSaved);
    saveToLocalStorage('savedColorPalettes', newSaved);
    
    trackEvent('color_palette', 'save_palette', name);
  };

  const loadPalette = (saved) => {
    setPalettes(saved.colors);
    setColorScheme(saved.scheme);
    if (saved.colors.length > 0) {
      setBaseColor(saved.colors[0].hex);
    }
    setActiveTab('generator');
  };

  const deletePalette = (id) => {
    const newSaved = savedPalettes.filter(p => p.id !== id);
    setSavedPalettes(newSaved);
    saveToLocalStorage('savedColorPalettes', newSaved);
  };

  const extractColorsFromImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Extraire les couleurs principales (algorithme simplifié)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const colorMap = {};
        
        // Échantillonner les pixels
        for (let i = 0; i < pixels.length; i += 4 * 10) { // Échantillonner tous les 10 pixels
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Quantifier les couleurs
          const quantR = Math.floor(r / 16) * 16;
          const quantG = Math.floor(g / 16) * 16;
          const quantB = Math.floor(b / 16) * 16;
          
          const key = `${quantR},${quantG},${quantB}`;
          colorMap[key] = (colorMap[key] || 0) + 1;
        }
        
        // Trier par fréquence et prendre les 5 couleurs principales
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        const extractedColors = sortedColors.map(([colorStr]) => {
          const [r, g, b] = colorStr.split(',').map(Number);
          const hex = rgbToHex(r, g, b);
          const hsl = rgbToHsl(r, g, b);
          return { hex, rgb: { r, g, b }, hsl };
        });
        
        setPalettes(extractedColors);
        if (extractedColors.length > 0) {
          setBaseColor(extractedColors[0].hex);
        }
        
        trackEvent('color_palette', 'extract_from_image');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const adjustColor = (colorIndex, property, value) => {
    const color = palettes[colorIndex];
    if (!color) return;
    
    let newHsl = { ...color.hsl };
    
    switch (property) {
      case 'hue':
        newHsl.h = parseInt(value);
        break;
      case 'saturation':
        newHsl.s = parseInt(value);
        break;
      case 'lightness':
        newHsl.l = parseInt(value);
        break;
    }
    
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    const newPalettes = [...palettes];
    newPalettes[colorIndex] = { hex, rgb, hsl: newHsl };
    setPalettes(newPalettes);
  };

  const getContrastRatio = (color1, color2) => {
    const luminance = (rgb) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const l1 = luminance(color1.rgb);
    const l2 = luminance(color2.rgb);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  return (
    <Layout 
      title="Créateur de Palettes de Couleurs" 
      description="Créez des palettes de couleurs harmonieuses pour vos projets de design"
      keywords="palette couleurs, générateur couleurs, color picker, design tools"
    >
      <Helmet>
        <title>Créateur de Palettes de Couleurs | BestoolsVerse</title>
        <meta name="description" content="Créez des palettes de couleurs harmonieuses pour vos projets de design" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => window.history.back()}
            className="mb-6 flex items-center text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} className="mr-2" />
            Retour aux outils
          </button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">Color Palette Creator 🎨</h1>
            <p className="text-xl text-gray-200">Créez des palettes de couleurs harmonieuses pour vos projets</p>
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
                Palettes sauvegardées ({savedPalettes.length})
              </button>
            </div>
          </div>

          {activeTab === 'generator' ? (
            <div className="space-y-6">
              {/* Contrôles */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Couleur de base */}
                  <div>
                    <label className="block text-white mb-2">Couleur de base</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="w-20 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300"
                        placeholder="#000000"
                      />
                      <button
                        onClick={generateRandomPalette}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        title="Couleur aléatoire"
                      >
                        <Shuffle size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Schéma de couleurs */}
                  <div>
                    <label className="block text-white mb-2">Schéma de couleurs</label>
                    <select
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white"
                    >
                      {colorSchemes.map(scheme => (
                        <option key={scheme.id} value={scheme.id} className="bg-gray-800">
                          {scheme.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div>
                    <label className="block text-white mb-2">Actions</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Upload size={20} className="mr-2" />
                        Image
                      </button>
                      <button
                        onClick={savePalette}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Save size={20} className="mr-2" />
                        Sauver
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={extractColorsFromImage}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Palette générée */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Palette générée</h3>
                  <div className="flex gap-2">
                    <select
                      value={palettePreview}
                      onChange={(e) => setPalettePreview(e.target.value)}
                      className="px-3 py-1 bg-white bg-opacity-20 border border-gray-300 rounded text-white text-sm"
                    >
                      <option value="cards" className="bg-gray-800">Cartes</option>
                      <option value="strip" className="bg-gray-800">Bande</option>
                      <option value="circles" className="bg-gray-800">Cercles</option>
                    </select>
                  </div>
                </div>

                {/* Affichage de la palette */}
                {palettePreview === 'cards' && (
                  <div className="grid grid-cols-5 gap-4">
                    {palettes.map((color, index) => (
                      <div key={index} className="space-y-2">
                        <div
                          className="h-32 rounded-lg shadow-lg relative group cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => {
                            setSelectedColorIndex(index);
                            setShowColorPicker(true);
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleColorLock(index);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {lockedColors.includes(index) ? 
                              <Lock size={16} className="text-white" /> : 
                              <Unlock size={16} className="text-white" />
                            }
                          </button>
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => copyToClipboard(color.hex)}
                            className="w-full px-2 py-1 bg-white bg-opacity-20 text-white text-sm rounded hover:bg-opacity-30 transition-all"
                          >
                            {color.hex}
                          </button>
                          <div className="text-xs text-gray-300 text-center">
                            RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {palettePreview === 'strip' && (
                  <div className="h-32 rounded-lg overflow-hidden flex">
                    {palettes.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 relative group cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyToClipboard(color.hex)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 transition-opacity">
                          <span className="text-white text-sm font-medium">{color.hex}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {palettePreview === 'circles' && (
                  <div className="flex justify-center gap-4">
                    {palettes.map((color, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="w-24 h-24 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => copyToClipboard(color.hex)}
                        />
                        <div className="mt-2 text-sm text-white">{color.hex}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ajustements de couleur */}
              {selectedColorIndex !== null && showColorPicker && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Ajuster la couleur {selectedColorIndex + 1}
                    </h3>
                    <button
                      onClick={() => {
                        setShowColorPicker(false);
                        setSelectedColorIndex(null);
                      }}
                      className="text-white hover:text-gray-300"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Teinte</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={palettes[selectedColorIndex]?.hsl.h || 0}
                        onChange={(e) => adjustColor(selectedColorIndex, 'hue', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Saturation</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={palettes[selectedColorIndex]?.hsl.s || 0}
                        onChange={(e) => adjustColor(selectedColorIndex, 'saturation', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Luminosité</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={palettes[selectedColorIndex]?.hsl.l || 0}
                        onChange={(e) => adjustColor(selectedColorIndex, 'lightness', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contraste et accessibilité */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4">Contraste et accessibilité</h3>
                <div className="grid grid-cols-5 gap-2">
                  {palettes.map((color1, i) => (
                    <div key={i}>
                      {palettes.map((color2, j) => {
                        if (i === j) return null;
                        const ratio = getContrastRatio(color1, color2);
                        const isAccessible = ratio >= 4.5;
                        return (
                          <div
                            key={`${i}-${j}`}
                            className={`p-2 mb-1 rounded text-xs text-center ${
                              isAccessible ? 'bg-green-600' : 'bg-red-600'
                            } bg-opacity-50`}
                          >
                            {ratio.toFixed(1)}:1
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-300 mt-4">
                  Les ratios de contraste ≥ 4.5:1 sont conformes aux normes WCAG AA pour le texte normal.
                </p>
              </div>

              {/* Export */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4">Exporter la palette</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Format d'export</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white"
                    >
                      <option value="hex" className="bg-gray-800">HEX</option>
                      <option value="rgb" className="bg-gray-800">RGB</option>
                      <option value="hsl" className="bg-gray-800">HSL</option>
                      <option value="css" className="bg-gray-800">CSS Variables</option>
                      <option value="scss" className="bg-gray-800">SCSS Variables</option>
                      <option value="json" className="bg-gray-800">JSON</option>
                    </select>
                  </div>
                  <div className="flex gap-2 items-end">
                    <button
                      onClick={copyPalette}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Copy size={20} className="mr-2" />
                      Copier
                    </button>
                    <button
                      onClick={downloadPalette}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Download size={20} className="mr-2" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-6">Palettes sauvegardées</h3>
              
              {savedPalettes.length === 0 ? (
                <p className="text-gray-300 text-center py-8">
                  Aucune palette sauvegardée. Créez et sauvegardez vos premières palettes !
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {savedPalettes.map(palette => (
                    <div key={palette.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{palette.name}</h4>
                          <p className="text-sm text-gray-300">
                            {palette.scheme} • {new Date(palette.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadPalette(palette)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deletePalette(palette.id)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex-1 h-8 rounded cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => copyToClipboard(color.hex)}
                            title={color.hex}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ColorPaletteCreator;