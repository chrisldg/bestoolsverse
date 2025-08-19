// src/tools/CollaborativeEditor.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Users, Edit3, Save, Share2, MessageSquare, Clock, FileText, Download, Send, User, Bold, Italic, Underline } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

// Fonction debounce simple
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const CollaborativeEditor = () => {
  const [document, setDocument] = useState({
    title: 'Document sans titre',
    content: '',
    lastSaved: null
  });
  
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Vous', color: '#3B82F6', online: true, cursor: null },
  ]);
  
  const [comments, setComments] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const editorRef = useRef(null);
  const typingTimeout = useRef(null);
  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  // Fonction de sauvegarde
  const saveDocument = useCallback(() => {
    setIsSaving(true);
    const savedDoc = {
      ...document,
      lastSaved: new Date()
    };
    setDocument(savedDoc);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('collaborativeDoc', JSON.stringify(savedDoc));
    trackEvent('collaborative_editor', 'save_document');
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  }, [document]);

  // Sauvegarde automatique avec debounce
  const debouncedSave = useCallback(
    debounce(() => {
      if (document.content !== '') {
        saveDocument();
      }
    }, 5000),
    [document.content, saveDocument]
  );

  // Effet pour la sauvegarde automatique
  useEffect(() => {
    debouncedSave();
  }, [document.content, debouncedSave]);

  // Charger le document sauvegardé
  useEffect(() => {
    const savedDoc = localStorage.getItem('collaborativeDoc');
    if (savedDoc) {
      setDocument(JSON.parse(savedDoc));
    }
  }, []);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setDocument(prev => ({ ...prev, content: newContent }));
    
    // Simuler l'indicateur de frappe
    setIsTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const handleTitleChange = (e) => {
    setDocument(prev => ({ ...prev, title: e.target.value }));
  };

  const applyFormat = (format) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      let formattedText = selectedText;
      
      if (format === 'bold') {
        formattedText = `**${selectedText}**`;
      } else if (format === 'italic') {
        formattedText = `*${selectedText}*`;
      } else if (format === 'underline') {
        formattedText = `__${selectedText}__`;
      }
      
      const newContent = 
        textarea.value.substring(0, start) + 
        formattedText + 
        textarea.value.substring(end);
      
      setDocument(prev => ({ ...prev, content: newContent }));
      
      // Restaurer la sélection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }, 0);
    }
    
    trackEvent('collaborative_editor', 'apply_format', format);
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedText) return;
    
    const comment = {
      id: Date.now(),
      text: newComment,
      author: 'Vous',
      timestamp: new Date(),
      selection: selectedText
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
    setShowCommentDialog(false);
    trackEvent('collaborative_editor', 'add_comment');
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      text: newMessage,
      author: 'Vous',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    trackEvent('collaborative_editor', 'send_message');
  };

  const generateShareLink = () => {
    const link = `https://bestoolsverse.com/share/${Date.now()}`;
    setShareLink(link);
    trackEvent('collaborative_editor', 'generate_share_link');
  };

  const exportDocument = (format) => {
    const content = document.content;
    const title = document.title;
    
    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'html') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <h1>${title}</h1>
          <pre>${content}</pre>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    trackEvent('collaborative_editor', 'export_document', format);
  };

  const simulateCollaborator = () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const colors = ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
    const randomIndex = Math.floor(Math.random() * names.length);
    
    const newCollaborator = {
      id: Date.now(),
      name: names[randomIndex],
      color: colors[randomIndex],
      online: true,
      cursor: null
    };
    
    setCollaborators(prev => [...prev, newCollaborator]);
    
    // Simuler la déconnexion après un certain temps
    setTimeout(() => {
      setCollaborators(prev => 
        prev.map(c => c.id === newCollaborator.id ? { ...c, online: false } : c)
      );
    }, 30000);
  };

  return (
    <Layout 
      title="Éditeur Collaboratif en Temps Réel" 
      description="Travaillez en équipe sur vos documents avec notre éditeur collaboratif. Chat intégré, commentaires et partage instantané."
      keywords="éditeur collaboratif, document partagé, travail équipe, temps réel"
    >
      <Helmet>
        <title>Éditeur Collaboratif en Temps Réel | BestoolsVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <nav className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center text-blue-500 hover:text-blue-400">
                <ChevronLeft size={20} className="mr-2" />
                <span>Retour aux outils</span>
              </a>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {collaborators.filter(c => c.online).map((collaborator, index) => (
                    <div
                      key={collaborator.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ 
                        backgroundColor: collaborator.color,
                        marginLeft: index > 0 ? '-8px' : '0',
                        zIndex: collaborators.length - index
                      }}
                      title={collaborator.name}
                    >
                      {collaborator.name[0]}
                    </div>
                  ))}
                  <span className="ml-2 text-gray-400 text-sm">
                    {collaborators.filter(c => c.online).length} en ligne
                  </span>
                </div>
                
                <button
                  onClick={simulateCollaborator}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Simuler un collaborateur"
                >
                  <Users size={20} />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Éditeur principal */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700">
                {/* Barre d'outils */}
                <div className="border-b border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={document.title}
                      onChange={handleTitleChange}
                      className="text-2xl font-bold bg-transparent text-white outline-none flex-1"
                      placeholder="Titre du document"
                    />
                    <div className="flex items-center space-x-2">
                      {isSaving && (
                        <span className="text-green-400 text-sm flex items-center">
                          <Clock size={16} className="mr-1 animate-spin" />
                          Sauvegarde...
                        </span>
                      )}
                      {document.lastSaved && !isSaving && (
                        <span className="text-gray-400 text-sm">
                          Sauvegardé {new Date(document.lastSaved).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => applyFormat('bold')}
                      className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
                      title="Gras"
                    >
                      <Bold size={18} />
                    </button>
                    <button
                      onClick={() => applyFormat('italic')}
                      className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
                      title="Italique"
                    >
                      <Italic size={18} />
                    </button>
                    <button
                      onClick={() => applyFormat('underline')}
                      className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
                      title="Souligné"
                    >
                      <Underline size={18} />
                    </button>
                    
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    
                    <button
                      onClick={saveDocument}
                      className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
                      title="Sauvegarder"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={generateShareLink}
                      className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
                      title="Partager"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={() => exportDocument('txt')}
                      className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
                      title="Exporter"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Zone de texte */}
                <div className="p-6">
                  <textarea
                    ref={editorRef}
                    value={document.content}
                    onChange={handleContentChange}
                    onSelect={(e) => {
                      const selection = e.target.value.substring(
                        e.target.selectionStart,
                        e.target.selectionEnd
                      );
                      setSelectedText(selection);
                    }}
                    className="w-full h-96 bg-gray-900 bg-opacity-50 text-white p-4 rounded-lg resize-none outline-none"
                    placeholder="Commencez à écrire..."
                  />
                  
                  {isTyping && (
                    <div className="mt-2 text-sm text-gray-400">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-1"></span>
                      Quelqu'un écrit...
                    </div>
                  )}
                </div>
                
                {/* Lien de partage */}
                {shareLink && (
                  <div className="border-t border-gray-700 p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          alert('Lien copié !');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat */}
              <div className="mt-6 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700">
                <div className="border-b border-gray-700 p-4">
                  <h3 className="font-semibold text-white flex items-center">
                    <MessageSquare size={20} className="mr-2" />
                    Chat d'équipe
                  </h3>
                </div>
                
                <div className="h-64 overflow-y-auto p-4">
                  {chatMessages.length === 0 ? (
                    <p className="text-gray-400 text-center">Aucun message pour le moment</p>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map(msg => (
                        <div key={msg.id} className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                            {msg.author[0]}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-400">
                              {msg.author} • {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                            <p className="text-white">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-700 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Tapez votre message..."
                      className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Panneau des commentaires */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 sticky top-24">
                <div className="border-b border-gray-700 p-4">
                  <h3 className="font-semibold text-white">Commentaires</h3>
                </div>
                
                <div className="p-4 max-h-96 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center">
                      Sélectionnez du texte pour ajouter un commentaire
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {comments.map(comment => (
                        <div key={comment.id} className="bg-gray-900 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">
                            {comment.author} • {new Date(comment.timestamp).toLocaleTimeString()}
                          </div>
                          <p className="text-white text-sm mb-2">{comment.text}</p>
                          <p className="text-gray-500 text-xs italic">"{comment.selection}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedText && (
                    <div className="mt-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="w-full bg-gray-900 text-white text-sm px-3 py-2 rounded-lg outline-none resize-none"
                        rows="3"
                      />
                      <button
                        onClick={addComment}
                        className="mt-2 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollaborativeEditor;