// src/pages/ToolPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import ToolErrorWrapper from '../components/ToolErrorWrapper';

// Import de TOUS les outils
import QRCodeTool from '../tools/QRCodeTool';
import FileConverterTool from '../tools/FileConverterTool';
import AIImageEditor from '../tools/AIImageEditor';
import ContentGenerator from '../tools/ContentGenerator';
import CarbonCalculator from '../tools/CarbonCalculator';
import TrendAnalyzer from '../tools/TrendAnalyzer';
import ARStudio from '../tools/ARStudio';
import FileCompressor from '../tools/FileCompressor';
import ColorPaletteCreator from '../tools/ColorPaletteCreator';
import MemeGenerator from '../tools/MemeGenerator';
import WebsiteSpeedTester from '../tools/WebsiteSpeedTester';
import MealPlanner from '../tools/MealPlanner';
import SEOChecker from '../tools/SEOChecker';
import TravelPlanner from '../tools/TravelPlanner';
import PresentationCreator from '../tools/PresentationCreator';
import NFTStudio from '../tools/NFTStudio';
import InvestmentSimulator from '../tools/InvestmentSimulator';
import CollaborativeEditor from '../tools/CollaborativeEditor';
import SentimentAnalyzer from '../tools/SentimentAnalyzer';
import VRStudio from '../tools/VRStudio';
import StoryGenerator from '../tools/StoryGenerator';
import FinanceTracker from '../tools/FinanceTracker';

const ToolPage = () => {
  const { toolId } = useParams();
  
  // Configuration complète de tous les outils
  const toolsConfig = {
    'qr-code': {
      component: QRCodeTool,
      title: 'Générateur de QR Code Artistique',
      description: 'Créez des QR codes artistiques personnalisés avec notre générateur en ligne gratuit.',
      keywords: 'qr code generator, qr code creator, qr code gratuit'
    },
    'file-converter': {
      component: FileConverterTool,
      title: 'Convertisseur de Fichiers Universel',
      description: 'Convertissez vos fichiers entre différents formats instantanément et gratuitement.',
      keywords: 'convertisseur de fichiers, pdf to word, mp4 to mp3, convertir image'
    },
    'ai-image-editor': {
      component: AIImageEditor,
      title: 'Éditeur d\'Images IA',
      description: 'Retouchez et transformez vos images avec notre puissant éditeur d\'images IA.',
      keywords: 'éditeur images ia, supprimer arrière-plan photo, améliorer qualité image'
    },
    'content-generator': {
      component: ContentGenerator,
      title: 'Générateur de Contenu IA',
      description: 'Créez du contenu de qualité instantanément avec l\'intelligence artificielle.',
      keywords: 'générateur de texte ia, créer contenu automatique, rédaction ia'
    },
    'carbon-calculator': {
      component: CarbonCalculator,
      title: 'Calculateur d\'Empreinte Carbone',
      description: 'Mesurez et réduisez votre impact environnemental avec notre calculateur.',
      keywords: 'calculateur empreinte carbone, bilan carbone, impact environnemental'
    },
    'trend-analyzer': {
      component: TrendAnalyzer,
      title: 'Analyseur de Tendances',
      description: 'Prédisez les tendances futures avec notre outil d\'analyse IA avancé.',
      keywords: 'analyse de tendances, prédiction tendances, analyse prédictive'
    },
    'ar-studio': {
      component: ARStudio,
      title: 'Studio AR - Réalité Augmentée',
      description: 'Créez des expériences en réalité augmentée facilement.',
      keywords: 'réalité augmentée en ligne, ar viewer, créateur ar'
    },
    'file-compressor': {
      component: FileCompressor,
      title: 'Compresseur de Fichiers Intelligent',
      description: 'Réduisez la taille de vos fichiers jusqu\'à 90% sans perte de qualité.',
      keywords: 'compresseur de fichiers, réduire taille pdf, compression image'
    },
    'color-palette': {
      component: ColorPaletteCreator,
      title: 'Créateur de Palettes de Couleurs',
      description: 'Générez des palettes de couleurs harmonieuses pour vos projets design.',
      keywords: 'générateur de palettes de couleurs, combinaison couleurs design'
    },
    'meme-generator': {
      component: MemeGenerator,
      title: 'Créateur de Mèmes',
      description: 'Créez des mèmes viraux facilement avec nos templates modernes.',
      keywords: 'créateur de mèmes, générateur de gif, memes viraux'
    },
    'website-speed': {
      component: WebsiteSpeedTester,
      title: 'Testeur de Vitesse de Site',
      description: 'Analysez les performances de votre site web et obtenez des recommandations.',
      keywords: 'test vitesse site web, optimisation site, performance web'
    },
    'meal-planner': {
      component: MealPlanner,
      title: 'Planificateur de Repas IA',
      description: 'Planifiez vos repas de la semaine avec l\'aide de l\'intelligence artificielle.',
      keywords: 'planificateur de repas, menu semaine ia, planning repas'
    },
    'seo-checker': {
      component: SEOChecker,
      title: 'Vérificateur SEO',
      description: 'Analysez et optimisez le référencement de votre site web.',
      keywords: 'vérificateur seo, analyse référencement, audit seo gratuit'
    },
    'travel-planner': {
      component: TravelPlanner,
      title: 'Planificateur de Voyages',
      description: 'Organisez vos voyages facilement avec notre planificateur intelligent.',
      keywords: 'planificateur de voyages, itinéraire voyage, organisation voyage'
    },
    'presentation-creator': {
      component: PresentationCreator,
      title: 'Créateur de Présentations',
      description: 'Créez des présentations professionnelles rapidement.',
      keywords: 'créateur de présentations, alternative powerpoint, slides modernes'
    },
    'nft-studio': {
      component: NFTStudio,
      title: 'Studio NFT',
      description: 'Créez et gérez vos NFTs et art numérique facilement.',
      keywords: 'créer nft, art numérique nft, studio blockchain'
    },
    'investment-simulator': {
      component: InvestmentSimulator,
      title: 'Simulateur d\'Investissements',
      description: 'Simulez vos investissements et calculez vos rendements.',
      keywords: 'simulateur investissements, calculateur rendement, simulation financière'
    },
    'collaborative-editor': {
      component: CollaborativeEditor,
      title: 'Éditeur Collaboratif',
      description: 'Travaillez en équipe sur vos documents en temps réel.',
      keywords: 'éditeur collaboratif, document partagé en ligne, collaboration temps réel'
    },
    'sentiment-analyzer': {
      component: SentimentAnalyzer,
      title: 'Analyseur de Sentiment',
      description: 'Analysez le sentiment et l\'émotion dans vos textes.',
      keywords: 'analyseur de sentiment, analyse émotionnelle, réputation en ligne'
    },
    'vr-studio': {
      component: VRStudio,
      title: 'Studio VR - Réalité Virtuelle',
      description: 'Créez des expériences de réalité virtuelle immersives.',
      keywords: 'réalité virtuelle en ligne, vr browser, créateur vr'
    },
    'story-generator': {
      component: StoryGenerator,
      title: 'Générateur d\'Histoires IA',
      description: 'Créez des histoires captivantes avec l\'intelligence artificielle.',
      keywords: 'générateur histoires ia, créateur récits, storytelling ia'
    },
    'finance-tracker': {
      component: FinanceTracker,
      title: 'Gestionnaire de Finances',
      description: 'Suivez et gérez vos finances personnelles facilement.',
      keywords: 'gestionnaire finances, suivi budget, tracker dépenses'
    }
  };
  
  const toolConfig = toolsConfig[toolId];
  
  if (!toolConfig) {
    return (
      <Layout title="Outil non trouvé">
        <Helmet>
          <title>Outil non trouvé | BestoolsVerse</title>
          <meta name="description" content="L'outil que vous recherchez n'existe pas ou n'est pas encore disponible." />
        </Helmet>
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">404 - Outil non trouvé</h1>
            <p className="text-gray-300 mb-8">L'outil que vous recherchez n'existe pas ou n'est pas encore disponible.</p>
            <a 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors inline-block"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </Layout>
    );
  }
  
  const ToolComponent = toolConfig.component;
  
  return (
    <Layout 
      title={toolConfig.title}
      description={toolConfig.description}
      keywords={toolConfig.keywords}
    >
      <Helmet>
        <title>{toolConfig.title} | BestoolsVerse</title>
        <meta name="description" content={toolConfig.description} />
        <meta name="keywords" content={toolConfig.keywords} />
        <meta property="og:title" content={toolConfig.title} />
        <meta property="og:description" content={toolConfig.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={toolConfig.title} />
        <meta name="twitter:description" content={toolConfig.description} />
      </Helmet>
      
      <ToolErrorWrapper>
        <ToolComponent />
      </ToolErrorWrapper>
    </Layout>
  );
};

export default ToolPage;