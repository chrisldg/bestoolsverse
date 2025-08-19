// src/tools/InvestmentSimulator.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, TrendingUp, DollarSign, Calendar, Percent, BarChart3, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trackEvent } from '../utils/analytics';

const InvestmentSimulator = () => {
  const [investmentDetails, setInvestmentDetails] = useState({
    initialAmount: 10000,
    monthlyContribution: 500,
    years: 20,
    expectedReturn: 7,
    inflationRate: 2.5,
    strategy: 'moderate'
  });

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const strategies = {
    conservative: {
      name: 'Conservateur',
      return: 4,
      risk: 'Faible',
      allocation: { actions: 20, obligations: 60, liquidites: 20 }
    },
    moderate: {
      name: 'Modéré',
      return: 7,
      risk: 'Moyen',
      allocation: { actions: 50, obligations: 40, liquidites: 10 }
    },
    aggressive: {
      name: 'Agressif',
      return: 10,
      risk: 'Élevé',
      allocation: { actions: 80, obligations: 15, liquidites: 5 }
    }
  };

  useEffect(() => {
    calculateInvestment();
  }, [investmentDetails]);

  const calculateInvestment = () => {
    const { initialAmount, monthlyContribution, years, expectedReturn, inflationRate } = investmentDetails;
    const monthlyReturn = expectedReturn / 100 / 12;
    const months = years * 12;
    
    let balance = initialAmount;
    let totalContributions = initialAmount;
    const monthlyData = [];
    const yearlyData = [];

    // Calcul réel mois par mois avec formule d'intérêts composés
    for (let month = 1; month <= months; month++) {
      balance = balance * (1 + monthlyReturn) + monthlyContribution;
      totalContributions += monthlyContribution;
      
      if (month % 12 === 0) {
        const year = month / 12;
        const realValue = balance / Math.pow(1 + inflationRate / 100, year);
        yearlyData.push({
          year,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions),
          gains: Math.round(balance - totalContributions),
          realValue: Math.round(realValue)
        });
      }
      
      if (month % 6 === 0) {
        monthlyData.push({
          month,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions)
        });
      }
    }

    const finalBalance = Math.round(balance);
    const totalGains = finalBalance - totalContributions;
    const totalReturn = ((finalBalance - totalContributions) / totalContributions * 100).toFixed(2);
    const realFinalValue = Math.round(finalBalance / Math.pow(1 + inflationRate / 100, years));

    // Calcul de la rentabilité annualisée (CAGR)
    const cagr = ((Math.pow(finalBalance / initialAmount, 1 / years) - 1) * 100).toFixed(2);

    setResults({
      finalBalance,
      totalContributions: Math.round(totalContributions),
      totalGains,
      totalReturn,
      realFinalValue,
      monthlyData,
      yearlyData,
      cagr,
      monthlyIncome: Math.round(finalBalance * 0.04 / 12) // 4% de retrait annuel
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const downloadReport = () => {
    if (!results) return;
    
    const report = `
RAPPORT D'INVESTISSEMENT
========================

PARAMÈTRES:
- Capital initial: ${formatCurrency(investmentDetails.initialAmount)}
- Versement mensuel: ${formatCurrency(investmentDetails.monthlyContribution)}
- Durée: ${investmentDetails.years} ans
- Rendement attendu: ${investmentDetails.expectedReturn}%
- Inflation: ${investmentDetails.inflationRate}%
- Stratégie: ${strategies[investmentDetails.strategy].name}

RÉSULTATS:
- Valeur finale: ${formatCurrency(results.finalBalance)}
- Total investi: ${formatCurrency(results.totalContributions)}
- Gains totaux: ${formatCurrency(results.totalGains)}
- Rendement total: ${results.totalReturn}%
- Rendement annualisé (CAGR): ${results.cagr}%
- Valeur réelle (après inflation): ${formatCurrency(results.realFinalValue)}
- Revenu mensuel potentiel (4% annuel): ${formatCurrency(results.monthlyIncome)}

ÉVOLUTION ANNUELLE:
${results.yearlyData.map(data => 
  `Année ${data.year}: ${formatCurrency(data.balance)} (Gains: ${formatCurrency(data.gains)})`
).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-investissement-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    trackEvent('investment_simulator', 'download_report');
  };

  const saveSimulation = () => {
    const simulation = {
      date: new Date().toISOString(),
      parameters: investmentDetails,
      results: results
    };
    
    const savedSimulations = JSON.parse(localStorage.getItem('investment_simulations') || '[]');
    savedSimulations.unshift(simulation);
    localStorage.setItem('investment_simulations', JSON.stringify(savedSimulations.slice(0, 10)));
    
    alert('Simulation sauvegardée !');
    trackEvent('investment_simulator', 'save_simulation');
  };

  const pieData = results ? [
    { name: 'Capital investi', value: results.totalContributions, color: '#3B82F6' },
    { name: 'Gains', value: results.totalGains, color: '#10B981' }
  ] : [];

  const allocationData = Object.entries(strategies[investmentDetails.strategy].allocation).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: key === 'actions' ? '#8B5CF6' : key === 'obligations' ? '#F59E0B' : '#6B7280'
  }));

  return (
    <Layout 
      title="Simulateur d'Investissements" 
      description="Simulez vos investissements et visualisez la croissance de votre patrimoine avec notre calculateur d'investissement avancé."
      keywords="simulateur investissement, calculateur rendement, planification financière, épargne"
    >
      <Helmet>
        <title>Simulateur d'Investissements | BestoolsVerse</title>
        <meta name="description" content="Simulez vos investissements et visualisez la croissance de votre patrimoine avec notre calculateur d'investissement avancé." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Simulateur d'Investissements</h1>
            <p className="text-gray-400 mt-2">Planifiez votre avenir financier avec précision</p>
          </div>
          <TrendingUp className="text-green-500" size={48} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paramètres */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Paramètres d'investissement</h3>
              
              <div className="space-y-6">
                {/* Montant initial */}
                <div>
                  <label className="block text-gray-300 mb-2">Montant initial</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={investmentDetails.initialAmount}
                      onChange={(e) => setInvestmentDetails(prev => ({ ...prev, initialAmount: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Contribution mensuelle */}
                <div>
                  <label className="block text-gray-300 mb-2">Contribution mensuelle</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={investmentDetails.monthlyContribution}
                      onChange={(e) => setInvestmentDetails(prev => ({ ...prev, monthlyContribution: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Durée */}
                <div>
                  <label className="block text-gray-300 mb-2">Durée (années)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={investmentDetails.years}
                      onChange={(e) => setInvestmentDetails(prev => ({ ...prev, years: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-12 text-right">{investmentDetails.years}</span>
                  </div>
                </div>

                {/* Rendement attendu */}
                <div>
                  <label className="block text-gray-300 mb-2">Rendement annuel attendu (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={investmentDetails.expectedReturn}
                      onChange={(e) => setInvestmentDetails(prev => ({ ...prev, expectedReturn: parseFloat(e.target.value) || 0 }))}
                      step="0.1"
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Taux d'inflation */}
                <div>
                  <label className="block text-gray-300 mb-2">Taux d'inflation (%)</label>
                  <input
                    type="number"
                    value={investmentDetails.inflationRate}
                    onChange={(e) => setInvestmentDetails(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) || 0 }))}
                    step="0.1"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Stratégie */}
                <div>
                  <label className="block text-gray-300 mb-3">Stratégie d'investissement</label>
                  <div className="space-y-3">
                    {Object.entries(strategies).map(([key, strategy]) => (
                      <button
                        key={key}
                        onClick={() => setInvestmentDetails(prev => ({ 
                          ...prev, 
                          strategy: key,
                          expectedReturn: strategy.return 
                        }))}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          investmentDetails.strategy === key
                            ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                            : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-white">{strategy.name}</div>
                            <div className="text-sm text-gray-400">Risque {strategy.risk}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-green-400">{strategy.return}%</div>
                            <div className="text-xs text-gray-500">rendement</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-2">
            {results && (
              <>
                {/* Résumé */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
                    <p className="text-gray-400 text-sm mb-1">Valeur finale</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(results.finalBalance)}</p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
                    <p className="text-gray-400 text-sm mb-1">Total investi</p>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(results.totalContributions)}</p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
                    <p className="text-gray-400 text-sm mb-1">Gains totaux</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(results.totalGains)}</p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
                    <p className="text-gray-400 text-sm mb-1">Rendement</p>
                    <p className="text-2xl font-bold text-purple-400">{results.totalReturn}%</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
                  <div className="flex border-b border-gray-700">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 px-4 py-3 font-medium transition-colors ${
                        activeTab === 'overview'
                          ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Vue d'ensemble
                    </button>
                    <button
                      onClick={() => setActiveTab('evolution')}
                      className={`flex-1 px-4 py-3 font-medium transition-colors ${
                        activeTab === 'evolution'
                          ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Évolution
                    </button>
                    <button
                      onClick={() => setActiveTab('allocation')}
                      className={`flex-1 px-4 py-3 font-medium transition-colors ${
                        activeTab === 'allocation'
                          ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Allocation
                    </button>
                  </div>

                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Graphique en camembert */}
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Inflation warning */}
                        <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-4 border border-yellow-700">
                          <div className="flex items-start">
                            <AlertCircle className="text-yellow-400 mr-3 flex-shrink-0" size={20} />
                            <div>
                              <p className="text-yellow-400 font-medium mb-1">Impact de l'inflation</p>
                              <p className="text-gray-300 text-sm">
                                Avec une inflation de {investmentDetails.inflationRate}%, votre capital de {formatCurrency(results.finalBalance)} 
                                vaudra environ {formatCurrency(results.realFinalValue)} en pouvoir d'achat actuel.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Résumé détaillé */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-900 rounded-lg p-4">
                            <h4 className="font-semibold text-white mb-3">Contributions</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Capital initial</span>
                                <span className="text-white">{formatCurrency(investmentDetails.initialAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Versements mensuels</span>
                                <span className="text-white">{formatCurrency(investmentDetails.monthlyContribution)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Nombre de versements</span>
                                <span className="text-white">{investmentDetails.years * 12}</span>
                              </div>
                              <div className="border-t border-gray-800 pt-2 flex justify-between font-semibold">
                                <span className="text-gray-300">Total investi</span>
                                <span className="text-blue-400">{formatCurrency(results.totalContributions)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded-lg p-4">
                            <h4 className="font-semibold text-white mb-3">Performance</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Gains totaux</span>
                                <span className="text-green-400">{formatCurrency(results.totalGains)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Rendement total</span>
                                <span className="text-white">{results.totalReturn}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Rendement annualisé (CAGR)</span>
                                <span className="text-white">{results.cagr}%</span>
                              </div>
                              <div className="border-t border-gray-800 pt-2 flex justify-between font-semibold">
                                <span className="text-gray-300">Valeur finale</span>
                                <span className="text-green-400">{formatCurrency(results.finalBalance)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Revenu potentiel */}
                        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
                          <h4 className="font-semibold text-blue-400 mb-2">Revenu potentiel à la retraite</h4>
                          <p className="text-gray-300 text-sm">
                            Avec un capital de {formatCurrency(results.finalBalance)}, vous pourriez obtenir un revenu mensuel 
                            d'environ <span className="font-bold text-white">{formatCurrency(results.monthlyIncome)}</span> en 
                            retirant 4% par an (règle des 4%).
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'evolution' && (
                      <div className="space-y-6">
                        {/* Graphique d'évolution */}
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.yearlyData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis 
                                dataKey="year" 
                                stroke="#9CA3AF"
                                label={{ value: 'Années', position: 'insideBottom', offset: -5 }}
                              />
                              <YAxis 
                                stroke="#9CA3AF"
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                              />
                              <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="balance" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                name="Valeur totale"
                                dot={false}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="contributions" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                name="Capital investi"
                                dot={false}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="realValue" 
                                stroke="#F59E0B" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Valeur réelle (inflation)"
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Tableau d'évolution */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left text-gray-400 py-3">Année</th>
                                <th className="text-right text-gray-400 py-3">Capital investi</th>
                                <th className="text-right text-gray-400 py-3">Gains</th>
                                <th className="text-right text-gray-400 py-3">Valeur totale</th>
                                <th className="text-right text-gray-400 py-3">Valeur réelle</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.yearlyData.filter((_, index) => index % 5 === 4 || index === results.yearlyData.length - 1).map((data) => (
                                <tr key={data.year} className="border-b border-gray-800">
                                  <td className="py-3 text-white">Année {data.year}</td>
                                  <td className="text-right text-blue-400">{formatCurrency(data.contributions)}</td>
                                  <td className="text-right text-green-400">{formatCurrency(data.gains)}</td>
                                  <td className="text-right text-white font-medium">{formatCurrency(data.balance)}</td>
                                  <td className="text-right text-yellow-400">{formatCurrency(data.realValue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === 'allocation' && (
                      <div className="space-y-6">
                        {/* Graphique d'allocation */}
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={allocationData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {allocationData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Description de la stratégie */}
                        <div className="bg-gray-900 rounded-lg p-6">
                          <h4 className="font-semibold text-white mb-3">
                            Stratégie {strategies[investmentDetails.strategy].name}
                          </h4>
                          <p className="text-gray-300 mb-4">
                            Cette stratégie est adaptée aux investisseurs avec un profil de risque {strategies[investmentDetails.strategy].risk.toLowerCase()}.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                                <span className="text-gray-300">Actions</span>
                              </div>
                              <span className="text-white font-medium">{strategies[investmentDetails.strategy].allocation.actions}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                                <span className="text-gray-300">Obligations</span>
                              </div>
                              <span className="text-white font-medium">{strategies[investmentDetails.strategy].allocation.obligations}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-gray-500 rounded mr-3"></div>
                                <span className="text-gray-300">Liquidités</span>
                              </div>
                              <span className="text-white font-medium">{strategies[investmentDetails.strategy].allocation.liquidites}%</span>
                            </div>
                          </div>

                          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-400">
                              <strong className="text-white">Rendement attendu :</strong> {strategies[investmentDetails.strategy].return}% par an
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                              <strong className="text-white">Niveau de risque :</strong> {strategies[investmentDetails.strategy].risk}
                            </p>
                          </div>
                        </div>

                        {/* Conseils d'investissement */}
                        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
                          <h5 className="font-semibold text-blue-400 mb-2">Conseils d'investissement</h5>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2">•</span>
                              Diversifiez vos investissements pour réduire le risque
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2">•</span>
                              Rééquilibrez votre portefeuille régulièrement
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2">•</span>
                              Gardez un horizon de placement à long terme
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2">•</span>
                              Consultez un conseiller financier pour une stratégie personnalisée
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={downloadReport}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Télécharger le rapport
                  </button>
                  <button
                    onClick={saveSimulation}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Imprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestmentSimulator;