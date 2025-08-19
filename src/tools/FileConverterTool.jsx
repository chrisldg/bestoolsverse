import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Upload, FileText, File, Settings, Download, RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { trackEvent } from '../utils/analytics';

const FileConverterTool = () => {
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [quality, setQuality] = useState('high');
  const [processing, setProcessing] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [conversionProgress, setConversionProgress] = useState({});
  const fileInputRef = useRef(null);

  // Catégories de conversion supportées
  const conversionMatrix = {
    // Documents
    'docx': ['pdf', 'txt', 'html'],
    'doc': ['pdf', 'txt', 'html'],
    'pdf': ['txt', 'docx'],
    'txt': ['pdf', 'docx', 'html'],
    'rtf': ['pdf', 'txt', 'html'],
    'odt': ['pdf', 'txt'],
    
    // Feuilles de calcul
    'xlsx': ['csv', 'pdf', 'json'],
    'xls': ['csv', 'pdf', 'json'],
    'csv': ['xlsx', 'json', 'pdf'],
    
    // Images
    'jpg': ['png', 'webp', 'pdf'],
    'jpeg': ['png', 'webp', 'pdf'],
    'png': ['jpg', 'webp', 'pdf'],
    'gif': ['png', 'jpg', 'webp'],
    'webp': ['png', 'jpg', 'pdf'],
    'svg': ['png', 'jpg', 'pdf'],
    
    // Présentations
    'pptx': ['pdf'],
    'ppt': ['pdf'],
    
    // Code
    'json': ['csv', 'txt'],
    'xml': ['json', 'txt'],
    'html': ['pdf', 'txt']
  };

  const conversionCategories = [
    {
      name: 'Documents',
      formats: ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt'],
      icon: FileText
    },
    {
      name: 'Tableurs',
      formats: ['xlsx', 'xls', 'csv'],
      icon: File
    },
    {
      name: 'Images',
      formats: ['jpg', 'png', 'gif', 'webp', 'svg'],
      icon: File
    },
    {
      name: 'Web',
      formats: ['html', 'json', 'xml'],
      icon: File
    }
  ];

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const validFiles = uploadedFiles.map(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return {
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        extension,
        possibleFormats: conversionMatrix[extension] || []
      };
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.map(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return {
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        extension,
        possibleFormats: conversionMatrix[extension] || []
      };
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setConvertedFiles(prev => prev.filter(file => file.originalId !== fileId));
  };

  // Conversion d'images
  const convertImage = async (file, toFormat) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                blob,
                url,
                name: file.name.replace(/\.[^/.]+$/, `.${toFormat}`)
              });
            } else {
              reject(new Error('Conversion échouée'));
            }
          }, `image/${toFormat === 'jpg' ? 'jpeg' : toFormat}`, quality === 'high' ? 0.95 : quality === 'medium' ? 0.85 : 0.75);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file.file);
    });
  };

  // Conversion de documents
  const convertDocument = async (file, toFormat) => {
    const extension = file.extension;
    
    if (extension === 'pdf' && toFormat === 'txt') {
      // PDF vers texte (nécessiterait une vraie librairie comme pdf.js)
      return {
        blob: new Blob(['[Contenu du PDF converti en texte]'], { type: 'text/plain' }),
        url: URL.createObjectURL(new Blob(['[Contenu du PDF converti en texte]'], { type: 'text/plain' })),
        name: file.name.replace(/\.[^/.]+$/, '.txt')
      };
    }
    
    if (toFormat === 'pdf') {
      // Conversion vers PDF
      const pdf = new jsPDF();
      
      if (extension === 'txt') {
        const text = await file.file.text();
        const lines = pdf.splitTextToSize(text, 180);
        pdf.text(lines, 15, 15);
      } else if (extension === 'docx') {
        // DOCX vers PDF (utiliser mammoth)
        const arrayBuffer = await file.file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const lines = pdf.splitTextToSize(result.value, 180);
        pdf.text(lines, 15, 15);
      } else {
        pdf.text('Document converti', 15, 15);
      }
      
      const pdfBlob = pdf.output('blob');
      return {
        blob: pdfBlob,
        url: URL.createObjectURL(pdfBlob),
        name: file.name.replace(/\.[^/.]+$/, '.pdf')
      };
    }
    
    throw new Error(`Conversion de ${extension} vers ${toFormat} non supportée`);
  };

  // Conversion de feuilles de calcul
  const convertSpreadsheet = async (file, toFormat) => {
    const extension = file.extension;
    const arrayBuffer = await file.file.arrayBuffer();
    
    if (extension === 'csv' && toFormat === 'xlsx') {
      const text = new TextDecoder().decode(arrayBuffer);
      const workbook = XLSX.read(text, { type: 'string' });
      const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      return {
        blob,
        url: URL.createObjectURL(blob),
        name: file.name.replace(/\.[^/.]+$/, '.xlsx')
      };
    }
    
    if ((extension === 'xlsx' || extension === 'xls') && toFormat === 'csv') {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv' });
      
      return {
        blob,
        url: URL.createObjectURL(blob),
        name: file.name.replace(/\.[^/.]+$/, '.csv')
      };
    }
    
    if (toFormat === 'json') {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      
      return {
        blob,
        url: URL.createObjectURL(blob),
        name: file.name.replace(/\.[^/.]+$/, '.json')
      };
    }
    
    if (toFormat === 'pdf') {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const html = XLSX.utils.sheet_to_html(worksheet);
      
      const pdf = new jsPDF();
      pdf.text('Feuille de calcul convertie', 15, 15);
      // Dans un cas réel, il faudrait parser le HTML et le convertir en PDF
      
      const pdfBlob = pdf.output('blob');
      return {
        blob: pdfBlob,
        url: URL.createObjectURL(pdfBlob),
        name: file.name.replace(/\.[^/.]+$/, '.pdf')
      };
    }
    
    throw new Error(`Conversion de ${extension} vers ${toFormat} non supportée`);
  };

  // JSON/XML conversions
  const convertData = async (file, toFormat) => {
    const extension = file.extension;
    const text = await file.file.text();
    
    if (extension === 'json' && toFormat === 'csv') {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(','),
          ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        return {
          blob,
          url: URL.createObjectURL(blob),
          name: file.name.replace(/\.[^/.]+$/, '.csv')
        };
      }
    }
    
    if (toFormat === 'txt') {
      const blob = new Blob([text], { type: 'text/plain' });
      return {
        blob,
        url: URL.createObjectURL(blob),
        name: file.name.replace(/\.[^/.]+$/, '.txt')
      };
    }
    
    throw new Error(`Conversion de ${extension} vers ${toFormat} non supportée`);
  };

  const convertFile = async (file, toFormat) => {
    const extension = file.extension;
    
    // Déterminer le type de conversion
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return await convertImage(file, toFormat);
    } else if (['docx', 'doc', 'txt', 'html', 'rtf', 'pdf'].includes(extension)) {
      return await convertDocument(file, toFormat);
    } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return await convertSpreadsheet(file, toFormat);
    } else if (['json', 'xml'].includes(extension)) {
      return await convertData(file, toFormat);
    }
    
    throw new Error(`Format ${extension} non supporté`);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    const results = [];
    
    for (const file of files) {
      try {
        setConversionProgress(prev => ({
          ...prev,
          [file.id]: { status: 'processing', progress: 0 }
        }));
        
        // Simuler la progression
        const progressInterval = setInterval(() => {
          setConversionProgress(prev => ({
            ...prev,
            [file.id]: {
              ...prev[file.id],
              progress: Math.min((prev[file.id]?.progress || 0) + 20, 90)
            }
          }));
        }, 200);
        
        const result = await convertFile(file, targetFormat);
        clearInterval(progressInterval);
        
        results.push({
          ...result,
          originalId: file.id,
          originalName: file.name,
          size: result.blob.size,
          format: targetFormat
        });
        
        setConversionProgress(prev => ({
          ...prev,
          [file.id]: { status: 'completed', progress: 100 }
        }));
      } catch (error) {
        console.error('Erreur de conversion:', error);
        setConversionProgress(prev => ({
          ...prev,
          [file.id]: { status: 'error', progress: 0, error: error.message }
        }));
      }
    }
    
    setConvertedFiles(results);
    setProcessing(false);
    trackEvent('file_converter', 'convert_files', targetFormat, files.length);
  };

  const downloadFile = (convertedFile) => {
    const link = document.createElement('a');
    link.href = convertedFile.url;
    link.download = convertedFile.name;
    link.click();
    trackEvent('file_converter', 'download_file', convertedFile.format);
  };

  const downloadAll = () => {
    convertedFiles.forEach(file => {
      setTimeout(() => downloadFile(file), 100);
    });
    trackEvent('file_converter', 'download_all', targetFormat, convertedFiles.length);
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedFiles([]);
    setConversionProgress({});
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Trouver la catégorie active
  const activeCategory = conversionCategories.find(cat => 
    cat.formats.includes(targetFormat)
  ) || conversionCategories[0];

  // Obtenir les formats disponibles pour les fichiers sélectionnés
  const availableFormats = files.length > 0 
    ? [...new Set(files.flatMap(f => f.possibleFormats))]
    : Object.keys(conversionMatrix);

  return (
    <Layout 
      title="Convertisseur de Fichiers Universel" 
      description="Convertissez facilement vos fichiers entre différents formats. Support des documents, images, feuilles de calcul et plus."
      keywords="convertisseur fichiers, pdf to word, convertir image, xlsx to csv"
    >
      <Helmet>
        <title>Convertisseur de Fichiers Universel | BestoolsVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        {/* Navbar */}
        <nav className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-16">
              <a href="/" className="flex items-center text-blue-500 hover:text-blue-400">
                <ChevronLeft size={20} className="mr-2" />
                <span>Retour aux outils</span>
              </a>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Convertisseur de Fichiers</h1>
            <p className="text-gray-400 text-lg">
              Convertissez instantanément vos fichiers entre différents formats
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone d'upload */}
            <div className="lg:col-span-2">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border-2 border-dashed border-gray-600 p-12 text-center hover:border-gray-500 transition-colors"
              >
                <Upload size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Glissez vos fichiers ici
                </h3>
                <p className="text-gray-400 mb-4">ou</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sélectionner des fichiers
                </button>
                
                <div className="mt-6 text-sm text-gray-500">
                  <p>Formats supportés : PDF, DOCX, XLSX, JPG, PNG, et plus...</p>
                  <p>Taille max : 50 MB par fichier</p>
                </div>
              </div>

              {/* Liste des fichiers */}
              {files.length > 0 && (
                <div className="mt-6 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Fichiers ({files.length})
                    </h3>
                    <button
                      onClick={clearAll}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      Tout supprimer
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <FileText size={24} className="text-blue-500 mr-3" />
                            <div className="flex-1">
                              <p className="text-white font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {formatFileSize(file.size)} • .{file.extension}
                              </p>
                            </div>
                          </div>
                          <button 
                            className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                            onClick={() => removeFile(file.id)}
                          >
                            ✕
                          </button>
                        </div>
                        
                        {conversionProgress[file.id] && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-400">
                                {conversionProgress[file.id].status === 'processing' && 'Conversion en cours...'}
                                {conversionProgress[file.id].status === 'completed' && 'Conversion terminée'}
                                {conversionProgress[file.id].status === 'error' && 'Erreur de conversion'}
                              </span>
                              <span className="text-sm text-gray-400">
                                {conversionProgress[file.id].progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  conversionProgress[file.id].status === 'error' 
                                    ? 'bg-red-600' 
                                    : conversionProgress[file.id].status === 'completed'
                                    ? 'bg-green-600'
                                    : 'bg-blue-600'
                                }`}
                                style={{ width: `${conversionProgress[file.id].progress}%` }}
                              />
                            </div>
                            {conversionProgress[file.id].error && (
                              <p className="text-red-500 text-sm mt-2">
                                {conversionProgress[file.id].error}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fichiers convertis */}
              {convertedFiles.length > 0 && (
                <div className="mt-6 bg-green-900 bg-opacity-20 backdrop-blur-lg rounded-xl border border-green-700 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <CheckCircle size={20} className="mr-2 text-green-500" />
                      Fichiers convertis ({convertedFiles.length})
                    </h3>
                    <button
                      onClick={downloadAll}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Download size={18} className="mr-2" />
                      Tout télécharger
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {convertedFiles.map((file) => (
                      <div key={file.originalId} className="flex items-center justify-between bg-gray-900 bg-opacity-50 rounded-lg p-4">
                        <div className="flex items-center flex-1">
                          <FileText size={24} className="text-green-500 mr-3" />
                          <div className="flex-1">
                            <p className="text-white font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatFileSize(file.size)} • .{file.format}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadFile(file)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Download size={18} className="mr-2" />
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panneau de configuration */}
            <div className="space-y-6">
              {/* Format de sortie */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings size={20} className="mr-2" />
                  Format de sortie
                </h3>
                
                <div className="space-y-3">
                  {conversionCategories.map((category) => (
                    <div key={category.name}>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {category.formats.map((format) => (
                          <button
                            key={format}
                            onClick={() => setTargetFormat(format)}
                            disabled={availableFormats.length > 0 && !availableFormats.includes(format)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              targetFormat === format
                                ? 'bg-blue-600 text-white'
                                : availableFormats.length > 0 && !availableFormats.includes(format)
                                ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            .{format}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualité */}
              {(activeCategory.name === 'Images' || targetFormat === 'pdf') && (
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Qualité de conversion
                  </h3>
                  <div className="space-y-2">
                    {['high', 'medium', 'low'].map((q) => (
                      <label key={q} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="quality"
                          value={q}
                          checked={quality === q}
                          onChange={(e) => setQuality(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-300 capitalize">
                          {q === 'high' ? 'Haute qualité' : q === 'medium' ? 'Qualité moyenne' : 'Basse qualité'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton de conversion */}
              <button
                onClick={handleConvert}
                disabled={files.length === 0 || processing}
                className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  files.length === 0 || processing
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {processing ? (
                  <>
                    <RefreshCw size={20} className="mr-2 animate-spin" />
                    Conversion en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} className="mr-2" />
                    Convertir {files.length > 0 && `(${files.length} fichier${files.length > 1 ? 's' : ''})`}
                  </>
                )}
              </button>

              {/* Informations */}
              <div className="bg-blue-900 bg-opacity-20 backdrop-blur-lg rounded-xl border border-blue-700 p-4">
                <h4 className="font-semibold text-blue-400 mb-2 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  Informations
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Conversion sécurisée et privée</li>
                  <li>• Aucun fichier n'est stocké</li>
                  <li>• Traitement 100% côté client</li>
                  <li>• Support multi-fichiers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FileConverterTool;