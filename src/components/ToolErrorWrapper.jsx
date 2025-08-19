// src/components/ToolErrorWrapper.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Classe Error Boundary pour capturer les erreurs
export class ToolErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tool Error:', error, errorInfo);
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Envoyer l'erreur à un service de tracking (optionnel)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-red-900 bg-opacity-30 rounded-full mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Une erreur est survenue
            </h2>
            
            <p className="text-gray-400 text-center mb-6">
              L'outil a rencontré un problème inattendu. Ne vous inquiétez pas, vos données sont en sécurité.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Réessayer
              </button>
              
              <Link
                to="/"
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Retour à l'accueil
              </Link>
            </div>

            {this.state.errorCount > 2 && (
              <p className="text-center text-red-400 text-sm mt-4">
                ⚠️ {this.state.errorCount} erreurs détectées
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant de chargement
export const ToolLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Chargement de l'outil...</p>
    </div>
  </div>
);

// HOC pour wrapper les outils avec gestion d'erreur et chargement
export const withToolWrapper = (ToolComponent, toolName = 'Outil') => {
  return class WrappedTool extends React.Component {
    state = {
      isLoading: true,
      hasError: false
    };

    componentDidMount() {
      // Simuler un court délai de chargement pour une meilleure UX
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 300);
    }

    componentDidCatch(error, errorInfo) {
      console.error(`Error in ${toolName}:`, error, errorInfo);
      this.setState({ hasError: true });
    }

    render() {
      if (this.state.isLoading) {
        return <ToolLoader />;
      }

      return (
        <ToolErrorBoundary>
          <ToolComponent {...this.props} />
        </ToolErrorBoundary>
      );
    }
  };
};

// Hook pour gérer les erreurs dans les composants fonctionnels
export const useToolError = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  const handleError = (error) => {
    console.error('Tool error:', error);
    setError(error);
  };

  // Si une erreur est présente, throw pour que l'ErrorBoundary la capture
  if (error) {
    throw error;
  }

  return { handleError, resetError };
};

// Wrapper pour les opérations async avec gestion d'erreur
export const safeAsync = async (asyncFn, errorHandler) => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error('Async operation failed:', error);
    if (errorHandler) {
      errorHandler(error);
    } else {
      throw error;
    }
  }
};

// Wrapper pour Canvas avec vérification
export const getSafeCanvasContext = (canvasRef, type = '2d') => {
  if (!canvasRef || !canvasRef.current) {
    console.error('Canvas ref is null or undefined');
    return null;
  }
  
  try {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext(type, {
      alpha: type === '2d',
      desynchronized: true,
      willReadFrequently: false
    });
    
    if (!ctx) {
      console.error(`Failed to get ${type} context from canvas`);
      return null;
    }
    
    return ctx;
  } catch (error) {
    console.error('Error getting canvas context:', error);
    return null;
  }
};

// Alternative pour Canvas non-ref
export const getCanvasContext = (canvas, type = '2d') => {
  if (!canvas) return null;
  try {
    return canvas.getContext(type);
  } catch (error) {
    console.error('Erreur lors de l\'obtention du contexte canvas:', error);
    return null;
  }
};

// Fonction pour vérifier le support du navigateur
export const checkBrowserSupport = (feature) => {
  const support = {
    canvas: () => !!document.createElement('canvas').getContext,
    webgl: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch(e) {
        return false;
      }
    },
    localStorage: () => {
      try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch(e) {
        return false;
      }
    },
    fileReader: () => typeof FileReader !== 'undefined',
    dragAndDrop: () => 'draggable' in document.createElement('div'),
    webWorker: () => typeof Worker !== 'undefined',
    offscreenCanvas: () => typeof OffscreenCanvas !== 'undefined'
  };
  
  return support[feature] ? support[feature]() : false;
};

// Fonction pour sauvegarder en local storage avec gestion d'erreur
export const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      if (checkBrowserSupport('localStorage')) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
    return false;
  },
  
  getItem: (key, defaultValue = null) => {
    try {
      if (checkBrowserSupport('localStorage')) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
    return defaultValue;
  },
  
  removeItem: (key) => {
    try {
      if (checkBrowserSupport('localStorage')) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
    return false;
  }
};

// Fonction pour charger une image en toute sécurité
export const loadImageSafely = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
    img.src = src;
  });
};

// Fonction pour créer un canvas hors écran
export const createOffscreenCanvas = (width, height) => {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Wrapper simple pour les outils (sans HOC complexe)
const ToolErrorWrapper = ({ children }) => {
  return (
    <ToolErrorBoundary>
      {children}
    </ToolErrorBoundary>
  );
};

// Export par défaut
export default ToolErrorWrapper;