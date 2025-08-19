import React, { useState } from 'react';
import { Check, X, Star, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';


// Initialiser Stripe (remplacer par votre clé publique)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const plans = {
    free: {
      name: 'Gratuit',
      price: { monthly: 0, annual: 0 },
      description: 'Parfait pour découvrir nos outils et les utiliser occasionnellement.',
      features: [
        { text: 'Accès à tous les outils', included: true },
        { text: 'Utilisation limitée de chaque outil (5/jour)', included: true },
        { text: 'Résultats en qualité standard', included: true },
        { text: 'Publicités non intrusives', included: true },
        { text: 'Support communautaire', included: true },
        { text: 'Historique des créations (7 jours)', included: true },
        { text: 'Utilisation commerciale', included: false },
        { text: 'Options avancées', included: false },
        { text: 'Export haute résolution', included: false },
        { text: 'Support prioritaire', included: false },
        { text: 'API Access', included: false }
      ],
      buttonText: 'Commencer gratuitement',
      buttonStyle: 'bg-gray-700 hover:bg-gray-600',
      popular: false
    },
    pro: {
      name: 'Pro',
      price: { monthly: 9.99, annual: 99 },
      description: 'Idéal pour les professionnels et les créateurs de contenu réguliers.',
      features: [
        { text: 'Accès à tous les outils', included: true },
        { text: 'Utilisation illimitée de chaque outil', included: true },
        { text: 'Résultats en haute qualité', included: true },
        { text: 'Sans publicité', included: true },
        { text: 'Support par email (24h)', included: true },
        { text: 'Historique des créations (30 jours)', included: true },
        { text: 'Utilisation commerciale', included: true },
        { text: 'Options avancées', included: true },
        { text: 'Export haute résolution', included: true },
        { text: 'Templates premium', included: true },
        { text: 'API Access (500 req/mois)', included: true }
      ],
      buttonText: "Commencer l'essai gratuit (14 jours)",
      buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      popular: true,
      savings: billingPeriod === 'annual' ? '17%' : null
    },
    business: {
      name: 'Business',
      price: { monthly: 29.99, annual: 299 },
      description: 'Pour les équipes et entreprises avec des besoins avancés.',
      features: [
        { text: 'Accès à tous les outils', included: true },
        { text: 'Utilisation illimitée de chaque outil', included: true },
        { text: 'Résultats en qualité premium', included: true },
        { text: 'Sans publicité', included: true },
        { text: 'Support dédié (2h)', included: true },
        { text: 'Historique illimité', included: true },
        { text: 'Utilisation commerciale', included: true },
        { text: 'Options avancées et exclusives', included: true },
        { text: 'Export en tous formats', included: true },
        { text: "Collaboration d'équipe", included: true },
        { text: 'API Access illimité', included: true }
      ],
      buttonText: 'Contacter le vendeur',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700',
      popular: false,
      savings: billingPeriod === 'annual' ? '17%' : null
    }
  };

  const handleCheckout = async (planKey) => {
    if (planKey === 'free') {
      navigate('/register');
      return;
    }

    if (planKey === 'business') {
      navigate('/contact-sales');
      return;
    }

    setLoading(true);
    try {
      const stripe = await stripePromise;
      
      // Appeler votre backend pour créer une session Stripe
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: billingPeriod === 'monthly' 
            ? process.env[`REACT_APP_STRIPE_${planKey.toUpperCase()}_MONTHLY_PRICE_ID`]
            : process.env[`REACT_APP_STRIPE_${planKey.toUpperCase()}_ANNUAL_PRICE_ID`],
          userId: currentUser?.uid,
          customerEmail: currentUser?.email
        }),
      });

      const session = await response.json();

      // Rediriger vers Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors du checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Débloquez tout le potentiel de BestoolsVerse
          </p>

          {/* Toggle Billing Period */}
          <div className="flex items-center justify-center space-x-4">
            <span className={billingPeriod === 'monthly' ? 'text-white' : 'text-gray-500'}>
              Mensuel
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-blue-600 transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingPeriod === 'annual' ? 'text-white' : 'text-gray-500'}>
              Annuel
              <span className="ml-2 text-green-500 text-sm">-17%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`relative bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl border ${
                plan.popular ? 'border-blue-500' : 'border-gray-700'
              } p-8 hover:scale-105 transition-transform duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star size={16} className="mr-1" />
                    Le plus populaire
                  </div>
                </div>
              )}

              {plan.savings && billingPeriod === 'annual' && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Économisez {plan.savings}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  {plan.price[billingPeriod] === 0 ? (
                    <span className="text-4xl font-bold">0€</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">
                        {billingPeriod === 'annual' 
                          ? Math.floor(plan.price.annual / 12)
                          : plan.price.monthly}
                      </span>
                      <span className="text-xl ml-1">€</span>
                      <span className="text-gray-400 ml-2">
                        /{billingPeriod === 'annual' ? 'mois' : 'mois'}
                      </span>
                    </>
                  )}
                </div>
                {billingPeriod === 'annual' && plan.price.annual > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    Facturé {plan.price.annual}€ par an
                  </p>
                )}
              </div>

              <button
                onClick={() => handleCheckout(key)}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${plan.buttonStyle} ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Chargement...' : plan.buttonText}
              </button>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="text-green-500 mr-3 mt-0.5" size={20} />
                    ) : (
                      <X className="text-gray-600 mr-3 mt-0.5" size={20} />
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Garantie satisfait ou remboursé</h3>
            <p className="text-gray-400">
              30 jours pour essayer sans risque
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mises à jour gratuites</h3>
            <p className="text-gray-400">
              Accès aux nouveaux outils dès leur sortie
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Support premium</h3>
            <p className="text-gray-400">
              Assistance dédiée pour les plans payants
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-400">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. 
                Les changements prennent effet immédiatement et sont calculés au prorata.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">
                Quels moyens de paiement acceptez-vous ?
              </h3>
              <p className="text-gray-400">
                Nous acceptons toutes les cartes de crédit/débit majeures (Visa, Mastercard, 
                American Express) ainsi que PayPal et SEPA pour les paiements européens.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">
                Y a-t-il des frais cachés ?
              </h3>
              <p className="text-gray-400">
                Non, absolument aucun frais caché. Le prix affiché est le prix final. 
                La TVA est incluse dans tous nos tarifs.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">
                Puis-je annuler mon abonnement ?
              </h3>
              <p className="text-gray-400">
                Oui, vous pouvez annuler votre abonnement à tout moment sans frais. 
                Vous continuerez à avoir accès jusqu'à la fin de votre période de facturation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;