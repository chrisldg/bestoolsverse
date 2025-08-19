// src/pages/About.jsx
import React from 'react';
import Layout from '../components/Layout';
import { Target, Heart, Zap, Users, Award, Globe } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Passion',
      description: 'Nous sommes passionnés par l\'innovation et la création d\'outils qui font une différence.'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Innovation',
      description: 'Toujours à la pointe de la technologie pour vous offrir les meilleures solutions.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Communauté',
      description: 'Nous écoutons et apprenons de notre communauté pour améliorer constamment nos outils.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque aspect de notre plateforme.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Utilisateurs actifs' },
    { number: '20+', label: 'Outils disponibles' },
    { number: '1M+', label: 'Projets créés' },
    { number: '99.9%', label: 'Uptime' }
  ];

  const team = [
    {
      name: 'Alexandre Martin',
      role: 'CEO & Fondateur',
      image: '👨‍💼'
    },
    {
      name: 'Sophie Dubois',
      role: 'CTO',
      image: '👩‍💻'
    },
    {
      name: 'Lucas Bernard',
      role: 'Lead Designer',
      image: '👨‍🎨'
    },
    {
      name: 'Emma Petit',
      role: 'Head of Product',
      image: '👩‍💼'
    }
  ];

  return (
    <Layout
      title="À propos"
      description="Découvrez l'histoire et la mission de BestoolsVerse"
      keywords="à propos, mission, équipe, valeurs"
    >
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Notre mission est de démocratiser l'IA
          </h1>
          <p className="text-xl text-gray-300">
            Nous croyons que chacun devrait avoir accès à des outils puissants pour libérer sa créativité et améliorer sa productivité.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Notre Histoire</h2>
              <p className="text-gray-300 mb-4">
                BestoolsVerse est né d'une vision simple : rendre les outils d'intelligence artificielle accessibles à tous, 
                sans barrière technique ou financière.
              </p>
              <p className="text-gray-300 mb-4">
                Fondée en 2023, notre plateforme a rapidement évolué pour devenir une suite complète d'outils IA, 
                servant des milliers d'utilisateurs à travers le monde.
              </p>
              <p className="text-gray-300">
                Aujourd'hui, nous continuons d'innover et d'élargir notre gamme d'outils, toujours guidés par notre 
                mission de démocratiser l'accès à l'intelligence artificielle.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
              <Globe className="h-32 w-32 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Impact Global</h3>
              <p className="text-white/90">
                Des utilisateurs dans plus de 100 pays font confiance à nos outils chaque jour.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {stat.number}
                </div>
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                <p className="text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="px-4 py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-6">Récompenses et Reconnaissances</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-semibold text-white">Meilleure Startup IA 2024</h3>
              <p className="text-gray-400 text-sm">Tech Innovation Awards</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="font-semibold text-white">Top 10 Outils Productivité</h3>
              <p className="text-gray-400 text-sm">ProductHunt 2024</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-white">Choix de l'Éditeur</h3>
              <p className="text-gray-400 text-sm">TechCrunch 2024</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;