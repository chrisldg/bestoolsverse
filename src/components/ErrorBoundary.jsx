// src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

class ErrorBoundary extends React.Component {
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log l'erreur (en production, envoyer à un service de monitoring)
    if (process.env.NODE_ENV === 'production') {
      // Envoyer à votre service de monitoring (Sentry, LogRocket, etc.)
      console.log('Logging error to monitoring service...');
    }

    this.setState(prevState => ({
      error: error,
      errorInfo: errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Sauvegarder l'erreur dans localStorage pour analyse
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Garder seulement les 10 dernières erreurs
      if (existingLogs.length > 10) {
        existingLogs.shift();
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Recharger la page si trop d'erreurs
    if (this.state.errorCount > 3) {
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 shadow-2xl">
              {/* Icône d'erreur animée */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 opacity-20 blur-xl animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-white" size={36} />
                  </div>
                </div>
              </div>

              {/* Titre et description */}
              <h1 className="text-3xl font-bold text-white text-center mb-3">
                Oops! Une erreur est survenue
              </h1>
              
              <p className="text-gray-400 text-center mb-8">
                Ne vous inquiétez pas, vos données sont en sécurité. L'application a rencontré 
                un problème inattendu, mais nous sommes là pour vous aider.
              </p>

              {/* Détails de l'erreur en développement */}
              {isDevelopment && this.state.error && (
                <div className="mb-8">
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <h3 className="text-red-400 font-semibold mb-2">Message d'erreur:</h3>
                    <p className="text-gray-300 font-mono text-sm break-all">
                      {this.state.error.toString()}
                    </p>
                  </div>
                  
                  <details className="bg-gray-900 rounded-lg p-4">
                    <summary className="cursor-pointer text-gray-400 hover:text-gray-300 font-medium">
                      Afficher les détails techniques
                    </summary>
                    <div className="mt-4 space-y-4">
                      {this.state.error.stack && (
                        <div>
                          <h4 className="text-gray-400 text-sm font-semibold mb-1">Stack trace:</h4>
                          <pre className="text-gray-500 text-xs overflow-auto max-h-40 p-2 bg-black rounded">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <h4 className="text-gray-400 text-sm font-semibold mb-1">Component stack:</h4>
                          <pre className="text-gray-500 text-xs overflow-auto max-h-40 p-2 bg-black rounded">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Réessayer
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Recharger
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
                >
                  <Home size={18} className="mr-2" />
                  Accueil
                </button>
              </div>

              {/* Lien de support */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-center text-gray-400 text-sm">
                  Le problème persiste? {' '}
                  <a 
                    href="mailto:support@bestoolsverse.com" 
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                  >
                    <Mail size={14} className="mr-1" />
                    Contactez notre support
                  </a>
                </p>
              </div>

              {/* Compteur d'erreurs */}
              {this.state.errorCount > 1 && (
                <div className="mt-4 text-center">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ {this.state.errorCount} erreurs détectées durant cette session
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;