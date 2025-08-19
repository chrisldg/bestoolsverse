// src/tools/FileCompressor.jsx
import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Upload, Download, Scissors, FileText, Image, Film, Music, Trash, Settings, Award } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import JSZip from 'jszip';
import imageCompression from 'browser-image-compression';

const FileCompressor = () => {
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const compressionLevels = [
    { id: 'low', name: 'Faible', description: 'Qualité maximale, compression minimale', quality: 0.9 },
    { id: 'medium', name: 'Moyenne', description: 'Bon équilibre qualité/taille', quality: 0.7 },
    { id: 'high', name: 'Élevée', description: 'Compression maximale, qualité réduite', quality: 0.5 }
  ];

  const supportedFormats = {
    images: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'],
    documents: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
    videos: ['mp4', 'avi', 'mov', 'mkv'],
    audio: ['mp3', 'wav', 'flac', 'aac']
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (supportedFormats.images.includes(extension)) return <Image size={20} className="text-blue-500" />;
    if (supportedFormats.documents.includes(extension)) return <FileText size={20} className="text-green-500" />;
    if (supportedFormats.videos.includes(extension)) return <Film size={20} className="text-purple-500" />;
    if (supportedFormats.audio.includes(extension)) return <Music size={20} className="text-orange-500" />;
    
    return <FileText size={20} className="text-gray-500" />;
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (supportedFormats.images.includes(extension)) return 'image';
    if (supportedFormats.documents.includes(extension)) return 'document';
    if (supportedFormats.videos.includes(extension)) return 'video';
    if (supportedFormats.audio.includes(extension)) return 'audio';
    
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      originalSize: file.size,
      compressedSize: null,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    trackEvent('file_compressor', 'upload_files', uploadedFiles.length);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles = droppedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      originalSize: file.size,
      compressedSize: null,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const compressImage = async (file, quality) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: quality
      };
      
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Erreur compression image:', error);
      return file;
    }
  };

  const compressFile = async (fileData) => {
    const quality = compressionLevels.find(l => l.id === compressionLevel).quality;
    
    if (fileData.type === 'image') {
      const compressed = await compressImage(fileData.file, quality);
      return {
        ...fileData,
        compressedFile: compressed,
        compressedSize: compressed.size,
        status: 'completed'
      };
    }
    
    // Pour les autres types de fichiers, utiliser JSZip
    const zip = new JSZip();
    zip.file(fileData.name, fileData.file);
    
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: Math.floor(quality * 9)
      }
    });
    
    return {
      ...fileData,
      compressedFile: new File([blob], fileData.name + '.zip', { type: 'application/zip' }),
      compressedSize: blob.size,
      status: 'completed'
    };
  };

  const startCompression = async () => {
    if (files.length === 0) return;
    
    setIsCompressing(true);
    trackEvent('file_compressor', 'start_compression', compressionLevel);
    
    const compressed = [];
    for (const file of files) {
      const compressedFile = await compressFile(file);
      compressed.push(compressedFile);
      
      // Mettre à jour l'état progressivement
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' } : f
      ));
    }
    
    setCompressedFiles(compressed);
    setFiles(compressed);
    setIsCompressing(false);
  };

  const downloadFile = (fileData) => {
    const url = URL.createObjectURL(fileData.compressedFile || fileData.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileData.compressedFile 
      ? `compressed_${fileData.name}` 
      : fileData.name;
    link.click();
    URL.revokeObjectURL(url);
    
    trackEvent('file_compressor', 'download_file', fileData.type);
  };

  const downloadAll = async () => {
    if (compressedFiles.length === 0) return;
    
    const zip = new JSZip();
    compressedFiles.forEach(file => {
      zip.file(`compressed_${file.name}`, file.compressedFile || file.file);
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressed_files.zip';
    link.click();
    URL.revokeObjectURL(url);
    
    trackEvent('file_compressor', 'download_all');
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setCompressedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setCompressedFiles([]);
  };

  const getCompressionRatio = (original, compressed) => {
    if (!compressed) return 0;
    return Math.round((1 - compressed / original) * 100);
  };

  return (
    <Layout
      title="Compresseur de Fichiers"
      description="Réduisez la taille de vos fichiers sans perte de qualité"
      keywords="compresseur fichiers, réduire taille, compression image, zip"
    >
      <Helmet>
        <title>Compresseur de Fichiers Intelligent | BestoolsVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
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
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              <Scissors className="inline-block mr-3 mb-2" size={48} />
              Compresseur de Fichiers
            </h1>
            <p className="text-xl text-gray-200">
              Réduisez la taille de vos fichiers jusqu'à 90% sans perte de qualité
            </p>
          </div>

          {/* Zone de téléchargement */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 mb-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-3 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-purple-500 transition-colors"
            >
              <Upload size={64} className="mx-auto mb-4 text-gray-400" />
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
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Parcourir les fichiers
              </button>
              <p className="text-gray-500 text-sm mt-4">
                Formats supportés: Images, Documents, Vidéos, Audio
              </p>
            </div>
          </div>

          {/* Paramètres de compression */}
          {files.length > 0 && (
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings size={20} className="mr-2" />
                Paramètres de compression
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {compressionLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setCompressionLevel(level.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      compressionLevel === level.id
                        ? 'border-purple-500 bg-purple-900 bg-opacity-30'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-semibold text-white">{level.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{level.description}</div>
                    <div className="text-xs text-purple-400 mt-2">Qualité: {level.quality * 100}%</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Liste des fichiers */}
          {files.length > 0 && (
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Fichiers ({files.length})
                </h3>
                <div className="flex space-x-2">
                  {compressedFiles.length > 0 && (
                    <button
                      onClick={downloadAll}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
                    >
                      <Download size={18} className="mr-2" />
                      Tout télécharger
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Tout effacer
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {files.map(file => (
                  <div key={file.id} className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        {getFileIcon(file.name)}
                        <div className="ml-3">
                          <div className="text-white font-medium">{file.name}</div>
                          <div className="text-sm text-gray-400">
                            Original: {formatFileSize(file.originalSize)}
                            {file.compressedSize && (
                              <>
                                {' → '}
                                <span className="text-green-400">
                                  {formatFileSize(file.compressedSize)}
                                </span>
                                <span className="text-purple-400 ml-2">
                                  (-{getCompressionRatio(file.originalSize, file.compressedSize)}%)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {file.status === 'processing' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                        )}
                        {file.status === 'completed' && (
                          <>
                            <Award className="text-green-500" size={20} />
                            <button
                              onClick={() => downloadFile(file)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                            >
                              <Download size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={startCompression}
                disabled={isCompressing}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isCompressing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Compression en cours...
                  </>
                ) : (
                  <>
                    <Scissors size={20} className="mr-2" />
                    Compresser les fichiers
                  </>
                )}
              </button>
            </div>
          )}

          {/* Statistiques */}
          {compressedFiles.length > 0 && (
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistiques</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Taille originale</div>
                  <div className="text-2xl font-bold text-white">
                    {formatFileSize(files.reduce((acc, f) => acc + f.originalSize, 0))}
                  </div>
                </div>
                <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Taille compressée</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatFileSize(compressedFiles.reduce((acc, f) => acc + (f.compressedSize || 0), 0))}
                  </div>
                </div>
                <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Économie totale</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {getCompressionRatio(
                      files.reduce((acc, f) => acc + f.originalSize, 0),
                      compressedFiles.reduce((acc, f) => acc + (f.compressedSize || 0), 0)
                    )}%
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

export default FileCompressor;