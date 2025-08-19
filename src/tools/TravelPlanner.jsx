import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Plane, MapPin, Calendar, Users, DollarSign, Camera, Clock, Star, Navigation, Download, Share2, Heart, Save, Edit3, X, Plus, Sun, Cloud, CloudRain, Thermometer, Wind, Droplets, CheckCircle } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const TravelPlanner = () => {
  const [tripDetails, setTripDetails] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: 'moyen',
    interests: [],
    travelStyle: 'equilibre'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [favoriteActivities, setFavoriteActivities] = useState([]);
  const [customActivities, setCustomActivities] = useState({});
  const [isEditingDay, setIsEditingDay] = useState(null);
  const [newActivity, setNewActivity] = useState({ activite: '', horaire: '', duree: '', prix: 0 });
  const [showSavedItineraries, setShowSavedItineraries] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [sharedLink, setSharedLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const budgetOptions = [
    { id: 'economique', name: 'Économique', description: 'Voyage à petit budget', icon: '💰' },
    { id: 'moyen', name: 'Moyen', description: 'Confort et économies', icon: '💵' },
    { id: 'luxe', name: 'Luxe', description: 'Expérience premium', icon: '💎' }
  ];

  const travelStyles = [
    { id: 'aventure', name: 'Aventure', description: 'Activités sportives et sensations' },
    { id: 'culturel', name: 'Culturel', description: 'Musées, monuments, histoire' },
    { id: 'detente', name: 'Détente', description: 'Repos et bien-être' },
    { id: 'equilibre', name: 'Équilibré', description: 'Mix de tout' }
  ];

  const interestOptions = [
    'Gastronomie', 'Art et musées', 'Nature', 'Architecture', 'Vie nocturne', 
    'Shopping', 'Sport', 'Histoire', 'Plages', 'Montagne', 'Photographie', 'Famille'
  ];

  const destinations = [
    'Paris, France', 'Tokyo, Japon', 'New York, USA', 'Rome, Italie', 'Londres, Angleterre',
    'Barcelone, Espagne', 'Amsterdam, Pays-Bas', 'Prague, République tchèque', 
    'Bali, Indonésie', 'Marrakech, Maroc', 'Reykjavik, Islande', 'Bangkok, Thaïlande',
    'Sydney, Australie', 'Dubai, EAU', 'Istanbul, Turquie', 'Lisbonne, Portugal',
    'Singapour', 'Hong Kong', 'Berlin, Allemagne', 'Vienne, Autriche'
  ];

  useEffect(() => {
    // Charger les itinéraires sauvegardés
    const saved = localStorage.getItem('savedItineraries');
    if (saved) {
      setSavedItineraries(JSON.parse(saved));
    }
    
    // Charger les activités favorites
    const favorites = localStorage.getItem('favoriteActivities');
    if (favorites) {
      setFavoriteActivities(JSON.parse(favorites));
    }
  }, []);

  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const generateItinerary = () => {
    if (!tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsGenerating(true);
    trackEvent('travel_planner', 'generate_itinerary', tripDetails.destination);

    setTimeout(() => {
      const startDate = new Date(tripDetails.startDate);
      const endDate = new Date(tripDetails.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      const mockItinerary = {
        id: Date.now(),
        destination: tripDetails.destination,
        duration: days,
        startDate: tripDetails.startDate,
        endDate: tripDetails.endDate,
        travelers: tripDetails.travelers,
        budget: tripDetails.budget,
        travelStyle: tripDetails.travelStyle,
        interests: tripDetails.interests,
        dailyPlans: generateDailyPlans(days),
        recommendations: generateRecommendations(),
        budgetBreakdown: generateBudgetBreakdown(days),
        transport: generateTransportInfo(),
        accommodation: generateAccommodationInfo(),
        weather: generateWeatherInfo(days),
        packing: generatePackingList()
      };
      
      setItinerary(mockItinerary);
      setSelectedDay(1);
      setIsGenerating(false);
      setCustomActivities({});
    }, 3000);
  };

  const generateDailyPlans = (days) => {
    const activitiesByStyle = {
      aventure: {
        matin: ['Randonnée en montagne', 'Escalade', 'VTT', 'Kayak', 'Plongée', 'Parapente'],
        apresMidi: ['Via ferrata', 'Rafting', 'Tyrolienne', 'Canyoning', 'Surf', 'Quad'],
        soir: ['Observation des étoiles', 'Feu de camp', 'Récits d\'aventure', 'Bar sportif']
      },
      culturel: {
        matin: ['Visite du musée principal', 'Tour historique guidé', 'Galerie d\'art', 'Site archéologique'],
        apresMidi: ['Monuments historiques', 'Quartier artistique', 'Atelier artisanal', 'Bibliothèque historique'],
        soir: ['Spectacle traditionnel', 'Concert classique', 'Théâtre local', 'Dîner culturel']
      },
      detente: {
        matin: ['Spa et massage', 'Yoga au lever du soleil', 'Petit-déjeuner en terrasse', 'Méditation'],
        apresMidi: ['Piscine et détente', 'Promenade dans les jardins', 'Lecture au parc', 'Sieste'],
        soir: ['Dîner gastronomique', 'Coucher de soleil', 'Bar lounge', 'Soirée tranquille']
      },
      equilibre: {
        matin: ['Visite du musée principal', 'Marché local', 'Tour en bus panoramique', 'Randonnée légère'],
        apresMidi: ['Quartier artistique', 'Monument emblématique', 'Shopping', 'Activité nautique'],
        soir: ['Restaurant typique', 'Spectacle culturel', 'Bar panoramique', 'Promenade nocturne']
      }
    };

    const activities = activitiesByStyle[tripDetails.travelStyle] || activitiesByStyle.equilibre;
    
    const plans = {};
    for (let i = 1; i <= days; i++) {
      const dayOfWeek = (i - 1) % 7;
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      
      plans[i] = {
        matin: {
          activite: activities.matin[Math.floor(Math.random() * activities.matin.length)],
          horaire: isWeekend ? '10h00 - 13h00' : '9h00 - 12h00',
          duree: '3h',
          prix: generatePrice(tripDetails.budget, 'activite'),
          type: 'activite',
          reservation: Math.random() > 0.5,
          completed: false
        },
        apresMidi: {
          activite: activities.apresMidi[Math.floor(Math.random() * activities.apresMidi.length)],
          horaire: '14h00 - 17h00',
          duree: '3h',
          prix: generatePrice(tripDetails.budget, 'activite'),
          type: 'visite',
          reservation: Math.random() > 0.7,
          completed: false
        },
        soir: {
          activite: activities.soir[Math.floor(Math.random() * activities.soir.length)],
          horaire: '19h00 - 22h00',
          duree: '3h',
          prix: generatePrice(tripDetails.budget, 'repas'),
          type: 'repas',
          reservation: Math.random() > 0.6,
          completed: false
        }
      };
      
      // Appliquer les activités personnalisées si elles existent
      if (customActivities[i]) {
        plans[i] = { ...plans[i], ...customActivities[i] };
      }
    }
    return plans;
  };

  const generatePrice = (budget, type) => {
    const priceRanges = {
      economique: {
        activite: { min: 0, max: 20 },
        repas: { min: 10, max: 25 },
        transport: { min: 5, max: 15 }
      },
      moyen: {
        activite: { min: 15, max: 50 },
        repas: { min: 20, max: 50 },
        transport: { min: 10, max: 30 }
      },
      luxe: {
        activite: { min: 50, max: 200 },
        repas: { min: 50, max: 150 },
        transport: { min: 30, max: 100 }
      }
    };
    
    const range = priceRanges[budget][type] || priceRanges.moyen[type];
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
  };

  const generateRecommendations = () => {
    const restaurantTypes = {
      economique: ['Street food', 'Bistrot local', 'Marché couvert', 'Fast-food local'],
      moyen: ['Restaurant traditionnel', 'Brasserie', 'Pizzeria', 'Restaurant familial'],
      luxe: ['Restaurant étoilé', 'Fine dining', 'Restaurant panoramique', 'Chef renommé']
    };
    
    const restaurants = restaurantTypes[tripDetails.budget] || restaurantTypes.moyen;
    
    return {
      restaurants: restaurants.slice(0, 3).map((type, i) => ({
        nom: `${type} ${i + 1}`,
        type: type,
        prix: tripDetails.budget === 'economique' ? '€' : tripDetails.budget === 'luxe' ? '€€€€' : '€€',
        note: 4 + Math.random() * 0.9,
        specialite: generateSpecialite(),
        adresse: `${Math.floor(Math.random() * 100)} Rue Principale`,
        telephone: `+33 ${Math.floor(Math.random() * 900000000 + 100000000)}`
      })),
      activites: generateActivitesRecommandees(),
      conseils: generateConseils(),
      piegesATouristes: [
        'Évitez les restaurants avec photos sur le menu',
        'Ne changez pas d\'argent dans les aéroports',
        'Méfiez-vous des taxis non officiels',
        'Évitez les boutiques de souvenirs près des monuments'
      ]
    };
  };

  const generateSpecialite = () => {
    const specialites = [
      'Cuisine locale authentique', 'Fruits de mer frais', 'Plats végétariens créatifs',
      'Viandes grillées', 'Pâtisseries maison', 'Tapas variés', 'Sushi premium'
    ];
    return specialites[Math.floor(Math.random() * specialites.length)];
  };

  const generateActivitesRecommandees = () => {
    const activites = [
      { nom: 'Tour guidé à vélo', duree: '3h', prix: 35, note: 4.6, type: 'sport' },
      { nom: 'Visite gastronomique', duree: '4h', prix: 55, note: 4.8, type: 'gastronomie' },
      { nom: 'Musée d\'art moderne', duree: '2h', prix: 15, note: 4.4, type: 'culture' },
      { nom: 'Croisière au coucher du soleil', duree: '2h', prix: 45, note: 4.7, type: 'romantique' },
      { nom: 'Cours de cuisine locale', duree: '3h', prix: 75, note: 4.9, type: 'experience' }
    ];
    
    return activites.filter(a => 
      tripDetails.interests.some(interest => 
        (interest === 'Gastronomie' && a.type === 'gastronomie') ||
        (interest === 'Art et musées' && a.type === 'culture') ||
        (interest === 'Sport' && a.type === 'sport')
      ) || Math.random() > 0.5
    ).slice(0, 3);
  };

  const generateConseils = () => {
    const conseils = [
      'Téléchargez les cartes hors ligne',
      'Apprenez quelques mots dans la langue locale',
      'Gardez des copies de vos documents importants',
      'Réservez les restaurants populaires à l\'avance',
      'Utilisez les transports publics pour économiser',
      'Levez-vous tôt pour éviter les foules',
      'Goûtez la street food locale (vérifiez l\'hygiène)',
      'Respectez les coutumes locales'
    ];
    
    return conseils.slice(0, 4);
  };

  const generateBudgetBreakdown = (days) => {
    const baseBudget = {
      economique: { daily: 50, transport: 200, hotel: 60 },
      moyen: { daily: 100, transport: 400, hotel: 120 },
      luxe: { daily: 200, transport: 800, hotel: 300 }
    };

    const budget = baseBudget[tripDetails.budget];

    return {
      hebergement: budget.hotel * days * tripDetails.travelers,
      transport: budget.transport * tripDetails.travelers,
      activites: budget.daily * days * 0.4 * tripDetails.travelers,
      repas: budget.daily * days * 0.6 * tripDetails.travelers,
      divers: budget.daily * days * 0.2 * tripDetails.travelers,
      total: (budget.hotel * days + budget.transport + budget.daily * days) * tripDetails.travelers
    };
  };

  const generateTransportInfo = () => {
    const airlines = ['Air France', 'Lufthansa', 'Emirates', 'British Airways', 'KLM'];
    
    return {
      avion: {
        prix: generatePrice(tripDetails.budget, 'transport') * 10,
        duree: Math.floor(Math.random() * 8) + 2 + 'h',
        compagnie: airlines[Math.floor(Math.random() * airlines.length)],
        escales: Math.random() > 0.7 ? 1 : 0
      },
      local: {
        metro: `${(1 + Math.random() * 2).toFixed(2)}€ par trajet`,
        taxi: `${15 + Math.random() * 10}-${25 + Math.random() * 15}€ course moyenne`,
        bus: `${(1 + Math.random()).toFixed(2)}€ par trajet`,
        velo: `${10 + Math.random() * 5}€ par jour`,
        pass: `${20 + Math.random() * 10}€ pour ${Math.random() > 0.5 ? '3' : '7'} jours`
      }
    };
  };

  const generateAccommodationInfo = () => {
    const accommodations = {
      economique: [
        { nom: 'Hostel Central', type: 'Auberge', prix: 25, note: 4.2, wifi: true, petitDej: false },
        { nom: 'Budget Backpackers', type: 'Auberge', prix: 30, note: 4.0, wifi: true, petitDej: true }
      ],
      moyen: [
        { nom: 'Hotel Plaza', type: 'Hôtel 3*', prix: 85, note: 4.3, wifi: true, petitDej: true },
        { nom: 'City Suites', type: 'Aparthotel', prix: 95, note: 4.4, wifi: true, petitDej: false }
      ],
      luxe: [
        { nom: 'Grand Palace Hotel', type: 'Hôtel 5*', prix: 280, note: 4.8, wifi: true, petitDej: true },
        { nom: 'Luxury Resort & Spa', type: 'Resort', prix: 350, note: 4.9, wifi: true, petitDej: true }
      ]
    };

    return accommodations[tripDetails.budget] || accommodations.moyen;
  };

  const generateWeatherInfo = (days) => {
    const weather = [];
    const baseTemp = 15 + Math.random() * 15;
    
    for (let i = 0; i < Math.min(days, 7); i++) {
      weather.push({
        jour: i + 1,
        temp: Math.round(baseTemp + (Math.random() - 0.5) * 10),
        conditions: ['Ensoleillé', 'Nuageux', 'Partiellement nuageux', 'Légère pluie'][Math.floor(Math.random() * 4)],
        precipitation: Math.round(Math.random() * 30) + '%'
      });
    }
    
    return weather;
  };

  const generatePackingList = () => {
    const essentials = [
      'Passeport et documents', 'Cartes de crédit', 'Adaptateur universel',
      'Trousse de premiers soins', 'Médicaments personnels', 'Chargeurs'
    ];
    
    const clothingByStyle = {
      aventure: ['Chaussures de randonnée', 'Vêtements techniques', 'Sac à dos', 'Gourde'],
      culturel: ['Tenue correcte pour sites religieux', 'Chaussures confortables', 'Appareil photo'],
      detente: ['Maillot de bain', 'Lunettes de soleil', 'Crème solaire', 'Chapeau'],
      equilibre: ['Chaussures confortables', 'Tenue décontractée', 'Maillot', 'Appareil photo']
    };
    
    const weatherClothing = itinerary && itinerary.weather[0].temp < 20 ? 
      ['Veste chaude', 'Pull', 'Pantalons longs'] : 
      ['Vêtements légers', 'Shorts', 'T-shirts'];
    
    return {
      essentials,
      clothing: [...(clothingByStyle[tripDetails.travelStyle] || []), ...weatherClothing],
      autres: ['Guide de voyage', 'Sac de jour', 'Bouteille réutilisable', 'Écouteurs']
    };
  };

  const saveItinerary = () => {
    if (!itinerary) return;
    
    const newSaved = [...savedItineraries, { ...itinerary, savedAt: new Date().toISOString() }];
    setSavedItineraries(newSaved);
    saveToLocalStorage('savedItineraries', newSaved);
    alert('Itinéraire sauvegardé avec succès !');
  };

  const loadItinerary = (saved) => {
    setItinerary(saved);
    setTripDetails({
      destination: saved.destination,
      startDate: saved.startDate,
      endDate: saved.endDate,
      travelers: saved.travelers,
      budget: saved.budget,
      interests: saved.interests || [],
      travelStyle: saved.travelStyle || 'equilibre'
    });
    setSelectedDay(1);
    setShowSavedItineraries(false);
  };

  const deleteItinerary = (id) => {
    const newSaved = savedItineraries.filter(it => it.id !== id);
    setSavedItineraries(newSaved);
    saveToLocalStorage('savedItineraries', newSaved);
  };

  const toggleFavoriteActivity = (activity) => {
    const newFavorites = favoriteActivities.some(fav => fav.activite === activity.activite)
      ? favoriteActivities.filter(fav => fav.activite !== activity.activite)
      : [...favoriteActivities, activity];
    
    setFavoriteActivities(newFavorites);
    saveToLocalStorage('favoriteActivities', newFavorites);
  };

  const addCustomActivity = () => {
    if (!newActivity.activite || !newActivity.horaire) return;
    
    const period = newActivity.horaire.includes('matin') ? 'matin' : 
                   newActivity.horaire.includes('après') ? 'apresMidi' : 'soir';
    
    setCustomActivities({
      ...customActivities,
      [selectedDay]: {
        ...customActivities[selectedDay],
        [period]: {
          ...newActivity,
          prix: parseFloat(newActivity.prix) || 0,
          type: 'custom',
          reservation: false,
          completed: false
        }
      }
    });
    
    if (itinerary) {
      const updatedPlans = {
        ...itinerary.dailyPlans,
        [selectedDay]: {
          ...itinerary.dailyPlans[selectedDay],
          [period]: {
            ...newActivity,
            prix: parseFloat(newActivity.prix) || 0,
            type: 'custom',
            reservation: false,
            completed: false
          }
        }
      };
      
      setItinerary({
        ...itinerary,
        dailyPlans: updatedPlans
      });
    }
    
    setNewActivity({ activite: '', horaire: '', duree: '', prix: 0 });
    setIsEditingDay(null);
  };

  const toggleActivityCompletion = (day, period) => {
    if (!itinerary) return;
    
    const updatedPlans = {
      ...itinerary.dailyPlans,
      [day]: {
        ...itinerary.dailyPlans[day],
        [period]: {
          ...itinerary.dailyPlans[day][period],
          completed: !itinerary.dailyPlans[day][period].completed
        }
      }
    };
    
    setItinerary({
      ...itinerary,
      dailyPlans: updatedPlans
    });
  };

  const exportItinerary = () => {
    if (!itinerary) return;
    
    let content = '';
    
    if (exportFormat === 'json') {
      content = JSON.stringify(itinerary, null, 2);
    } else {
      // Format texte pour PDF ou TXT
      content = `ITINÉRAIRE DE VOYAGE - ${itinerary.destination}\n`;
      content += `Du ${new Date(itinerary.startDate).toLocaleDateString()} au ${new Date(itinerary.endDate).toLocaleDateString()}\n`;
      content += `${itinerary.travelers} voyageur(s) - Budget: ${itinerary.budget}\n\n`;
      
      Object.entries(itinerary.dailyPlans).forEach(([day, plan]) => {
        content += `\nJOUR ${day}\n`;
        content += `Matin: ${plan.matin.activite} (${plan.matin.horaire}) - ${plan.matin.prix}€\n`;
        content += `Après-midi: ${plan.apresMidi.activite} (${plan.apresMidi.horaire}) - ${plan.apresMidi.prix}€\n`;
        content += `Soir: ${plan.soir.activite} (${plan.soir.horaire}) - ${plan.soir.prix}€\n`;
      });
      
      content += `\n\nBUDGET TOTAL ESTIMÉ: ${itinerary.budgetBreakdown.total}€\n`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itineraire-${itinerary.destination.replace(/\s+/g, '-')}.${exportFormat === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareItinerary = () => {
    if (!itinerary) return;
    
    // Simuler la création d'un lien de partage
    const shareId = btoa(JSON.stringify(itinerary).slice(0, 100));
    const link = `https://yourapp.com/travel/share/${shareId}`;
    setSharedLink(link);
    setShowShareModal(true);
    
    // Copier dans le presse-papier
    navigator.clipboard.writeText(link);
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Ensoleillé': return <Sun className="text-yellow-400" />;
      case 'Nuageux': return <Cloud className="text-gray-400" />;
      case 'Partiellement nuageux': return <Cloud className="text-gray-300" />;
      case 'Légère pluie': return <CloudRain className="text-blue-400" />;
      default: return <Sun className="text-yellow-400" />;
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Travel Planner - Créez votre itinéraire de voyage parfait</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => window.history.back()}
            className="mb-6 flex items-center text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} className="mr-2" />
            Retour aux outils
          </button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">Travel Planner ✈️</h1>
            <p className="text-xl text-gray-200">Créez votre itinéraire de voyage sur mesure</p>
          </div>

          {!itinerary ? (
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
              <h2 className="text-2xl font-bold text-white mb-6">Planifiez votre voyage</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Destination */}
                <div>
                  <label className="block text-white mb-2">Destination *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      list="destinations"
                      value={tripDetails.destination}
                      onChange={(e) => setTripDetails({...tripDetails, destination: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Paris, France"
                    />
                    <datalist id="destinations">
                      {destinations.map(dest => (
                        <option key={dest} value={dest} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Date de départ *</label>
                    <input
                      type="date"
                      value={tripDetails.startDate}
                      onChange={(e) => setTripDetails({...tripDetails, startDate: e.target.value})}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Date de retour *</label>
                    <input
                      type="date"
                      value={tripDetails.endDate}
                      onChange={(e) => setTripDetails({...tripDetails, endDate: e.target.value})}
                      min={tripDetails.startDate}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Nombre de voyageurs */}
                <div>
                  <label className="block text-white mb-2">Nombre de voyageurs</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={tripDetails.travelers}
                      onChange={(e) => setTripDetails({...tripDetails, travelers: parseInt(e.target.value) || 1})}
                      min="1"
                      max="20"
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-white mb-2">Budget</label>
                  <div className="grid grid-cols-3 gap-2">
                    {budgetOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setTripDetails({...tripDetails, budget: option.id})}
                        className={`p-3 rounded-lg border transition-all ${
                          tripDetails.budget === option.id
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white bg-opacity-20 border-gray-300 text-white hover:bg-opacity-30'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style de voyage */}
              <div className="mt-6">
                <label className="block text-white mb-2">Style de voyage</label>
                <div className="grid md:grid-cols-4 gap-3">
                  {travelStyles.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setTripDetails({...tripDetails, travelStyle: style.id})}
                      className={`p-4 rounded-lg border transition-all ${
                        tripDetails.travelStyle === style.id
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white bg-opacity-20 border-gray-300 text-white hover:bg-opacity-30'
                      }`}
                    >
                      <div className="font-medium mb-1">{style.name}</div>
                      <div className="text-xs opacity-80">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Centres d'intérêt */}
              <div className="mt-6">
                <label className="block text-white mb-2">Centres d'intérêt</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      onClick={() => {
                        const newInterests = tripDetails.interests.includes(interest)
                          ? tripDetails.interests.filter(i => i !== interest)
                          : [...tripDetails.interests, interest];
                        setTripDetails({...tripDetails, interests: newInterests});
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        tripDetails.interests.includes(interest)
                          ? 'bg-pink-600 text-white'
                          : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={generateItinerary}
                  disabled={isGenerating}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Plane size={20} className="mr-2" />
                      Générer l'itinéraire
                    </>
                  )}
                </button>

                {savedItineraries.length > 0 && (
                  <button
                    onClick={() => setShowSavedItineraries(!showSavedItineraries)}
                    className="px-6 py-4 bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all flex items-center"
                  >
                    <Save size={20} className="mr-2" />
                    Mes itinéraires ({savedItineraries.length})
                  </button>
                )}
              </div>

              {/* Itinéraires sauvegardés */}
              {showSavedItineraries && savedItineraries.length > 0 && (
                <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Itinéraires sauvegardés</h3>
                  <div className="space-y-2">
                    {savedItineraries.map(saved => (
                      <div key={saved.id} className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3">
                        <div className="text-white">
                          <div className="font-medium">{saved.destination}</div>
                          <div className="text-sm opacity-80">
                            {new Date(saved.startDate).toLocaleDateString()} - {new Date(saved.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadItinerary(saved)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Charger
                          </button>
                          <button
                            onClick={() => deleteItinerary(saved.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* En-tête de l'itinéraire */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{itinerary.destination}</h2>
                    <p className="text-gray-200">
                      {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()} 
                      ({itinerary.duration} jours)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveItinerary}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Save size={18} className="mr-2" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={shareItinerary}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Share2 size={18} className="mr-2" />
                      Partager
                    </button>
                    <button
                      onClick={exportItinerary}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Download size={18} className="mr-2" />
                      Exporter
                    </button>
                  </div>
                </div>
              </div>

              {/* Météo */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Thermometer size={24} className="mr-2" />
                  Prévisions météo
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {itinerary.weather.map(day => (
                    <div key={day.jour} className="text-center bg-white bg-opacity-10 rounded-lg p-3">
                      <div className="text-white font-medium mb-2">Jour {day.jour}</div>
                      <div className="flex justify-center mb-2">{getWeatherIcon(day.conditions)}</div>
                      <div className="text-white text-lg font-bold">{day.temp}°C</div>
                      <div className="text-gray-300 text-xs mt-1">{day.conditions}</div>
                      <div className="text-gray-400 text-xs flex items-center justify-center mt-1">
                        <Droplets size={12} className="mr-1" />
                        {day.precipitation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation des jours */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Object.keys(itinerary.dailyPlans).map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(parseInt(day))}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        selectedDay === parseInt(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                    >
                      Jour {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan du jour sélectionné */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Jour {selectedDay} - Programme
                  </h3>
                  <button
                    onClick={() => setIsEditingDay(isEditingDay === selectedDay ? null : selectedDay)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                  >
                    <Edit3 size={18} className="mr-2" />
                    {isEditingDay === selectedDay ? 'Fermer' : 'Modifier'}
                  </button>
                </div>

                {isEditingDay === selectedDay && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-3">Ajouter une activité personnalisée</h4>
                    <div className="grid md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Activité"
                        value={newActivity.activite}
                        onChange={(e) => setNewActivity({...newActivity, activite: e.target.value})}
                        className="px-3 py-2 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300"
                      />
                      <select
                        value={newActivity.horaire}
                        onChange={(e) => setNewActivity({...newActivity, horaire: e.target.value})}
                        className="px-3 py-2 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white"
                      >
                        <option value="">Période</option>
                        <option value="matin">Matin</option>
                        <option value="après-midi">Après-midi</option>
                        <option value="soir">Soir</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Durée"
                        value={newActivity.duree}
                        onChange={(e) => setNewActivity({...newActivity, duree: e.target.value})}
                        className="px-3 py-2 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Prix"
                          value={newActivity.prix}
                          onChange={(e) => setNewActivity({...newActivity, prix: e.target.value})}
                          className="flex-1 px-3 py-2 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-300"
                        />
                        <button
                          onClick={addCustomActivity}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {['matin', 'apresMidi', 'soir'].map(period => {
                    const activity = itinerary.dailyPlans[selectedDay][period];
                    return (
                      <div
                        key={period}
                        className={`bg-white bg-opacity-10 rounded-lg p-4 ${
                          activity.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Clock size={18} className="text-gray-300 mr-2" />
                              <span className="text-gray-300 font-medium">
                                {period === 'matin' ? 'Matin' : period === 'apresMidi' ? 'Après-midi' : 'Soir'}
                              </span>
                              <span className="text-gray-400 ml-2">• {activity.horaire}</span>
                              {activity.reservation && (
                                <span className="ml-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                                  Réservation conseillée
                                </span>
                              )}
                            </div>
                            <h4 className={`text-xl font-semibold text-white mb-1 ${
                              activity.completed ? 'line-through' : ''
                            }`}>
                              {activity.activite}
                            </h4>
                            <div className="flex items-center gap-4 text-gray-300">
                              <span className="flex items-center">
                                <Clock size={16} className="mr-1" />
                                {activity.duree}
                              </span>
                              <span className="flex items-center">
                                <DollarSign size={16} className="mr-1" />
                                {activity.prix}€
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleActivityCompletion(selectedDay, period)}
                              className={`p-2 rounded-lg transition-colors ${
                                activity.completed
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                              }`}
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => toggleFavoriteActivity(activity)}
                              className={`p-2 rounded-lg transition-colors ${
                                favoriteActivities.some(fav => fav.activite === activity.activite)
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                              }`}
                            >
                              <Heart size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Budget détaillé */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <DollarSign size={24} className="mr-2" />
                  Budget estimé
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {Object.entries(itinerary.budgetBreakdown).map(([key, value]) => (
                      key !== 'total' && (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-gray-300 capitalize">{key}</span>
                          <span className="text-white font-medium">{value}€</span>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="bg-blue-600 bg-opacity-30 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-gray-300 mb-2">Budget total estimé</div>
                      <div className="text-3xl font-bold text-white">{itinerary.budgetBreakdown.total}€</div>
                      <div className="text-gray-300 mt-2">
                        Pour {itinerary.travelers} personne{itinerary.travelers > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Restaurants */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h3 className="text-xl font-bold text-white mb-4">Restaurants recommandés</h3>
                  <div className="space-y-3">
                    {itinerary.recommendations.restaurants.map((resto, idx) => (
                      <div key={idx} className="bg-white bg-opacity-10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{resto.nom}</h4>
                          <div className="flex items-center text-yellow-400">
                            <Star size={16} fill="currentColor" />
                            <span className="ml-1 text-white">{resto.note.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">{resto.type} • {resto.prix}</p>
                        <p className="text-gray-400 text-sm">{resto.specialite}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activités recommandées */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h3 className="text-xl font-bold text-white mb-4">Activités bonus</h3>
                  <div className="space-y-3">
                    {itinerary.recommendations.activites.map((activite, idx) => (
                      <div key={idx} className="bg-white bg-opacity-10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{activite.nom}</h4>
                          <div className="flex items-center text-yellow-400">
                            <Star size={16} fill="currentColor" />
                            <span className="ml-1 text-white">{activite.note.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300 text-sm">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {activite.duree}
                          </span>
                          <span className="flex items-center">
                            <DollarSign size={14} className="mr-1" />
                            {activite.prix}€
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transport */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Navigation size={24} className="mr-2" />
                  Informations transport
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Vol aller-retour</h4>
                    <div className="bg-white bg-opacity-10 rounded-lg p-4">
                      <div className="space-y-2 text-gray-300">
                        <div className="flex justify-between">
                          <span>Compagnie</span>
                          <span className="text-white">{itinerary.transport.avion.compagnie}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Durée</span>
                          <span className="text-white">{itinerary.transport.avion.duree}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prix estimé</span>
                          <span className="text-white font-medium">{itinerary.transport.avion.prix}€</span>
                        </div>
                        {itinerary.transport.avion.escales > 0 && (
                          <div className="flex justify-between">
                            <span>Escales</span>
                            <span className="text-white">{itinerary.transport.avion.escales}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3">Transports locaux</h4>
                    <div className="bg-white bg-opacity-10 rounded-lg p-4">
                      <div className="space-y-2 text-gray-300">
                        <div className="flex justify-between">
                          <span>Métro/Bus</span>
                          <span className="text-white">{itinerary.transport.local.metro}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxi</span>
                          <span className="text-white">{itinerary.transport.local.taxi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pass transport</span>
                          <span className="text-white">{itinerary.transport.local.pass}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste de bagages */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4">Liste de bagages</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Essentiels</h4>
                    <ul className="space-y-1">
                      {itinerary.packing.essentials.map((item, idx) => (
                        <li key={idx} className="text-white flex items-center">
                          <CheckCircle size={16} className="mr-2 text-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Vêtements</h4>
                    <ul className="space-y-1">
                      {itinerary.packing.clothing.map((item, idx) => (
                        <li key={idx} className="text-white flex items-center">
                          <CheckCircle size={16} className="mr-2 text-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Autres</h4>
                    <ul className="space-y-1">
                      {itinerary.packing.autres.map((item, idx) => (
                        <li key={idx} className="text-white flex items-center">
                          <CheckCircle size={16} className="mr-2 text-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Conseils */}
              <div className="bg-yellow-600 bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-600 border-opacity-30">
                <h3 className="text-xl font-bold text-white mb-4">Conseils pratiques</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-yellow-300 mb-2">Recommandations</h4>
                    <ul className="space-y-2">
                      {itinerary.recommendations.conseils.map((conseil, idx) => (
                        <li key={idx} className="text-white flex items-start">
                          <CheckCircle size={16} className="mr-2 mt-1 text-yellow-400 flex-shrink-0" />
                          {conseil}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-300 mb-2">Pièges à touristes</h4>
                    <ul className="space-y-2">
                      {itinerary.recommendations.piegesATouristes.map((piege, idx) => (
                        <li key={idx} className="text-white flex items-start">
                          <X size={16} className="mr-2 mt-1 text-red-400 flex-shrink-0" />
                          {piege}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bouton nouveau voyage */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setItinerary(null);
                    setTripDetails({
                      destination: '',
                      startDate: '',
                      endDate: '',
                      travelers: 2,
                      budget: 'moyen',
                      interests: [],
                      travelStyle: 'equilibre'
                    });
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Planifier un nouveau voyage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de partage */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Partager l'itinéraire</h3>
            <p className="text-gray-600 mb-4">Le lien a été copié dans votre presse-papier !</p>
            <div className="bg-gray-100 p-3 rounded mb-4 break-all text-sm">
              {sharedLink}
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal d'export */}
      <div className="hidden">
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className="absolute top-0 left-0"
        >
          <option value="pdf">PDF</option>
          <option value="txt">Texte</option>
          <option value="json">JSON</option>
        </select>
      </div>
    </Layout>
  );
};

export default TravelPlanner;