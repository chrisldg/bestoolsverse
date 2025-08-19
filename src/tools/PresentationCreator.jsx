// src/tools/PresentationCreator.jsx
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Plus, Trash2, Edit3, Play, Monitor, Type, Image, BarChart, List, Move, Save, Download, ChevronRight, Copy, Upload, Bold, Italic, Underline } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const PresentationCreator = () => {
  const [presentation, setPresentation] = useState({
    title: 'Ma Présentation',
    theme: 'modern',
    slides: [
      {
        id: 1,
        type: 'title',
        content: {
          title: 'Titre de la Présentation',
          subtitle: 'Sous-titre',
          author: 'Votre nom'
        }
      }
    ]
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isPresentating, setIsPresentating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [speakerNotes, setSpeakerNotes] = useState({});
  const presentationRef = useRef(null);
  const fileInputRef = useRef(null);

  const themes = {
    modern: {
      name: 'Moderne',
      primary: '#3B82F6',
      secondary: '#1F2937',
      background: '#0F172A',
      text: '#F3F4F6',
      accent: '#10B981'
    },
    professional: {
      name: 'Professionnel',
      primary: '#4B5563',
      secondary: '#E5E7EB',
      background: '#FFFFFF',
      text: '#1F2937',
      accent: '#3B82F6'
    },
    creative: {
      name: 'Créatif',
      primary: '#8B5CF6',
      secondary: '#EC4899',
      background: '#1E1B4B',
      text: '#F3F4F6',
      accent: '#FBBF24'
    },
    minimal: {
      name: 'Minimal',
      primary: '#000000',
      secondary: '#6B7280',
      background: '#FAFAFA',
      text: '#111827',
      accent: '#EF4444'
    }
  };

  const slideTemplates = {
    title: { name: 'Titre', icon: Type },
    content: { name: 'Contenu', icon: List },
    image: { name: 'Image', icon: Image },
    chart: { name: 'Graphique', icon: BarChart }
  };

  const transitions = ['none', 'fade', 'slide', 'zoom'];
  const [selectedTransition, setSelectedTransition] = useState('fade');

  useEffect(() => {
    // Charger une présentation sauvegardée
    const savedPresentation = localStorage.getItem('currentPresentation');
    if (savedPresentation) {
      setPresentation(JSON.parse(savedPresentation));
    }

    const savedNotes = localStorage.getItem('speakerNotes');
    if (savedNotes) {
      setSpeakerNotes(JSON.parse(savedNotes));
    }
  }, []);

  const savePresentation = () => {
    localStorage.setItem('currentPresentation', JSON.stringify(presentation));
    localStorage.setItem('speakerNotes', JSON.stringify(speakerNotes));
    trackEvent('presentation_creator', 'save_presentation');
    alert('Présentation sauvegardée !');
  };

  const addSlide = (type) => {
    const newSlide = {
      id: Date.now(),
      type,
      content: getDefaultContent(type)
    };

    setPresentation(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    
    setCurrentSlide(presentation.slides.length);
    trackEvent('presentation_creator', 'add_slide', type);
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'title':
        return { title: 'Nouveau Titre', subtitle: 'Sous-titre' };
      case 'content':
        return { title: 'Titre de la diapositive', points: ['Point 1', 'Point 2', 'Point 3'] };
      case 'image':
        return { title: 'Titre de l\'image', imageUrl: '', caption: 'Légende' };
      case 'chart':
        return { 
          title: 'Titre du graphique',
          type: 'bar',
          data: [
            { label: 'Jan', value: 30 },
            { label: 'Fév', value: 45 },
            { label: 'Mar', value: 60 },
            { label: 'Avr', value: 50 }
          ]
        };
      default:
        return {};
    }
  };

  const updateSlideContent = (slideIndex, field, value) => {
    const updatedSlides = [...presentation.slides];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedSlides[slideIndex].content[parent][child] = value;
    } else {
      updatedSlides[slideIndex].content[field] = value;
    }
    setPresentation(prev => ({ ...prev, slides: updatedSlides }));
  };

  const deleteSlide = (index) => {
    if (presentation.slides.length === 1) {
      alert('Vous devez conserver au moins une diapositive');
      return;
    }
    
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }));
    
    if (currentSlide >= presentation.slides.length - 1) {
      setCurrentSlide(Math.max(0, currentSlide - 1));
    }
  };

  const duplicateSlide = (index) => {
    const slideToDuplicate = presentation.slides[index];
    const newSlide = {
      ...slideToDuplicate,
      id: Date.now(),
      content: JSON.parse(JSON.stringify(slideToDuplicate.content)) // Deep copy
    };
    
    const updatedSlides = [...presentation.slides];
    updatedSlides.splice(index + 1, 0, newSlide);
    
    setPresentation(prev => ({ ...prev, slides: updatedSlides }));
    setCurrentSlide(index + 1);
  };

  const moveSlide = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= presentation.slides.length) return;
    
    const updatedSlides = [...presentation.slides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);
    
    setPresentation(prev => ({ ...prev, slides: updatedSlides }));
    setCurrentSlide(toIndex);
  };

  const startPresentation = () => {
    setIsPresentating(true);
    setCurrentSlide(0);
    if (presentationRef.current?.requestFullscreen) {
      presentationRef.current.requestFullscreen();
    }
    trackEvent('presentation_creator', 'start_presentation');
  };

  const exitPresentation = () => {
    setIsPresentating(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleKeyPress = (e) => {
    if (isPresentating) {
      if (e.key === 'ArrowRight' && currentSlide < presentation.slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
      } else if (e.key === 'Escape') {
        exitPresentation();
      } else if (e.key === 'n') {
        setShowNotes(!showNotes);
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPresentating, currentSlide, showNotes]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateSlideContent(currentSlide, 'imageUrl', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateChartData = (index, field, value) => {
    const slide = presentation.slides[currentSlide];
    const newData = [...slide.content.data];
    newData[index][field] = field === 'value' ? parseInt(value) || 0 : value;
    updateSlideContent(currentSlide, 'data', newData);
  };

  const addChartDataPoint = () => {
    const slide = presentation.slides[currentSlide];
    const newData = [...slide.content.data, { label: 'Nouveau', value: 50 }];
    updateSlideContent(currentSlide, 'data', newData);
  };

  const removeChartDataPoint = (index) => {
    const slide = presentation.slides[currentSlide];
    const newData = slide.content.data.filter((_, i) => i !== index);
    updateSlideContent(currentSlide, 'data', newData);
  };

  const removePoint = (index) => {
    const slide = presentation.slides[currentSlide];
    const newPoints = slide.content.points.filter((_, i) => i !== index);
    updateSlideContent(currentSlide, 'points', newPoints);
  };

  const renderSlideContent = (slide, isEditing = false) => {
    const theme = themes[presentation.theme];
    
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={slide.content.title}
                  onChange={(e) => updateSlideContent(currentSlide, 'title', e.target.value)}
                  className="text-4xl font-bold mb-4 bg-transparent border-b-2 border-gray-600 text-center w-full outline-none"
                  style={{ color: theme.text }}
                />
                <input
                  type="text"
                  value={slide.content.subtitle}
                  onChange={(e) => updateSlideContent(currentSlide, 'subtitle', e.target.value)}
                  className="text-2xl mb-8 bg-transparent border-b-2 border-gray-600 text-center w-full outline-none"
                  style={{ color: theme.text }}
                />
                <input
                  type="text"
                  value={slide.content.author || ''}
                  onChange={(e) => updateSlideContent(currentSlide, 'author', e.target.value)}
                  className="text-lg bg-transparent border-b-2 border-gray-600 text-center outline-none"
                  style={{ color: theme.text }}
                  placeholder="Auteur"
                />
              </>
            ) : (
              <>
                <h1 className="text-5xl font-bold mb-4 animate-fadeIn" style={{ color: theme.text }}>
                  {slide.content.title}
                </h1>
                <h2 className="text-3xl mb-8 animate-fadeIn animation-delay-200" style={{ color: theme.text, opacity: 0.8 }}>
                  {slide.content.subtitle}
                </h2>
                {slide.content.author && (
                  <p className="text-xl animate-fadeIn animation-delay-400" style={{ color: theme.text, opacity: 0.6 }}>
                    {slide.content.author}
                  </p>
                )}
              </>
            )}
          </div>
        );

      case 'content':
        return (
          <div className="p-12 h-full">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={slide.content.title}
                  onChange={(e) => updateSlideContent(currentSlide, 'title', e.target.value)}
                  className="text-3xl font-bold mb-8 bg-transparent border-b-2 border-gray-600 w-full outline-none"
                  style={{ color: theme.text }}
                />
                <div className="space-y-4">
                  {slide.content.points.map((point, index) => (
                    <div key={index} className="flex items-center group">
                      <span className="text-2xl mr-4" style={{ color: theme.primary }}>•</span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...slide.content.points];
                          newPoints[index] = e.target.value;
                          updateSlideContent(currentSlide, 'points', newPoints);
                        }}
                        className="text-xl bg-transparent border-b border-gray-600 flex-1 outline-none"
                        style={{ color: theme.text }}
                      />
                      <button
                        onClick={() => removePoint(index)}
                        className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newPoints = [...slide.content.points, 'Nouveau point'];
                      updateSlideContent(currentSlide, 'points', newPoints);
                    }}
                    className="text-sm px-4 py-2 rounded hover:opacity-80"
                    style={{ backgroundColor: theme.primary, color: theme.text }}
                  >
                    Ajouter un point
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-8 animate-fadeIn" style={{ color: theme.text }}>
                  {slide.content.title}
                </h2>
                <ul className="space-y-6">
                  {slide.content.points.map((point, index) => (
                    <li key={index} className="flex items-start animate-slideInLeft" style={{ animationDelay: `${index * 200}ms` }}>
                      <span className="text-3xl mr-4" style={{ color: theme.primary }}>•</span>
                      <span className="text-2xl" style={{ color: theme.text }}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="p-12 h-full flex flex-col">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={slide.content.title}
                  onChange={(e) => updateSlideContent(currentSlide, 'title', e.target.value)}
                  className="text-3xl font-bold mb-6 bg-transparent border-b-2 border-gray-600 outline-none"
                  style={{ color: theme.text }}
                />
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg mb-4">
                  {slide.content.imageUrl ? (
                    <div className="relative group">
                      <img src={slide.content.imageUrl} alt="" className="max-h-full max-w-full" />
                      <button
                        onClick={() => updateSlideContent(currentSlide, 'imageUrl', '')}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image size={48} className="mx-auto mb-4 text-gray-600" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Upload size={16} className="inline mr-2" />
                        Télécharger une image
                      </button>
                      <p className="text-sm text-gray-400 mt-2">ou</p>
                      <input
                        type="text"
                        value={slide.content.imageUrl}
                        onChange={(e) => updateSlideContent(currentSlide, 'imageUrl', e.target.value)}
                        placeholder="URL de l'image"
                        className="mt-2 bg-transparent border-b border-gray-600 text-center outline-none"
                        style={{ color: theme.text }}
                      />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={slide.content.caption}
                  onChange={(e) => updateSlideContent(currentSlide, 'caption', e.target.value)}
                  className="text-lg bg-transparent border-b border-gray-600 text-center outline-none"
                  style={{ color: theme.text }}
                  placeholder="Légende"
                />
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-6 animate-fadeIn" style={{ color: theme.text }}>
                  {slide.content.title}
                </h2>
                <div className="flex-1 flex items-center justify-center animate-zoomIn">
                  {slide.content.imageUrl ? (
                    <img src={slide.content.imageUrl} alt={slide.content.title} className="max-h-full max-w-full rounded-lg shadow-2xl" />
                  ) : (
                    <div className="text-center">
                      <Image size={96} className="mx-auto mb-4" style={{ color: theme.secondary }} />
                      <p style={{ color: theme.text, opacity: 0.6 }}>Aucune image</p>
                    </div>
                  )}
                </div>
                {slide.content.caption && (
                  <p className="text-lg text-center mt-4 animate-fadeIn animation-delay-200" style={{ color: theme.text, opacity: 0.8 }}>
                    {slide.content.caption}
                  </p>
                )}
              </>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className="p-12 h-full">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={slide.content.title}
                  onChange={(e) => updateSlideContent(currentSlide, 'title', e.target.value)}
                  className="text-3xl font-bold mb-8 bg-transparent border-b-2 border-gray-600 w-full outline-none"
                  style={{ color: theme.text }}
                />
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {slide.content.data.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 group">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateChartData(index, 'label', e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white w-32"
                      />
                      <input
                        type="number"
                        value={item.value}
                        onChange={(e) => updateChartData(index, 'value', e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white w-24"
                      />
                      <button
                        onClick={() => removeChartDataPoint(index)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addChartDataPoint}
                    className="text-sm px-4 py-2 rounded"
                    style={{ backgroundColor: theme.primary, color: theme.text }}
                  >
                    Ajouter une donnée
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-8 animate-fadeIn" style={{ color: theme.text }}>
                  {slide.content.title}
                </h2>
                <div className="h-96 flex items-end justify-around">
                  {slide.content.data.map((item, index) => {
                    const maxValue = Math.max(...slide.content.data.map(d => d.value));
                    const height = (item.value / maxValue) * 100;
                    
                    return (
                      <div key={index} className="flex flex-col items-center animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                        <div
                          className="w-20 transition-all duration-1000 rounded-t"
                          style={{
                            height: `${height}%`,
                            backgroundColor: theme.primary
                          }}
                        ></div>
                        <p className="mt-2 text-lg font-bold" style={{ color: theme.text }}>{item.value}</p>
                        <p className="text-sm" style={{ color: theme.text, opacity: 0.8 }}>{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const exportPresentation = () => {
    const data = {
      presentation,
      speakerNotes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title.replace(/\s+/g, '_')}.json`;
    a.click();
    
    trackEvent('presentation_creator', 'export_presentation');
  };

  const importPresentation = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.presentation) {
            setPresentation(data.presentation);
            setSpeakerNotes(data.speakerNotes || {});
            setCurrentSlide(0);
            alert('Présentation importée avec succès !');
          }
        } catch (error) {
          alert('Erreur lors de l\'importation du fichier');
        }
      };
      reader.readAsText(file);
    }
  };

  const exportToPDF = async () => {
    // Importer jsPDF dynamiquement
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    
    presentation.slides.forEach((slide, index) => {
      if (index > 0) pdf.addPage();
      
      pdf.setFontSize(20);
      pdf.text(slide.content.title || `Slide ${index + 1}`, 20, 30);
      
      if (slide.content.points) {
        let y = 50;
        slide.content.points.forEach(point => {
          pdf.setFontSize(12);
          pdf.text(`• ${point}`, 30, y);
          y += 10;
        });
      }
    });
    
    pdf.save(`${presentation.title}.pdf`);
    trackEvent('presentation_creator', 'export_pdf');
  };

  return (
    <Layout 
      title="Créateur de Présentations Interactives" 
      description="Créez des présentations modernes et interactives facilement. Alternative gratuite à PowerPoint avec des thèmes professionnels."
      keywords="créateur présentation, powerpoint gratuit, diaporama en ligne, présentation interactive"
    >
      <Helmet>
        <title>Créateur de Présentations Interactives | BestoolsVerse</title>
        <meta name="description" content="Créez des présentations modernes et interactives facilement. Alternative gratuite à PowerPoint avec des thèmes professionnels." />
      </Helmet>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.5s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
        .animate-zoomIn { animation: zoomIn 0.5s ease-out forwards; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; }
        }
      `}</style>
      
      {isPresentating ? (
        <div 
          ref={presentationRef}
          className="fixed inset-0 z-50 print-area"
          style={{ backgroundColor: themes[presentation.theme].background }}
        >
          <div className="relative h-full">
            {renderSlideContent(presentation.slides[currentSlide])}
            
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 print:hidden">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-50 hover:bg-opacity-70"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-white px-4 py-2 bg-black bg-opacity-50 rounded-full">
                {currentSlide + 1} / {presentation.slides.length}
              </span>
              <button
                onClick={() => setCurrentSlide(Math.min(presentation.slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === presentation.slides.length - 1}
                className="p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-50 hover:bg-opacity-70"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            {/* Speaker Notes */}
            {showNotes && speakerNotes[presentation.slides[currentSlide].id] && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-2xl print:hidden">
                <p className="text-sm">{speakerNotes[presentation.slides[currentSlide].id]}</p>
              </div>
            )}
            
            <button
              onClick={exitPresentation}
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 print:hidden"
            >
              ✕
            </button>
            
            <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded print:hidden">
              Appuyez sur N pour les notes
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
                <ChevronLeft size={20} className="mr-2" />
                <span>Retour à BestoolsVerse</span>
              </a>
              <h1 className="text-3xl font-bold text-white">Créateur de Présentations</h1>
              <p className="text-gray-400 mt-2">Créez des présentations professionnelles en quelques clics</p>
            </div>
            <Monitor className="text-blue-500" size={48} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Propriétés de la présentation */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Propriétés</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Titre</label>
                    <input
                      type="text"
                      value={presentation.title}
                      onChange={(e) => setPresentation(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Thème</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(themes).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => setPresentation(prev => ({ ...prev, theme: key }))}
                          className={`p-2 rounded text-xs font-medium transition-all ${
                            presentation.theme === key
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Transition</label>
                    <select
                      value={selectedTransition}
                      onChange={(e) => setSelectedTransition(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                    >
                      {transitions.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ajouter des diapositives */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Ajouter une diapositive</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(slideTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => addSlide(key)}
                      className="flex flex-col items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <template.icon size={24} className="text-gray-400 mb-2" />
                      <span className="text-xs text-gray-300">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={startPresentation}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Play size={20} className="mr-2" />
                  Présenter
                </button>
                
                <button
                  onClick={savePresentation}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Save size={20} className="mr-2" />
                  Sauvegarder
                </button>
                
                <button
                  onClick={exportPresentation}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <Download size={20} className="mr-2" />
                  Exporter JSON
                </button>
                
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <Download size={20} className="mr-2" />
                  Exporter PDF
                </button>
                
                <label className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center cursor-pointer">
                  <Upload size={20} className="mr-2" />
                  Importer
                  <input type="file" accept=".json" onChange={importPresentation} className="hidden" />
                </label>
              </div>
            </div>

            {/* Zone principale */}
            <div className="lg:col-span-3 space-y-4">
              {/* Aperçu de la diapositive actuelle */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    Diapositive {currentSlide + 1} / {presentation.slides.length}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isEditing
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Edit3 size={16} className="inline mr-1" />
                      {isEditing ? 'Terminer' : 'Modifier'}
                    </button>
                    
                    <button
                      onClick={() => duplicateSlide(currentSlide)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Dupliquer"
                    >
                      <Copy size={16} />
                    </button>
                    
                    <button
                      onClick={() => deleteSlide(currentSlide)}
                      disabled={presentation.slides.length === 1}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div 
                  className="aspect-video relative overflow-hidden"
                  style={{ backgroundColor: themes[presentation.theme].background }}
                >
                  {renderSlideContent(presentation.slides[currentSlide], isEditing)}
                </div>
                
                {/* Notes du présentateur */}
                <div className="p-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Notes du présentateur</h4>
                  <textarea
                    value={speakerNotes[presentation.slides[currentSlide].id] || ''}
                    onChange={(e) => setSpeakerNotes(prev => ({
                      ...prev,
                      [presentation.slides[currentSlide].id]: e.target.value
                    }))}
                    placeholder="Ajoutez vos notes ici..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm resize-none"
                    rows="3"
                  />
                </div>
              </div>

              {/* Vignettes des diapositives */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Diapositives</h3>
                
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {presentation.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      onClick={() => setCurrentSlide(index)}
                      className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        currentSlide === index
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div 
                        className="w-40 h-24 p-2 text-xs relative"
                        style={{ backgroundColor: themes[presentation.theme].background }}
                      >
                        <div className="h-full flex items-center justify-center">
                          <span style={{ color: themes[presentation.theme].text, fontSize: '10px' }}>
                            {slide.content.title || `Diapositive ${index + 1}`}
                          </span>
                        </div>
                        {speakerNotes[slide.id] && (
                          <div className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="bg-gray-900 px-2 py-1 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{index + 1}</span>
                        <div className="flex space-x-1">
                          {index > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(index, index - 1);
                              }}
                              className="text-gray-400 hover:text-white text-xs"
                            >
                              ←
                            </button>
                          )}
                          {index < presentation.slides.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(index, index + 1);
                              }}
                              className="text-gray-400 hover:text-white text-xs"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addSlide('content')}
                    className="flex-shrink-0 w-40 h-24 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-500 transition-colors"
                  >
                    <Plus size={24} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Conseils */}
              <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-800">
                <h4 className="font-semibold text-blue-400 mb-2">Conseils de présentation</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Utilisez les flèches ← → pour naviguer pendant la présentation</li>
                  <li>• Appuyez sur Échap pour quitter le mode présentation</li>
                  <li>• Appuyez sur N pour afficher/masquer les notes du présentateur</li>
                  <li>• Gardez vos diapositives simples et visuelles</li>
                  <li>• Utilisez des images de haute qualité pour un meilleur impact</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PresentationCreator;