// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import BestoolsVerse from './BestoolsVerse';
import ToolPage from './pages/ToolPage';
import ToolErrorWrapper, { ToolErrorBoundary } from './components/ToolErrorWrapper';

// Import des outils
import QRCodeTool from './tools/QRCodeTool';
import FileConverterTool from './tools/FileConverterTool';
import AIImageEditor from './tools/AIImageEditor';
import ContentGenerator from './tools/ContentGenerator';
import CarbonCalculator from './tools/CarbonCalculator';
import TrendAnalyzer from './tools/TrendAnalyzer';
import ARStudio from './tools/ARStudio';
import FileCompressor from './tools/FileCompressor';
import ColorPaletteCreator from './tools/ColorPaletteCreator';
import MemeGenerator from './tools/MemeGenerator';
import WebsiteSpeedTester from './tools/WebsiteSpeedTester';
import MealPlanner from './tools/MealPlanner';
import SEOChecker from './tools/SEOChecker';
import TravelPlanner from './tools/TravelPlanner';
import PresentationCreator from './tools/PresentationCreator';
import NFTStudio from './tools/NFTStudio';
import InvestmentSimulator from './tools/InvestmentSimulator';
import CollaborativeEditor from './tools/CollaborativeEditor';
import SentimentAnalyzer from './tools/SentimentAnalyzer';
import VRStudio from './tools/VRStudio';
import StoryGenerator from './tools/StoryGenerator';
import FinanceTracker from './tools/FinanceTracker';

// Import des pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import Login from './pages/Login';
import Register from './pages/Register';

// Component ScrollToTop
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Component 404
function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Helmet>
        <title>404 - Page non trouvée | BestoolsVerse</title>
        <meta name="description" content="La page que vous recherchez n'existe pas." />
      </Helmet>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page non trouvée</p>
        <a 
          href="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ToolErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" />
          <Routes>
            {/* Page d'accueil */}
            <Route path="/" element={<BestoolsVerse />} />
            <Route path="/home" element={<Home />} />
            
            {/* Pages principales */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            
            {/* Authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Outils - Routes individuelles avec ToolErrorWrapper */}
            <Route path="/tools/qr-code" element={<ToolErrorWrapper><QRCodeTool /></ToolErrorWrapper>} />
            <Route path="/tools/file-converter" element={<ToolErrorWrapper><FileConverterTool /></ToolErrorWrapper>} />
            <Route path="/tools/ai-image-editor" element={<ToolErrorWrapper><AIImageEditor /></ToolErrorWrapper>} />
            <Route path="/tools/content-generator" element={<ToolErrorWrapper><ContentGenerator /></ToolErrorWrapper>} />
            <Route path="/tools/carbon-calculator" element={<ToolErrorWrapper><CarbonCalculator /></ToolErrorWrapper>} />
            <Route path="/tools/trend-analyzer" element={<ToolErrorWrapper><TrendAnalyzer /></ToolErrorWrapper>} />
            <Route path="/tools/ar-studio" element={<ToolErrorWrapper><ARStudio /></ToolErrorWrapper>} />
            <Route path="/tools/file-compressor" element={<ToolErrorWrapper><FileCompressor /></ToolErrorWrapper>} />
            <Route path="/tools/color-palette" element={<ToolErrorWrapper><ColorPaletteCreator /></ToolErrorWrapper>} />
            <Route path="/tools/meme-generator" element={<ToolErrorWrapper><MemeGenerator /></ToolErrorWrapper>} />
            <Route path="/tools/website-speed" element={<ToolErrorWrapper><WebsiteSpeedTester /></ToolErrorWrapper>} />
            <Route path="/tools/meal-planner" element={<ToolErrorWrapper><MealPlanner /></ToolErrorWrapper>} />
            <Route path="/tools/seo-checker" element={<ToolErrorWrapper><SEOChecker /></ToolErrorWrapper>} />
            <Route path="/tools/travel-planner" element={<ToolErrorWrapper><TravelPlanner /></ToolErrorWrapper>} />
            <Route path="/tools/presentation-creator" element={<ToolErrorWrapper><PresentationCreator /></ToolErrorWrapper>} />
            <Route path="/tools/nft-studio" element={<ToolErrorWrapper><NFTStudio /></ToolErrorWrapper>} />
            <Route path="/tools/investment-simulator" element={<ToolErrorWrapper><InvestmentSimulator /></ToolErrorWrapper>} />
            <Route path="/tools/collaborative-editor" element={<ToolErrorWrapper><CollaborativeEditor /></ToolErrorWrapper>} />
            <Route path="/tools/sentiment-analyzer" element={<ToolErrorWrapper><SentimentAnalyzer /></ToolErrorWrapper>} />
            <Route path="/tools/vr-studio" element={<ToolErrorWrapper><VRStudio /></ToolErrorWrapper>} />
            <Route path="/tools/story-generator" element={<ToolErrorWrapper><StoryGenerator /></ToolErrorWrapper>} />
            <Route path="/tools/finance-tracker" element={<ToolErrorWrapper><FinanceTracker /></ToolErrorWrapper>} />
            
            {/* Page générique pour les outils (fallback) */}
            <Route path="/tools/:toolId" element={<ToolPage />} />
            
            {/* Routes protégées (exemple) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
                      <p className="text-gray-400">Cette page est en cours de développement</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* 404 - Doit être en dernier */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToolErrorBoundary>
  );
}

export default App;