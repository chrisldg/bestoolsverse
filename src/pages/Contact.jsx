
// src/pages/Contact.jsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackEvent } from '../utils/analytics';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    trackEvent('contact', 'form_submit', formData.subject);
    
    try {
      // Simulation d'envoi - À remplacer par votre API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="text-blue-500" size={24} />,
      title: 'Email',
      content: 'contact@bestoolsverse.com',
      subtext: 'Réponse sous 24h'
    },
    {
      icon: <MessageSquare className="text-green-500" size={24} />,
      title: 'Chat en direct',
      content: 'Disponible en semaine',
      subtext: '9h - 18h (CET)'
    },
    {
      icon: <Globe className="text-purple-500" size={24} />,
      title: 'Réseaux sociaux',
      content: '@BestoolsVerse',
      subtext: 'Twitter, LinkedIn, Facebook'
    }
  ];

  const faqItems = [
    {
      question: 'Comment puis-je obtenir de l\'aide technique ?',
      answer: 'Utilisez le formulaire de contact ou consultez notre documentation détaillée dans la section aide.'
    },
    {
      question: 'Proposez-vous des formations ou tutoriels ?',
      answer: 'Oui, consultez notre blog et notre chaîne YouTube pour des tutoriels détaillés sur chaque outil.'
    },
    {
      question: 'Puis-je suggérer de nouveaux outils ?',
      answer: 'Absolument ! Nous adorons les suggestions de notre communauté. Utilisez le formulaire de contact avec le sujet "Suggestion d\'outil".'
    },
    {
      question: 'Comment signaler un bug ?',
      answer: 'Utilisez le formulaire de contact avec le sujet "Bug report" en décrivant le problème en détail.'
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Contact | BestoolsVerse</title>
        <meta name="description" content="Contactez l'équipe BestoolsVerse. Nous sommes là pour répondre à vos questions et vous aider." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Une question, une suggestion, ou besoin d'aide ? Notre équipe est là pour vous accompagner
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 text-center hover:border-gray-600 transition-colors">
              <div className="flex justify-center mb-4">
                {info.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
              <p className="text-gray-300 font-medium">{info.content}</p>
              <p className="text-gray-500 text-sm mt-1">{info.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulaire de contact */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Sujet</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="question">Question générale</option>
                  <option value="technical">Support technique</option>
                  <option value="bug">Signaler un bug</option>
                  <option value="suggestion">Suggestion d'amélioration</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Décrivez votre demande en détail..."
                  rows="6"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Envoi en cours...'
                ) : (
                  <>
                    <Send className="mr-2" size={20} />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Questions fréquentes</h2>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.question}</h3>
                  <p className="text-gray-400">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-2">Besoin d'une aide immédiate ?</h3>
              <p className="text-gray-200 mb-4">
                Notre équipe de support est disponible pour vous aider pendant les heures ouvrables.
              </p>
              <div className="flex items-center text-white">
                <Clock className="mr-2" size={20} />
                <span>Lun-Ven : 9h-18h (CET)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;