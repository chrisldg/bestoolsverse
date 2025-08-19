// src/tools/FinanceTracker.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, DollarSign, TrendingUp, TrendingDown, PieChart, Calendar, Plus, Trash2, Edit3, Download } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { trackEvent } from '../utils/analytics';

const FinanceTracker = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [categories] = useState([
    { id: 'alimentation', name: 'Alimentation', icon: '🍕', color: '#10B981' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: '#3B82F6' },
    { id: 'logement', name: 'Logement', icon: '🏠', color: '#8B5CF6' },
    { id: 'loisirs', name: 'Loisirs', icon: '🎮', color: '#F59E0B' },
    { id: 'sante', name: 'Santé', icon: '🏥', color: '#EF4444' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#EC4899' },
    { id: 'autres', name: 'Autres', icon: '📦', color: '#6B7280' }
  ]);
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: 'alimentation',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [budget, setBudget] = useState({
    monthly: 2000,
    savings: 20
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Charger les données de démonstration
  useEffect(() => {
    const demoTransactions = generateDemoTransactions();
    setTransactions(demoTransactions);
  }, []);

  const generateDemoTransactions = () => {
    const demo = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      demo.push({
        id: Date.now() + i,
        type: Math.random() > 0.3 ? 'expense' : 'income',
        amount: Math.floor(Math.random() * 200) + 10,
        category: categories[Math.floor(Math.random() * categories.length)].id,
        description: `Transaction ${i + 1}`,
        date: date.toISOString().split('T')[0]
      });
    }
    
    return demo;
  };

  const addTransaction = () => {
    if (!newTransaction.amount || newTransaction.amount <= 0) return;
    
    const transaction = {
      ...newTransaction,
      id: Date.now(),
      amount: parseFloat(newTransaction.amount)
    };
    
    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      type: 'expense',
      amount: '',
      category: 'alimentation',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    trackEvent('finance_tracker', 'add_transaction', transaction.type);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    trackEvent('finance_tracker', 'delete_transaction');
  };

  const getMonthlyData = () => {
    const filtered = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
    
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return { income, expenses, balance: income - expenses, transactions: filtered };
  };

  const getCategoryBreakdown = () => {
    const { transactions } = getMonthlyData();
    const breakdown = {};
    
    categories.forEach(cat => {
      breakdown[cat.id] = {
        name: cat.name,
        amount: 0,
        color: cat.color
      };
    });
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (breakdown[t.category]) {
          breakdown[t.category].amount += t.amount;
        }
      });
      
    return Object.values(breakdown).filter(cat => cat.amount > 0);
  };

  const getTrendData = () => {
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      last6Months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenus: income,
        dépenses: expenses,
        épargne: income - expenses
      });
    }
    
    return last6Months;
  };

  const exportData = () => {
    const data = {
      transactions,
      budget,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finances-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    trackEvent('finance_tracker', 'export_data');
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryBreakdown();
  const trendData = getTrendData();

  return (
    <Layout 
      title="Gestionnaire de Finances Personnelles" 
      description="Suivez vos dépenses et revenus avec notre gestionnaire de finances. Budgets, graphiques et analyses pour mieux gérer votre argent."
      keywords="gestion finances personnelles, budget tracker, suivi dépenses, épargne"
    >
      <Helmet>
        <title>Gestionnaire de Finances | BestoolsVerse</title>
        <meta name="description" content="Suivez vos dépenses et revenus avec notre gestionnaire de finances. Budgets, graphiques et analyses pour mieux gérer votre argent." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Gestionnaire de Finances</h1>
            <p className="text-gray-400 mt-2">Maîtrisez votre budget et atteignez vos objectifs financiers</p>
          </div>
          <DollarSign className="text-green-500" size={48} />
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveView('transactions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'transactions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveView('budget')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'budget'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Budget
          </button>
        </div>

        {activeView === 'dashboard' && (
          <div className="space-y-8">
            {/* Résumé mensuel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400">Revenus</h3>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-green-400">{monthlyData.income.toFixed(2)}€</p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400">Dépenses</h3>
                  <TrendingDown className="text-red-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-red-400">{monthlyData.expenses.toFixed(2)}€</p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400">Balance</h3>
                  <DollarSign className="text-blue-500" size={20} />
                </div>
                <p className={`text-3xl font-bold ${monthlyData.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {monthlyData.balance.toFixed(2)}€
                </p>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400">Épargne</h3>
                  <PieChart className="text-purple-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  {monthlyData.balance > 0 ? ((monthlyData.balance / monthlyData.income) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Répartition par catégorie */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Dépenses par catégorie</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Évolution sur 6 mois */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Évolution sur 6 mois</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        formatter={(value) => `${value.toFixed(2)}€`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="dépenses" stroke="#EF4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="épargne" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Dernières transactions */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Dernières transactions</h3>
              <div className="space-y-3">
                {monthlyData.transactions.slice(0, 5).map((transaction) => {
                  const category = categories.find(c => c.id === transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{category?.icon}</span>
                        <div>
                          <p className="font-medium text-white">{transaction.description}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire d'ajout */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Nouvelle transaction</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Type</label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                    >
                      <option value="expense">Dépense</option>
                      <option value="income">Revenu</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Montant (€)</label>
                    <input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      placeholder="0.00"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  
                  {newTransaction.type === 'expense' && (
                    <div>
                      <label className="block text-gray-300 mb-2">Catégorie</label>
                      <select
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      placeholder="Ex: Courses alimentaires"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  
                  <button
                    onClick={addTransaction}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Plus size={20} className="mr-2" />
                    Ajouter la transaction
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des transactions */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Toutes les transactions</h3>
                  <button
                    onClick={exportData}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Exporter
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.category);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                        <div className="flex items-center">
                          <span className="text-2xl mr-4">{category?.icon || '💰'}</span>
                          <div>
                            <p className="font-medium text-white">{transaction.description}</p>
                            <p className="text-sm text-gray-400">
                              {category?.name || 'Revenu'} • {new Date(transaction.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                          </p>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration du budget */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Configuration du budget</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Budget mensuel (€)</label>
                  <input
                    type="number"
                    value={budget.monthly}
                    onChange={(e) => setBudget({...budget, monthly: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Définissez votre budget mensuel total
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Objectif d'épargne (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={budget.savings}
                    onChange={(e) => setBudget({...budget, savings: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="text-white font-medium">{budget.savings}%</span>
                    <span>50%</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Montant cible: {(budget.monthly * budget.savings / 100).toFixed(2)}€
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-medium text-white mb-3">Répartition recommandée</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Logement (30%)</span>
                      <span className="text-white">{(budget.monthly * 0.3).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Alimentation (20%)</span>
                      <span className="text-white">{(budget.monthly * 0.2).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Transport (15%)</span>
                      <span className="text-white">{(budget.monthly * 0.15).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Loisirs (10%)</span>
                      <span className="text-white">{(budget.monthly * 0.1).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Autres (5%)</span>
                      <span className="text-white">{(budget.monthly * 0.05).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-700">
                      <span className="text-green-400">Épargne ({budget.savings}%)</span>
                      <span className="text-green-400">{(budget.monthly * budget.savings / 100).toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analyse du budget */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Analyse du budget</h3>
              
              <div className="space-y-4">
                {categories.map(category => {
                  const spent = monthlyData.transactions
                    .filter(t => t.type === 'expense' && t.category === category.id)
                    .reduce((sum, t) => sum + t.amount, 0);
                  
                  const percentage = (spent / monthlyData.expenses) * 100 || 0;
                  
                  return (
                    <div key={category.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{category.icon}</span>
                          <span className="text-white">{category.name}</span>
                        </div>
                        <span className="text-white font-medium">{spent.toFixed(2)}€</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all" 
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% du total</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">Conseil du mois</h4>
                <p className="text-sm text-gray-300">
                  {monthlyData.balance < 0 
                    ? "Attention, vos dépenses dépassent vos revenus. Essayez de réduire les dépenses non essentielles."
                    : monthlyData.balance < budget.monthly * budget.savings / 100
                    ? "Vous épargnez moins que votre objectif. Identifiez les catégories où vous pourriez économiser."
                    : "Bravo ! Vous respectez votre budget et votre objectif d'épargne."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FinanceTracker;