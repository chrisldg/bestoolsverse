// src/tools/MealPlanner.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Calendar, ShoppingCart, Heart, Clock, Users, Utensils, Wand2, Download, Trash2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const MealPlanner = () => {
  const [preferences, setPreferences] = useState({
    diet: 'normal',
    servings: 2,
    budget: 'moyen',
    time: 'moyen'
  });
  
  const [weekPlan, setWeekPlan] = useState({
    lundi: { dejeuner: '', diner: '' },
    mardi: { dejeuner: '', diner: '' },
    mercredi: { dejeuner: '', diner: '' },
    jeudi: { dejeuner: '', diner: '' },
    vendredi: { dejeuner: '', diner: '' },
    samedi: { dejeuner: '', diner: '' },
    dimanche: { dejeuner: '', diner: '' }
  });

  const [shoppingList, setShoppingList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const diets = [
    { id: 'normal', name: 'Normal', icon: '🍽️' },
    { id: 'vegetarien', name: 'Végétarien', icon: '🥗' },
    { id: 'vegan', name: 'Vegan', icon: '🌱' },
    { id: 'sans-gluten', name: 'Sans gluten', icon: '🌾' },
    { id: 'keto', name: 'Keto', icon: '🥑' }
  ];

  const mealDatabase = {
    normal: {
      dejeuner: [
        'Poulet rôti avec légumes de saison',
        'Spaghetti bolognaise maison',
        'Saumon grillé et riz sauvage',
        'Pizza margherita',
        'Bœuf bourguignon',
        'Quiche lorraine et salade verte',
        'Escalope de veau à la crème'
      ],
      diner: [
        'Soupe de légumes et croque-monsieur',
        'Salade César au poulet',
        'Risotto aux champignons',
        'Tarte aux poireaux',
        'Gratin dauphinois et jambon',
        'Crêpes salées variées',
        'Plateau de fromages et charcuterie'
      ]
    },
    vegetarien: {
      dejeuner: [
        'Curry de légumes au lait de coco',
        'Lasagnes aux légumes grillés',
        'Buddha bowl quinoa et falafels',
        'Pizza quatre fromages',
        'Pad thaï végétarien',
        'Gratin de courgettes',
        'Tacos aux haricots noirs'
      ],
      diner: [
        'Soupe miso aux légumes',
        'Salade grecque avec feta',
        'Omelette aux champignons',
        'Bruschetta tomates-mozzarella',
        'Croque-monsieur végétarien',
        'Taboulé libanais',
        'Gaspacho et pain grillé'
      ]
    },
    vegan: {
      dejeuner: [
        'Bowl de légumes rôtis et houmous',
        'Pâtes à la sauce tomate et basilic',
        'Curry de pois chiches',
        'Burger végétal maison',
        'Wok de légumes au tofu',
        'Chili sin carne',
        'Ratatouille et quinoa'
      ],
      diner: [
        'Soupe de lentilles corail',
        'Salade de quinoa aux légumes',
        'Toast à l\'avocat',
        'Wrap aux légumes grillés',
        'Gazpacho andalou',
        'Salade de pâtes végane',
        'Smoothie bowl aux fruits'
      ]
    },
    'sans-gluten': {
      dejeuner: [
        'Poulet grillé et légumes vapeur',
        'Risotto aux fruits de mer',
        'Bœuf sauté aux légumes asiatiques',
        'Saumon en papillote',
        'Ratatouille niçoise',
        'Tajine de légumes',
        'Poêlée de crevettes au curry'
      ],
      diner: [
        'Salade niçoise',
        'Soupe de poisson',
        'Omelette aux fines herbes',
        'Carpaccio de bœuf',
        'Plateau de fruits de mer',
        'Salade de riz aux légumes',
        'Gaspacho et légumes crus'
      ]
    },
    keto: {
      dejeuner: [
        'Steak et brocolis au beurre',
        'Saumon et avocat',
        'Poulet au fromage et épinards',
        'Côtelettes d\'agneau grillées',
        'Crevettes à l\'ail et courgetti',
        'Bœuf et chou-fleur rôti',
        'Porc effiloché et salade'
      ],
      diner: [
        'Salade César sans croûtons',
        'Soupe de brocoli au fromage',
        'Œufs brouillés au bacon',
        'Salade d\'avocat et thon',
        'Fromage et noix',
        'Bouillon d\'os aux légumes',
        'Carpaccio de saumon'
      ]
    }
  };

  const generateMealPlan = () => {
    setIsGenerating(true);
    trackEvent('meal_planner', 'generate_plan', preferences.diet);
    
    setTimeout(() => {
      const meals = mealDatabase[preferences.diet] || mealDatabase.normal;
      const jours = Object.keys(weekPlan);
      const newPlan = {};
      const ingredients = new Set();
      
      jours.forEach(jour => {
        const dejeunerIndex = Math.floor(Math.random() * meals.dejeuner.length);
        const dinerIndex = Math.floor(Math.random() * meals.diner.length);
        
        newPlan[jour] = {
          dejeuner: meals.dejeuner[dejeunerIndex],
          diner: meals.diner[dinerIndex]
        };
        
        // Extraire les ingrédients principaux (simulation)
        const extractIngredients = (meal) => {
          const commonIngredients = meal.toLowerCase().split(' ');
          commonIngredients.forEach(word => {
            if (word.length > 4 && !['avec', 'sans', 'aux', 'grillé', 'rôti'].includes(word)) {
              ingredients.add(word);
            }
          });
        };
        
        extractIngredients(newPlan[jour].dejeuner);
        extractIngredients(newPlan[jour].diner);
      });
      
      setWeekPlan(newPlan);
      
      // Générer la liste de courses
      const baseIngredients = [
        'Huile d\'olive', 'Sel', 'Poivre', 'Ail', 'Oignon',
        'Tomates', 'Salade verte', 'Pain', 'Beurre', 'Lait'
      ];
      
      const dietSpecificIngredients = {
        normal: ['Poulet', 'Bœuf', 'Poisson', 'Œufs', 'Fromage'],
        vegetarien: ['Tofu', 'Légumineuses', 'Quinoa', 'Fromage', 'Œufs'],
        vegan: ['Tofu', 'Légumineuses', 'Quinoa', 'Lait végétal', 'Levure nutritionnelle'],
        'sans-gluten': ['Riz', 'Quinoa', 'Pommes de terre', 'Légumes variés', 'Viande'],
        keto: ['Avocat', 'Fromage', 'Crème', 'Noix', 'Légumes verts']
      };
      
      const finalIngredients = [
        ...baseIngredients,
        ...dietSpecificIngredients[preferences.diet]
      ];
      
      setShoppingList(finalIngredients);
      setIsGenerating(false);
    }, 2000);
  };

  const savePlan = () => {
    const planData = {
      preferences,
      weekPlan,
      shoppingList,
      date: new Date().toISOString()
    };
    
    localStorage.setItem('mealPlan', JSON.stringify(planData));
    trackEvent('meal_planner', 'save_plan');
    alert('Plan de repas sauvegardé !');
  };

  const loadSavedPlan = () => {
    const saved = localStorage.getItem('mealPlan');
    if (saved) {
      const data = JSON.parse(saved);
      setPreferences(data.preferences);
      setWeekPlan(data.weekPlan);
      setShoppingList(data.shoppingList || []);
    }
  };

  const exportPlan = () => {
    let content = 'PLAN DE REPAS DE LA SEMAINE\n\n';
    content += `Régime: ${preferences.diet}\n`;
    content += `Personnes: ${preferences.servings}\n`;
    content += `Budget: ${preferences.budget}\n\n`;
    
    Object.entries(weekPlan).forEach(([jour, repas]) => {
      content += `${jour.toUpperCase()}\n`;
      content += `Déjeuner: ${repas.dejeuner}\n`;
      content += `Dîner: ${repas.diner}\n\n`;
    });
    
    content += '\nLISTE DE COURSES:\n';
    shoppingList.forEach(item => {
      content += `- ${item}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan-repas-semaine.txt';
    a.click();
    
    trackEvent('meal_planner', 'export_plan');
  };

  const toggleFavorite = (jour, moment) => {
    const meal = weekPlan[jour][moment];
    if (!meal) return;
    
    const favoriteKey = `${jour}-${moment}`;
    if (favorites.includes(favoriteKey)) {
      setFavorites(favorites.filter(f => f !== favoriteKey));
    } else {
      setFavorites([...favorites, favoriteKey]);
    }
  };

  const clearDay = (jour) => {
    setWeekPlan({
      ...weekPlan,
      [jour]: { dejeuner: '', diner: '' }
    });
  };

  useEffect(() => {
    loadSavedPlan();
  }, []);

  const calculateCalories = () => {
    const caloriesPerMeal = {
      normal: { dejeuner: 600, diner: 400 },
      vegetarien: { dejeuner: 550, diner: 350 },
      vegan: { dejeuner: 500, diner: 350 },
      'sans-gluten': { dejeuner: 550, diner: 400 },
      keto: { dejeuner: 700, diner: 500 }
    };
    
    return caloriesPerMeal[preferences.diet] || caloriesPerMeal.normal;
  };

  const totalCaloriesPerDay = calculateCalories();

  return (
    <Layout 
      title="Planificateur de Repas IA" 
      description="Créez des plans de repas personnalisés avec notre IA. Menus équilibrés selon vos goûts, régime et budget."
      keywords="planificateur repas, meal planner, menu semaine, nutrition"
    >
      <Helmet>
        <title>Planificateur de Repas IA | BestoolsVerse</title>
        <meta name="description" content="Créez des plans de repas personnalisés avec notre IA. Menus équilibrés selon vos goûts, régime et budget." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Planificateur de Repas IA</h1>
            <p className="text-gray-400 mt-2">Créez des menus équilibrés et savoureux</p>
          </div>
          <Utensils className="text-green-500" size={48} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Préférences */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vos préférences</h3>
              
              {/* Régime alimentaire */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Régime alimentaire</label>
                <div className="space-y-2">
                  {diets.map(diet => (
                    <button
                      key={diet.id}
                      onClick={() => setPreferences({...preferences, diet: diet.id})}
                      className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors ${
                        preferences.diet === diet.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span>{diet.name}</span>
                      <span className="text-2xl">{diet.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de personnes */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  <Users size={16} className="inline mr-2" />
                  Nombre de personnes : {preferences.servings}
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={preferences.servings}
                  onChange={(e) => setPreferences({...preferences, servings: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              {/* Budget */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Budget par semaine</label>
                <select
                  value={preferences.budget}
                  onChange={(e) => setPreferences({...preferences, budget: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                >
                  <option value="eco">Économique (&lt; 50€)</option>
                  <option value="moyen">Moyen (50-100€)</option>
                  <option value="eleve">Élevé (&gt; 100€)</option>
                </select>
              </div>

              {/* Temps de préparation */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Temps de préparation
                </label>
                <select
                  value={preferences.time}
                  onChange={(e) => setPreferences({...preferences, time: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                >
                  <option value="rapide">Rapide (&lt; 30 min)</option>
                  <option value="moyen">Moyen (30-60 min)</option>
                  <option value="long">Long (&gt; 60 min)</option>
                </select>
              </div>

              <button
                onClick={generateMealPlan}
                disabled={isGenerating}
                className={`w-full text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
                  isGenerating ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} className="mr-2" />
                    Générer le plan
                  </>
                )}
              </button>

              {/* Informations nutritionnelles */}
              <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Estimation calorique</h4>
                <div className="text-sm text-gray-400">
                  <p>Déjeuner: ~{totalCaloriesPerDay.dejeuner} kcal</p>
                  <p>Dîner: ~{totalCaloriesPerDay.diner} kcal</p>
                  <p className="mt-2 text-white">Total: ~{totalCaloriesPerDay.dejeuner + totalCaloriesPerDay.diner} kcal/jour</p>
                </div>
              </div>
            </div>
          </div>

          {/* Planning de la semaine */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  <Calendar size={20} className="inline mr-2" />
                  Votre semaine
                </h3>
                <button 
                  onClick={() => setShoppingList([])}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Liste de courses"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(weekPlan).map(([jour, repas]) => (
                  <div key={jour} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium capitalize">{jour}</h4>
                      <button
                        onClick={() => clearDay(jour)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Effacer ce jour"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Déjeuner</label>
                        <div className="flex items-center mt-1">
                          <input
                            type="text"
                            placeholder="Cliquez sur 'Générer le plan'"
                            className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm"
                            value={repas.dejeuner}
                            onChange={(e) => setWeekPlan({
                              ...weekPlan,
                              [jour]: { ...repas, dejeuner: e.target.value }
                            })}
                          />
                          <button
                            onClick={() => toggleFavorite(jour, 'dejeuner')}
                            className={`ml-2 ${
                              favorites.includes(`${jour}-dejeuner`) 
                                ? 'text-red-500' 
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                          >
                            <Heart size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Dîner</label>
                        <div className="flex items-center mt-1">
                          <input
                            type="text"
                            placeholder="Cliquez sur 'Générer le plan'"
                            className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm"
                            value={repas.diner}
                            onChange={(e) => setWeekPlan({
                              ...weekPlan,
                              [jour]: { ...repas, diner: e.target.value }
                            })}
                          />
                          <button
                            onClick={() => toggleFavorite(jour, 'diner')}
                            className={`ml-2 ${
                              favorites.includes(`${jour}-diner`) 
                                ? 'text-red-500' 
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                          >
                            <Heart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button 
                  onClick={savePlan}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Sauvegarder
                </button>
                <button 
                  onClick={exportPlan}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Exporter
                </button>
              </div>
            </div>

            {/* Liste de courses */}
            {shoppingList.length > 0 && (
              <div className="mt-6 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  <ShoppingCart size={20} className="inline mr-2" />
                  Liste de courses
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {shoppingList.map((item, index) => (
                    <label key={index} className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MealPlanner;