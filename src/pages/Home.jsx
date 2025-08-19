// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, Users, ArrowRight, Check } from 'lucide-react';
import Layout from '../components/Layout';

const Home = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Ultra Rapide',
      description: 'Tous nos outils sont optimisés pour une performance maximale'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: '100% Sécurisé',
      description: 'Vos données sont protégées et jamais partagées'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'IA Avancée',
      description: 'Technologie de pointe pour des résultats exceptionnels'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Communauté',
      description: 'Rejoignez des milliers d\'utilisateurs satisfaits'
    }
  ];

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      features: [
        '5 outils essentiels',
        '10 utilisations/jour',
        'Support communautaire',
        'Accès basique'
      ],
      cta: 'Commencer',
      link: '/register',
      popular: false
    },
    {
      name: 'Pro',
      price: '9.99€',
      period: '/mois',
      features: [
        'Tous les outils',
        'Utilisation illimitée',
        'Support prioritaire',
        'Fonctionnalités avancées',
        'Pas de publicité',
        'Export HD'
      ],
      cta: 'Essai gratuit',
      link: '/register',
      popular: true
    },
    {
      name: 'Business',
      price: '29.99€',
      period: '/mois',
      features: [
        'Tout du plan Pro',
        'API access',
        'Support dédié',
        'Formations personnalisées',
        'Tableau de bord analytics',
        'Facturation entreprise'
      ],
      cta: 'Contactez-nous',
      link: '/contact',
      popular: false
    }
  ];

  return (
    <Layout
      title="Accueil"
      description="Suite complète d'outils IA pour booster votre productivité"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-900 bg-opacity-50 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
            <span className="text-purple-300 text-sm">Plus de 20 outils IA disponibles</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Boostez votre créativité avec l'IA
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Suite complète d'outils intelligents pour transformer vos idées en réalité
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="#tools"
              className="inline-flex items-center px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
            >
              Explorer les outils
            </Link>
          </div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pourquoi choisir BestoolsVerse ?
            </h2>
            <p className="text-gray-400 text-lg">
              La plateforme tout-en-un pour vos besoins créatifs et professionnels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 hover:bg-opacity-70 transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Preview Section */}
      <section id="tools" className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Découvrez nos outils populaires
            </h2>
            <p className="text-gray-400 text-lg">
              Des solutions puissantes pour tous vos projets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Tool cards preview */}
            <Link to="/tools/qr-code" className="group">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-0.5 rounded-xl">
                <div className="bg-gray-900 rounded-xl p-6 h-full group-hover:bg-gray-800 transition-all">
                  <div className="text-3xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-white mb-2">QR Code Generator</h3>
                  <p className="text-gray-400 text-sm">Créez des QR codes personnalisés</p>
                </div>
              </div>
            </Link>

            <Link to="/tools/ai-image-editor" className="group">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-0.5 rounded-xl">
                <div className="bg-gray-900 rounded-xl p-6 h-full group-hover:bg-gray-800 transition-all">
                  <div className="text-3xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold text-white mb-2">Éditeur d'Images IA</h3>
                  <p className="text-gray-400 text-sm">Retouchez vos images avec l'IA</p>
                </div>
              </div>
            </Link>

            <Link to="/tools/file-converter" className="group">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-0.5 rounded-xl">
                <div className="bg-gray-900 rounded-xl p-6 h-full group-hover:bg-gray-800 transition-all">
                  <div className="text-3xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-white mb-2">Convertisseur</h3>
                  <p className="text-gray-400 text-sm">Convertissez tous vos fichiers</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center">
            <Link
              to="/#tools"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
            >
              Voir tous les outils
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-gray-400 text-lg">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative ${plan.popular ? 'scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                      Plus populaire
                    </span>
                  </div>
                )}
                
                <div className={`bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 h-full ${
                  plan.popular ? 'border-2 border-purple-500' : ''
                }`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={plan.link}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à transformer vos idées ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez des milliers d'utilisateurs qui font confiance à BestoolsVerse
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;