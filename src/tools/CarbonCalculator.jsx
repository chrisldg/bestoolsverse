import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Leaf, Car, Home, Plane, Factory, TrendingDown, Award, Target } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const CarbonCalculator = () => {
  const [activeCategory, setActiveCategory] = useState('transport');
  const [results, setResults] = useState(null);
  const [totalFootprint, setTotalFootprint] = useState(0);
  
  const [transportData, setTransportData] = useState({
    carKm: 0,
    carType: 'essence',
    publicTransport: 0,
    flights: 0,
    flightType: 'domestique'
  });
  
  const [energyData, setEnergyData] = useState({
    electricity: 0,
    gas: 0,
    heating: 'gaz',
    houseSize: 100
  });
  
  const [consumptionData, setConsumptionData] = useState({
    meat: 'moyen',
    localFood: 50,
    newClothes: 'moyen',
    digitalUsage: 'moyen'
  });

  const categories = [
    { id: 'transport', name: 'Transport', icon: Car, color: 'blue' },
    { id: 'energy', name: 'Énergie', icon: Home, color: 'green' },
    { id: 'consumption', name: 'Consommation', icon: Factory, color: 'purple' }
  ];

  // Facteurs d'émission (kg CO2 par unité)
  const emissionFactors = {
    transport: {
      car: { essence: 0.19, diesel: 0.17, hybride: 0.11, electrique: 0.05 },
      publicTransport: 0.05,
      flights: { domestique: 0.25, europeen: 0.18, international: 0.28 }
    },
    energy: {
      electricity: 0.057, // France
      gas: 0.234,
      heating: { gaz: 0.234, electrique: 0.057, fioul: 0.324, bois: 0.013 }
    },
    consumption: {
      meat: { faible: 500, moyen: 1200, eleve: 2000 },
      clothes: { faible: 200, moyen: 400, eleve: 800 },
      digital: { faible: 150, moyen: 300, eleve: 600 }
    }
  };

  const calculateFootprint = () => {
    let transportEmissions = 0;
    let energyEmissions = 0;
    let consumptionEmissions = 0;

    // Transport
    transportEmissions += transportData.carKm * emissionFactors.transport.car[transportData.carType];
    transportEmissions += transportData.publicTransport * emissionFactors.transport.publicTransport;
    transportEmissions += transportData.flights * emissionFactors.transport.flights[transportData.flightType];

    // Énergie
    energyEmissions += energyData.electricity * emissionFactors.energy.electricity;
    energyEmissions += energyData.gas * emissionFactors.energy.gas;
    energyEmissions += (energyData.houseSize / 100) * 1000 * emissionFactors.energy.heating[energyData.heating] / 1000;

    // Consommation
    consumptionEmissions += emissionFactors.consumption.meat[consumptionData.meat];
    consumptionEmissions += emissionFactors.consumption.clothes[consumptionData.newClothes];
    consumptionEmissions += emissionFactors.consumption.digital[consumptionData.digitalUsage];
    
    // Facteur pour l'alimentation locale
    const localFoodReduction = consumptionData.localFood * 0.01 * 200;
    consumptionEmissions -= localFoodReduction;

    const total = transportEmissions + energyEmissions + consumptionEmissions;
    
    setResults({
      transport: Math.round(transportEmissions),
      energy: Math.round(energyEmissions),
      consumption: Math.round(Math.max(0, consumptionEmissions)),
      total: Math.round(total)
    });
    
    setTotalFootprint(Math.round(total));
    trackEvent('carbon_calculator', 'calculate_footprint', undefined, Math.round(total));
  };

  useEffect(() => {
    calculateFootprint();
  }, [transportData, energyData, consumptionData]);

  const getFootprintLevel = (footprint) => {
    if (footprint < 4000) return { level: 'Excellent', color: 'green', message: 'Votre empreinte est bien en dessous de la moyenne !' };
    if (footprint < 6000) return { level: 'Bon', color: 'blue', message: 'Vous êtes proche de l\'objectif climatique.' };
    if (footprint < 8000) return { level: 'Moyen', color: 'yellow', message: 'Il y a de la marge pour améliorer.' };
    if (footprint < 12000) return { level: 'Élevé', color: 'orange', message: 'Plusieurs améliorations sont possibles.' };
    return { level: 'Très élevé', color: 'red', message: 'Des changements importants sont recommandés.' };
  };

  const suggestions = [
    {
      category: 'Transport',
      tips: [
        'Utilisez les transports en commun ou le vélo',
        'Privilégiez le covoiturage ou l\'autopartage',
        'Considérez un véhicule électrique ou hybride',
        'Limitez les voyages en avion et compensez vos émissions'
      ]
    },
    {
      category: 'Énergie',
      tips: [
        'Isolez mieux votre logement',
        'Passez à un fournisseur d\'électricité verte',
        'Installez un thermostat programmable',
        'Remplacez vos appareils par des modèles économes'
      ]
    },
    {
      category: 'Consommation',
      tips: [
        'Réduisez votre consommation de viande',
        'Achetez local et de saison',
        'Réparez au lieu de jeter',
        'Limitez votre usage numérique'
      ]
    }
  ];

  const categoryData = getFootprintLevel(totalFootprint);

  return (
    <Layout 
      title="Calculateur d'Empreinte Carbone" 
      description="Calculez l'impact environnemental de vos activités numériques. Outil gratuit pour mesurer et réduire votre empreinte carbone digitale."
      keywords="calculateur empreinte carbone, impact environnemental numérique, bilan carbone digital"
    >
      <Helmet>
        <title>Calculateur d'Empreinte Carbone | BestoolsVerse</title>
        <meta name="description" content="Calculez l'impact environnemental de vos activités numériques. Outil gratuit pour mesurer et réduire votre empreinte carbone digitale." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Calculateur d'Empreinte Carbone</h1>
            <p className="text-gray-400 mt-2">Mesurez votre impact environnemental et découvrez comment le réduire</p>
          </div>
          <Leaf className="text-green-500" size={48} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Résultats */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Votre Empreinte Carbone
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {totalFootprint.toLocaleString()} kg
                </div>
                <div className="text-gray-400">CO₂ par an</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  categoryData.color === 'green' ? 'bg-green-500' :
                  categoryData.color === 'blue' ? 'bg-blue-500' :
                  categoryData.color === 'yellow' ? 'bg-yellow-500' :
                  categoryData.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                } text-white`}>
                  {categoryData.level}
                </div>
                <p className="text-sm text-gray-400 mt-2">{categoryData.message}</p>
              </div>

              {results && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Car size={16} className="mr-2 text-blue-400" />
                      Transport
                    </span>
                    <span className="text-white font-medium">{results.transport} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Home size={16} className="mr-2 text-green-400" />
                      Énergie
                    </span>
                    <span className="text-white font-medium">{results.energy} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Factory size={16} className="mr-2 text-purple-400" />
                      Consommation
                    </span>
                    <span className="text-white font-medium">{results.consumption} kg</span>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center text-blue-400 mb-2">
                  <Award size={16} className="mr-2" />
                  <span className="font-medium">Objectif climatique</span>
                </div>
                <p className="text-sm text-gray-300">
                  Pour limiter le réchauffement à 1,5°C, nous devons atteindre 2,3 tonnes CO₂/an/personne d'ici 2030.
                </p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingDown className="mr-2 text-green-500" size={20} />
                Conseils pour Réduire
              </h3>
              
              {suggestions.map((section, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-medium text-white mb-2">{section.category}</h4>
                  <ul className="space-y-1">
                    {section.tips.slice(0, 2).map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
              {/* Onglets */}
              <div className="flex border-b border-gray-700">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex-1 flex items-center justify-center py-4 px-6 transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <category.icon size={20} className="mr-2" />
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeCategory === 'transport' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Transport</h3>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Kilomètres en voiture par an</label>
                      <input
                        type="number"
                        value={transportData.carKm}
                        onChange={(e) => setTransportData({...transportData, carKm: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                        placeholder="Ex: 15000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Type de véhicule</label>
                      <select
                        value={transportData.carType}
                        onChange={(e) => setTransportData({...transportData, carType: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      >
                        <option value="essence">Essence</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybride">Hybride</option>
                        <option value="electrique">Électrique</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Kilomètres en transport en commun par an</label>
                      <input
                        type="number"
                        value={transportData.publicTransport}
                        onChange={(e) => setTransportData({...transportData, publicTransport: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                        placeholder="Ex: 3000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Kilomètres en avion par an</label>
                      <input
                        type="number"
                        value={transportData.flights}
                        onChange={(e) => setTransportData({...transportData, flights: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                        placeholder="Ex: 5000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Type de vols principaux</label>
                      <select
                        value={transportData.flightType}
                        onChange={(e) => setTransportData({...transportData, flightType: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      >
                        <option value="domestique">Domestique (&lt; 1500 km)</option>
                        <option value="europeen">Européen (1500-4000 km)</option>
                        <option value="international">International (&gt; 4000 km)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeCategory === 'energy' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Énergie du logement</h3>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Consommation électrique annuelle (kWh)</label>
                      <input
                        type="number"
                        value={energyData.electricity}
                        onChange={(e) => setEnergyData({...energyData, electricity: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                        placeholder="Ex: 4000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Consommation de gaz annuelle (kWh)</label>
                      <input
                        type="number"
                        value={energyData.gas}
                        onChange={(e) => setEnergyData({...energyData, gas: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                        placeholder="Ex: 12000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Type de chauffage principal</label>
                      <select
                        value={energyData.heating}
                        onChange={(e) => setEnergyData({...energyData, heating: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      >
                        <option value="gaz">Gaz</option>
                        <option value="electrique">Électrique</option>
                        <option value="fioul">Fioul</option>
                        <option value="bois">Bois</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Surface du logement (m²)</label>
                      <input
                        type="number"
                        value={energyData.houseSize}
                        onChange={(e) => setEnergyData({...energyData, houseSize: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                        placeholder="Ex: 100"
                      />
                    </div>
                  </div>
                )}

                {activeCategory === 'consumption' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Consommation</h3>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Consommation de viande</label>
                      <select
                        value={consumptionData.meat}
                        onChange={(e) => setConsumptionData({...consumptionData, meat: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      >
                        <option value="faible">Faible (végétarien/végétalien)</option>
                        <option value="moyen">Moyenne (2-3 fois/semaine)</option>
                        <option value="eleve">Élevée (quotidienne)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Pourcentage d'alimentation locale (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={consumptionData.localFood}
                        onChange={(e) => setConsumptionData({...consumptionData, localFood: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-1">
                        <span>0%</span>
                        <span>{consumptionData.localFood}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Achat de vêtements neufs</label>
                      <select
                        value={consumptionData.newClothes}
                        onChange={(e) => setConsumptionData({...consumptionData, newClothes: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      >
                        <option value="faible">Faible (seconde main, réparation)</option>
                        <option value="moyen">Moyenne (quelques achats/an)</option>
                        <option value="eleve">Élevée (achats fréquents)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Usage numérique (streaming, réseaux sociaux)</label>
                      <select
                        value={consumptionData.digitalUsage}
                        onChange={(e) => setConsumptionData({...consumptionData, digitalUsage: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      >
                        <option value="faible">Faible (&lt; 2h/jour)</option>
                        <option value="moyen">Moyen (2-5h/jour)</option>
                        <option value="eleve">Élevé (&gt; 5h/jour)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarbonCalculator;