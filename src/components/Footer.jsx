// src/components/Footer.jsx
import React from 'react';
import { Zap, Twitter, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">BestoolsVerse</span>
            </div>
            <p className="text-gray-400 mb-4">
              Découvrez 20 outils innovants qui transformeront votre façon de créer, analyser et interagir avec le monde numérique.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/bestoolsverse" className="text-gray-400 hover:text-blue-400" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com/bestoolsverse" className="text-gray-400 hover:text-blue-400" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com/bestoolsverse" className="text-gray-400 hover:text-blue-400" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com/company/bestoolsverse" className="text-gray-400 hover:text-blue-400" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Outils Populaires</h3>
            <ul className="space-y-2">
              <li><a href="/tools/qr-code-generator" className="text-gray-400 hover:text-blue-400">QR Code Artistique</a></li>
              <li><a href="/tools/ai-image-editor" className="text-gray-400 hover:text-blue-400">Éditeur d'Images IA</a></li>
              <li><a href="/tools/file-converter" className="text-gray-400 hover:text-blue-400">Convertisseur de Fichiers</a></li>
              <li><a href="/tools/trend-analyzer" className="text-gray-400 hover:text-blue-400">Analyseur de Tendances</a></li>
              <li><a href="/tools/travel-planner" className="text-gray-400 hover:text-blue-400">Planificateur de Voyages</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li><a href="/blog" className="text-gray-400 hover:text-blue-400">Blog</a></li>
              <li><a href="/tutorials" className="text-gray-400 hover:text-blue-400">Tutoriels</a></li>
              <li><a href="/faq" className="text-gray-400 hover:text-blue-400">FAQ</a></li>
              <li><a href="/api" className="text-gray-400 hover:text-blue-400">API</a></li>
              <li><a href="/updates" className="text-gray-400 hover:text-blue-400">Mises à jour</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Entreprise</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-blue-400">À propos</a></li>
              <li><a href="/pricing" className="text-gray-400 hover:text-blue-400">Tarifs</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-blue-400">Contact</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-blue-400">Confidentialité</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-blue-400">Conditions d'utilisation</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500">
            &copy; 2025 BestoolsVerse. Tous droits réservés.
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="text-gray-500 mr-2">Besoin d'aide?</span>
            <a href="/contact" className="flex items-center text-blue-500 hover:text-blue-400">
              <Mail size={16} className="mr-1" />
              <span>Contactez-nous</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;