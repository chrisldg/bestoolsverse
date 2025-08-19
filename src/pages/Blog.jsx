// src/pages/Blog.jsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Calendar, User, Clock, Tag, Search, ArrowRight } from 'lucide-react';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous', count: 15 },
    { id: 'tutorials', name: 'Tutoriels', count: 6 },
    { id: 'news', name: 'Actualités', count: 4 },
    { id: 'ai', name: 'Intelligence Artificielle', count: 5 },
    { id: 'productivity', name: 'Productivité', count: 3 }
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'Comment créer des QR codes artistiques uniques',
      excerpt: 'Découvrez comment personnaliser vos QR codes avec des designs créatifs tout en maintenant leur fonctionnalité.',
      category: 'tutorials',
      author: 'Sophie Dubois',
      date: '2024-01-15',
      readTime: '5 min',
      image: '🎨',
      featured: true
    },
    {
      id: 2,
      title: 'L\'IA révolutionne l\'édition d\'images en 2024',
      excerpt: 'Les dernières avancées en intelligence artificielle transforment complètement la façon dont nous retouchons nos photos.',
      category: 'ai',
      author: 'Lucas Bernard',
      date: '2024-01-12',
      readTime: '8 min',
      image: '🤖'
    },
    {
      id: 3,
      title: '10 outils pour booster votre productivité',
      excerpt: 'Notre sélection des meilleurs outils de BestoolsVerse pour optimiser votre workflow quotidien.',
      category: 'productivity',
      author: 'Emma Petit',
      date: '2024-01-10',
      readTime: '6 min',
      image: '🚀'
    },
    {
      id: 4,
      title: 'Nouvelle mise à jour : AR Studio 2.0',
      excerpt: 'Découvrez toutes les nouvelles fonctionnalités de notre studio de réalité augmentée.',
      category: 'news',
      author: 'Alexandre Martin',
      date: '2024-01-08',
      readTime: '4 min',
      image: '🥽',
      featured: true
    },
    {
      id: 5,
      title: 'Guide complet du SEO en 2024',
      excerpt: 'Tout ce que vous devez savoir pour optimiser votre référencement cette année.',
      category: 'tutorials',
      author: 'Sophie Dubois',
      date: '2024-01-05',
      readTime: '10 min',
      image: '📈'
    },
    {
      id: 6,
      title: 'Créer des NFTs facilement avec NFT Studio',
      excerpt: 'Tutorial pas à pas pour créer et vendre vos premiers NFTs sur notre plateforme.',
      category: 'tutorials',
      author: 'Lucas Bernard',
      date: '2024-01-03',
      readTime: '7 min',
      image: '🎭'
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <Layout
      title="Blog"
      description="Actualités, tutoriels et conseils sur l'IA et la productivité"
      keywords="blog, tutoriels, actualités IA, conseils productivité"
    >
      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-center">
            Blog & Actualités
          </h1>
          <p className="text-xl text-gray-300 text-center mb-8 max-w-3xl mx-auto">
            Découvrez nos derniers articles, tutoriels et actualités sur l'intelligence artificielle et la productivité.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Articles vedettes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map(post => (
                <article key={post.id} className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{post.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          Vedette
                        </span>
                        <span className="text-gray-400 text-sm">
                          {post.readTime} de lecture
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 hover:text-purple-400 cursor-pointer">
                        {post.title}
                      </h3>
                      <p className="text-gray-300 mb-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(post.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                          Lire plus
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-20">
                <h3 className="text-lg font-semibold text-white mb-4">Catégories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm">{category.count}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Tags populaires</h3>
                  <div className="flex flex-wrap gap-2">
                    {['IA', 'Design', 'SEO', 'NFT', 'AR/VR', 'Productivité'].map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-gray-600 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Aucun article trouvé.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredPosts.map(post => (
                    <article key={post.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{post.image}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                              {categories.find(c => c.id === post.category)?.name}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Clock size={14} />
                              {post.readTime}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 hover:text-purple-400 cursor-pointer">
                            {post.title}
                          </h3>
                          <p className="text-gray-300 mb-3">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {post.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(post.date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                              Lire l'article
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredPosts.length > 0 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                    Précédent
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">2</button>
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">3</button>
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                    Suivant
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Restez informé
            </h2>
            <p className="text-white/90 mb-6">
              Recevez nos derniers articles et actualités directement dans votre boîte mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-3 bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:bg-white/30"
              />
              <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;