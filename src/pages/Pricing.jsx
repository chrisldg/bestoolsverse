import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { Check, X, Star, Zap, Users, Shield, Clock, ArrowRight } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: billingPeriod === 'monthly' ? '0€' : '0€',
      period: 'pour toujours',
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
      buttonColor: 'bg-gray-700 hover:bg-gray-600',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingPeriod === 'monthly' ? '9,99€' : '99€',
      period: billingPeriod === 'monthly' ? 'par mois' : 'par an',
      savings: billingPeriod === 'yearly' ? 'Économisez 17%' : null,
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
        { text: 'API Access (500 req/mois)', included: false }
      ],
      popular: true,
      buttonText: 'Commencer l\'essai gratuit (14 jours)',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'business',
      name: 'Business',
      price: billingPeriod === 'monthly' ? '29,99€' : '299€',
      period: billingPeriod === 'monthly' ? 'par mois' : 'par an',
      savings: billingPeriod === 'yearly' ? 'Économisez 17%' : null,
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
        { text: 'Collaboration d\'équipe', included: true },
        { text: 'API Access illimité', included: true }
      ],
      buttonText: 'Contacter le vendeur',
      buttonColor: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
      popular: false
    }
  ];
  
  const faqs = [
    {
      question: 'Puis-je changer de forfait à tout moment ?',
      answer: 'Oui, vous pouvez passer à un forfait supérieur ou inférieur à tout moment. Les changements prendront effet à la prochaine période de facturation. Si vous passez à un forfait supérieur, la différence sera calculée au prorata.'
    },
    {
      question: 'Y a-t-il un engagement de durée ?',
      answer: 'Non, tous nos forfaits sont sans engagement. Vous pouvez annuler à tout moment et votre abonnement restera actif jusqu\'à la fin de la période de facturation en cours. Aucune pénalité ne sera appliquée.'
    },
    {
      question: 'Comment fonctionne l\'essai gratuit ?',
      answer: 'L\'essai gratuit vous donne accès à toutes les fonctionnalités du forfait Pro pendant 14 jours. Aucune carte de crédit n\'est requise pour commencer l\'essai. Vous recevrez des rappels avant la fin de la période d\'essai.'
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), PayPal, et dans certains pays, le prélèvement bancaire SEPA. Tous les paiements sont sécurisés et cryptés.'
    },
    {
      question: 'Proposez-vous des forfaits pour les étudiants ou les organisations à but non lucratif ?',
      answer: 'Oui, nous offrons une réduction de 50% pour les étudiants, les établissements d\'enseignement et les organisations à but non lucratif. Contactez-nous avec une preuve de votre statut pour bénéficier de cette offre.'
    },
    {
      question: 'Comment fonctionne le support prioritaire ?',
      answer: 'Le support prioritaire place vos demandes en tête de file d\'attente, garantissant une réponse plus rapide. Les clients Business bénéficient d\'un support dédié avec un temps de réponse garanti de 2 heures pendant les heures ouvrables.'
    },
    {
      question: 'Puis-je utiliser BestoolsVerse pour des projets commerciaux ?',
      answer: 'Oui, les forfaits Pro et Business incluent l\'utilisation commerciale. Cela signifie que vous pouvez utiliser les contenus créés avec nos outils pour vos clients, votre entreprise, ou à des fins lucratives.'
    },
    {
      question: 'Que se passe-t-il si je dépasse les limites de mon forfait ?',
      answer: 'Pour le forfait Gratuit, vous serez limité jusqu\'au renouvellement quotidien. Pour les forfaits payants, nous vous contacterons pour discuter d\'une mise à niveau si nécessaire. Aucun surcoût surprise ne sera appliqué.'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Designer Graphique',
      company: 'Studio Créatif',
      content: 'BestoolsVerse a révolutionné ma façon de travailler. Les outils IA me font gagner un temps considérable, et la qualité des résultats est exceptionnelle.',
      rating: 5
    },
    {
      name: 'Thomas Martin',
      role: 'Marketing Manager',
      company: 'TechStart',
      content: 'Depuis que nous utilisons BestoolsVerse, notre productivité a augmenté de 40%. Les outils sont intuitifs et les résultats toujours à la hauteur.',
      rating: 5
    },
    {
      name: 'Sophie Laurent',
      role: 'Freelance',
      company: 'Indépendante',
      content: 'En tant que freelance, BestoolsVerse me permet d\'offrir des services variés à mes clients sans avoir besoin d\'acheter des dizaines de logiciels différents.',
      rating: 5
    }
  ];

  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
    trackEvent('pricing', 'plan_selected', planId);
  };

  const handleStartTrial = (planId) => {
    trackEvent('pricing', 'start_trial', planId);
    // Ici, vous ajouteriez la logique de redirection vers le processus d'inscription
    alert(`Redirection vers l'inscription pour le plan ${planId}`);
  };

  const PlanCard = ({ plan }) => (
    <div className={`relative bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border transition-all duration-300 hover:shadow-xl ${
      plan.popular 
        ? 'border-blue-500 shadow-blue-500/20' 
        : 'border-gray-700 hover:border-gray-500'
    } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Star size={14} className="mr-1" />
            Le plus populaire
          </div>
        </div>
      )}
      
      {plan.savings && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            {plan.savings}
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-bold text-white">{plan.price}</span>
            <span className="text-gray-400 ml-2">/{plan.period}</span>
          </div>
          <p className="text-gray-300">{plan.description}</p>
        </div>
        
        <button
          onClick={() => handlePlanSelection(plan.id)}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 mb-6 ${plan.buttonColor} text-white`}
        >
          {plan.buttonText}
        </button>
        
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              {feature.included ? (
                <Check className="text-green-400 mr-3 mt-1 flex-shrink-0" size={16} />
              ) : (
                <X className="text-gray-500 mr-3 mt-1 flex-shrink-0" size={16} />
              )}
              <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout 
      title="Tarification" 
      description="Découvrez nos forfaits pour BestoolsVerse. Commencez gratuitement ou passez à Pro pour accéder à toutes les fonctionnalités avancées et à l'utilisation commerciale."
      keywords="prix, tarif, abonnement, forfait, gratuit, pro, business, essai gratuit"
    >
      <Helmet>
        <title>Tarification | BestoolsVerse - Plans et Prix</title>
        <meta name="description" content="Découvrez nos forfaits pour BestoolsVerse. Commencez gratuitement ou passez à Pro pour accéder à toutes les fonctionnalités avancées et à l'utilisation commerciale." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Des tarifs simples et transparents
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choisissez le forfait qui correspond le mieux à vos besoins. Commencez gratuitement et passez à un forfait payant quand vous êtes prêt.
          </p>
          
          {/* Toggle de facturation */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Annuel
            </span>
            {billingPeriod === 'yearly' && (
              <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                -17%
              </span>
            )}
          </div>
        </div>
        
        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        
        {/* Comparaison détaillée */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Comparaison détaillée des forfaits
          </h2>
          
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-white font-semibold">Fonctionnalités</th>
                    <th className="text-center p-4 text-white font-semibold">Gratuit</th>
                    <th className="text-center p-4 text-white font-semibold">Pro</th>
                    <th className="text-center p-4 text-white font-semibold">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Nombre d'outils</td>
                    <td className="p-4 text-center text-gray-300">20</td>
                    <td className="p-4 text-center text-gray-300">20</td>
                    <td className="p-4 text-center text-gray-300">20</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Utilisations par jour</td>
                    <td className="p-4 text-center text-gray-300">5 par outil</td>
                    <td className="p-4 text-center text-green-400">Illimité</td>
                    <td className="p-4 text-center text-green-400">Illimité</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Qualité des exports</td>
                    <td className="p-4 text-center text-gray-300">Standard</td>
                    <td className="p-4 text-center text-gray-300">Haute</td>
                    <td className="p-4 text-center text-green-400">Premium</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Support client</td>
                    <td className="p-4 text-center text-gray-300">Communauté</td>
                    <td className="p-4 text-center text-gray-300">Email (24h)</td>
                    <td className="p-4 text-center text-green-400">Dédié (2h)</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Collaboration équipe</td>
                    <td className="p-4 text-center text-gray-500">
                      <X size={16} className="mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-500">
                      <X size={16} className="mx-auto" />
                    </td>
                    <td className="p-4 text-center text-green-400">
                      <Check size={16} className="mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-300">API Access</td>
                    <td className="p-4 text-center text-gray-500">
                      <X size={16} className="mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-300">500/mois</td>
                    <td className="p-4 text-center text-green-400">Illimité</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Témoignages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Ce que disent nos utilisateurs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role} - {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à démarrer avec BestoolsVerse ?
            </h2>
            <p className="text-xl text-gray-100 mb-6">
              Rejoignez plus de 50 000 créateurs qui utilisent déjà nos outils pour donner vie à leurs idées.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => handleStartTrial('free')}
                className="bg-white text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Commencer gratuitement
              </button>
              <button
                onClick={() => handleStartTrial('pro')}
                className="bg-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center justify-center"
              >
                Essai Pro gratuit
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
        
        {/* FAQ */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">Vous avez d'autres questions ?</p>
            <a 
              href="/contact" 
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Contactez notre équipe support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;