// src/components/Layout.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, Home, Sparkles } from 'lucide-react';

const Layout = ({ children, title, description, keywords }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { currentUser, logout, userPlan } = useAuth();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Outils', href: '/#tools' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavigation = [
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{title ? `${title} | BestoolsVerse` : 'BestoolsVerse - Suite d\'outils IA gratuits'}</title>
        <meta name="description" content={description || 'BestoolsVerse offre plus de 20 outils IA gratuits pour booster votre productivité et créativité.'} />
        <meta name="keywords" content={keywords || 'outils ia, outils gratuits, productivité, créativité, générateur qr code, convertisseur fichiers'} />
        <meta property="og:title" content={title || 'BestoolsVerse'} />
        <meta property="og:description" content={description || 'Suite d\'outils IA gratuits'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bestoolsverse.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title || 'BestoolsVerse'} />
        <meta name="twitter:description" content={description || 'Suite d\'outils IA gratuits'} />
        <link rel="canonical" href={`https://bestoolsverse.com${window.location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        {/* Navigation */}
        <nav className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <Sparkles className="h-8 w-8 text-purple-500" />
                  <span className="ml-2 text-xl font-bold text-white">BestoolsVerse</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-4">
                {currentUser ? (
                  <div className="flex items-center space-x-4">
                    {/* Plan Badge */}
                    {userPlan && userPlan !== 'free' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {userPlan.toUpperCase()}
                      </span>
                    )}
                    
                    {/* User Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center text-gray-300 hover:text-white">
                        <User className="h-5 w-5 mr-1" />
                        <span className="text-sm">{currentUser.displayName || currentUser.email}</span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.name}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-400 hover:text-white"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-gray-800 bg-opacity-95">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {currentUser ? (
                  <>
                    <div className="border-t border-gray-700 pt-2">
                      <div className="px-3 py-2 text-gray-400 text-sm">
                        {currentUser.displayName || currentUser.email}
                      </div>
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-700 pt-2">
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black bg-opacity-60 backdrop-blur-lg border-t border-gray-800 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo et description */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <span className="ml-2 text-lg font-bold text-white">BestoolsVerse</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Suite complète d'outils IA pour booster votre productivité et libérer votre créativité.
                </p>
              </div>

              {/* Liens rapides */}
              <div>
                <h3 className="text-white font-semibold mb-3">Liens rapides</h3>
                <ul className="space-y-2">
                  <li><Link to="/pricing" className="text-gray-400 hover:text-white text-sm">Tarifs</Link></li>
                  <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">À propos</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Confidentialité</Link></li>
                </ul>
              </div>

              {/* Outils populaires */}
              <div>
                <h3 className="text-white font-semibold mb-3">Outils populaires</h3>
                <ul className="space-y-2">
                  <li><Link to="/tools/qr-code" className="text-gray-400 hover:text-white text-sm">QR Code</Link></li>
                  <li><Link to="/tools/ai-image-editor" className="text-gray-400 hover:text-white text-sm">Éditeur IA</Link></li>
                  <li><Link to="/tools/file-converter" className="text-gray-400 hover:text-white text-sm">Convertisseur</Link></li>
                  <li><Link to="/tools/seo-checker" className="text-gray-400 hover:text-white text-sm">SEO Checker</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2024 BestoolsVerse. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;