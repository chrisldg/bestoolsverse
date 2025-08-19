// src/components/ToolCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ToolCard = ({ tool }) => {
  const { currentUser, userPlan } = useAuth();
  
  // Vérifier si l'outil est accessible avec le plan actuel
  const isLocked = () => {
    if (!currentUser) return false; // Tous les outils sont accessibles sans connexion (avec limites)
    if (userPlan === 'business' || userPlan === 'pro') return false;
    
    // Liste des outils premium
    const premiumTools = ['ar-studio', 'vr-studio', 'nft-studio', 'investment-simulator', 'collaborative-editor'];
    return premiumTools.includes(tool.id);
  };

  const locked = isLocked();

  return (
    <div className={`relative group ${locked ? 'opacity-75' : ''}`}>
      <div className={`bg-gradient-to-r ${tool.color} p-0.5 rounded-xl transition-all duration-300 group-hover:scale-105`}>
        <div className="bg-gray-900 rounded-xl p-6 h-full">
          {/* Badge de popularité */}
          {tool.popularity >= 90 && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Star size={12} className="mr-1" />
              Populaire
            </div>
          )}

          {/* Badge Premium */}
          {locked && (
            <div className="absolute -top-2 -left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Lock size={12} className="mr-1" />
              Pro
            </div>
          )}

          {/* Icône */}
          <div className="text-4xl mb-4">{tool.icon}</div>

          {/* Titre */}
          <h3 className="text-xl font-bold text-white mb-2">
            {tool.name}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-4">
            {tool.description}
          </p>

          {/* Catégorie */}
          <div className="mb-4">
            <span className="inline-block px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
              {tool.category}
            </span>
          </div>

          {/* Bouton d'action */}
          <Link
            to={locked ? '/pricing' : tool.link}
            className={`inline-flex items-center justify-center w-full py-2 px-4 rounded-lg font-medium transition-all ${
              locked 
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
          >
            {locked ? (
              <>
                <Lock size={16} className="mr-2" />
                Débloquer
              </>
            ) : (
              <>
                Utiliser
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Link>

          {/* Barre de progression d'utilisation (si connecté) */}
          {currentUser && !locked && tool.usageLimit && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Utilisation</span>
                <span>{tool.currentUsage || 0}/{tool.usageLimit}</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${((tool.currentUsage || 0) / tool.usageLimit) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolCard;