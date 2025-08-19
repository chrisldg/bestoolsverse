import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useToolAccess = (toolId) => {
  const { currentUser, checkToolUsage, recordToolUsage, hasFeature, userSubscription } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Vérifier l'accès avant d'utiliser un outil
  const checkAccess = useCallback(async () => {
    // Si pas connecté, rediriger vers login
    if (!currentUser) {
      toast.error('Veuillez vous connecter pour utiliser cet outil');
      navigate('/login', { state: { from: `/tools/${toolId}` } });
      return false;
    }

    // Vérifier les limites d'utilisation
    const usageCheck = await checkToolUsage(toolId);
    
    if (!usageCheck.allowed) {
      switch (usageCheck.reason) {
        case 'limit_reached':
          // Afficher un modal d'upgrade
          showUpgradeModal({
            title: 'Limite atteinte',
            message: `Vous avez atteint votre limite quotidienne de ${usageCheck.limit} utilisations pour cet outil.`,
            currentPlan: userSubscription?.plan || 'free'
          });
          return false;
          
        case 'no_subscription':
          toast.error('Erreur de subscription. Veuillez contacter le support.');
          return false;
          
        default:
          toast.error('Accès refusé');
          return false;
      }
    }

    // Si il reste des utilisations, afficher le compteur
    if (usageCheck.remaining !== undefined && usageCheck.remaining < 3) {
      toast(`Il vous reste ${usageCheck.remaining} utilisation(s) aujourd'hui`, {
        icon: '⚠️'
      });
    }

    return true;
  }, [currentUser, toolId, checkToolUsage, navigate, userSubscription]);

  // Exécuter une action avec vérification d'accès
  const executeWithAccess = useCallback(async (action, options = {}) => {
    const { 
      requiresHighQuality = false,
      requiresCommercialUse = false,
      requiresAdvancedOptions = false,
      onSuccess,
      onError
    } = options;

    try {
      setIsProcessing(true);

      // Vérifier l'accès de base
      const hasAccess = await checkAccess();
      if (!hasAccess) {
        setIsProcessing(false);
        return false;
      }

      // Vérifier les fonctionnalités spécifiques
      if (requiresHighQuality && !hasFeature('highQuality')) {
        showUpgradeModal({
          title: 'Qualité haute résolution',
          message: 'Cette fonctionnalité nécessite un plan Pro ou Business.',
          feature: 'highQuality',
          currentPlan: userSubscription?.plan || 'free'
        });
        setIsProcessing(false);
        return false;
      }

      if (requiresCommercialUse && !hasFeature('commercialUse')) {
        showUpgradeModal({
          title: 'Usage commercial',
          message: 'L\'utilisation commerciale nécessite un plan Pro ou Business.',
          feature: 'commercialUse',
          currentPlan: userSubscription?.plan || 'free'
        });
        setIsProcessing(false);
        return false;
      }

      if (requiresAdvancedOptions && !hasFeature('advancedOptions')) {
        showUpgradeModal({
          title: 'Options avancées',
          message: 'Les options avancées nécessitent un plan Pro ou Business.',
          feature: 'advancedOptions',
          currentPlan: userSubscription?.plan || 'free'
        });
        setIsProcessing(false);
        return false;
      }

      // Exécuter l'action
      const result = await action();

      // Enregistrer l'utilisation seulement si l'action réussit
      await recordToolUsage(toolId);

      // Callback de succès
      if (onSuccess) {
        onSuccess(result);
      }

      setIsProcessing(false);
      return result;

    } catch (error) {
      console.error('Erreur lors de l\'exécution:', error);
      
      // Callback d'erreur
      if (onError) {
        onError(error);
      } else {
        toast.error('Une erreur est survenue. Veuillez réessayer.');
      }
      
      setIsProcessing(false);
      return false;
    }
  }, [checkAccess, hasFeature, recordToolUsage, toolId, userSubscription]);

  // Afficher le modal d'upgrade
  const showUpgradeModal = useCallback((config) => {
    // Créer un élément de modal personnalisé
    const modalRoot = document.createElement('div');
    modalRoot.id = 'upgrade-modal';
    modalRoot.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';
    
    modalRoot.innerHTML = `
      <div class="bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
        <button id="close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <h2 class="text-2xl font-bold text-white mb-4">${config.title}</h2>
        <p class="text-gray-300 mb-6">${config.message}</p>
        
        <div class="space-y-3">
          ${config.currentPlan === 'free' ? `
            <a href="/pricing" class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors">
              Passer à Pro (9.99€/mois)
            </a>
            <a href="/pricing" class="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors">
              Passer à Business (29.99€/mois)
            </a>
          ` : config.currentPlan === 'pro' ? `
            <a href="/pricing" class="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors">
              Passer à Business (29.99€/mois)
            </a>
          ` : ''}
          
          <button id="cancel-modal" class="block w-full bg-gray-700 hover:bg-gray-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors">
            Annuler
          </button>
        </div>
        
        <div class="mt-6 text-center">
          <a href="/pricing" class="text-blue-400 hover:text-blue-300 text-sm">
            Voir tous les plans et fonctionnalités →
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalRoot);
    
    // Event listeners
    const closeModal = () => {
      document.body.removeChild(modalRoot);
    };
    
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-modal').addEventListener('click', closeModal);
    modalRoot.addEventListener('click', (e) => {
      if (e.target === modalRoot) closeModal();
    });
  }, []);

  // Obtenir les informations d'utilisation
  const getUsageInfo = useCallback(() => {
    if (!currentUser || !userSubscription) return null;

    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = userSubscription.usage?.[today]?.[toolId] || 0;
    const plan = userSubscription.plan;
    const limit = userSubscription.limits?.daily?.[toolId] || userSubscription.limits?.daily?.default || 5;

    return {
      used: dailyUsage,
      limit: limit === -1 ? 'Illimité' : limit,
      remaining: limit === -1 ? 'Illimité' : Math.max(0, limit - dailyUsage),
      percentage: limit === -1 ? 0 : (dailyUsage / limit) * 100,
      isUnlimited: limit === -1,
      plan
    };
  }, [currentUser, userSubscription, toolId]);

  // Composant d'affichage de l'utilisation
  const UsageDisplay = useCallback(() => {
    const usage = getUsageInfo();
    if (!usage || usage.isUnlimited) return null;

    return (
      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Utilisation quotidienne</span>
          <span className="text-sm text-white font-medium">
            {usage.used} / {usage.limit}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              usage.percentage >= 80 ? 'bg-red-500' : 
              usage.percentage >= 60 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, usage.percentage)}%` }}
          />
        </div>
        {usage.remaining <= 2 && usage.remaining > 0 && (
          <p className="text-xs text-yellow-400 mt-2">
            Plus que {usage.remaining} utilisation(s) aujourd'hui
          </p>
        )}
      </div>
    );
  }, [getUsageInfo]);

  return {
    checkAccess,
    executeWithAccess,
    isProcessing,
    hasFeature,
    getUsageInfo,
    UsageDisplay,
    showUpgradeModal
  };
};