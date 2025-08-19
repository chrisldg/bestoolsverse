// src/tools/PasswordGenerator.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Shield, Copy, RefreshCw, Lock, Check, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [strength, setStrength] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [passwordHistory, setPasswordHistory] = useState([]);

  // Caractères disponibles
  const charsets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O'
  };

  const generatePassword = () => {
    let charset = '';
    
    if (includeLowercase) charset += charsets.lowercase;
    if (includeUppercase) charset += charsets.uppercase;
    if (includeNumbers) charset += charsets.numbers;
    if (includeSymbols) charset += charsets.symbols;

    if (!charset) {
      alert('Veuillez sélectionner au moins un type de caractère');
      return;
    }

    // Exclure les caractères similaires si demandé
    if (excludeSimilar) {
      charset = charset.split('').filter(char => !charsets.similar.includes(char)).join('');
    }

    // Génération sécurisée du mot de passe
    let newPassword = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    // S'assurer qu'au moins un caractère de chaque type sélectionné est présent
    if (includeLowercase && !(/[a-z]/.test(newPassword))) {
      const randomIndex = Math.floor(Math.random() * length);
      const randomChar = charsets.lowercase[Math.floor(Math.random() * charsets.lowercase.length)];
      newPassword = newPassword.substring(0, randomIndex) + randomChar + newPassword.substring(randomIndex + 1);
    }
    
    if (includeUppercase && !(/[A-Z]/.test(newPassword))) {
      const randomIndex = Math.floor(Math.random() * length);
      const randomChar = charsets.uppercase[Math.floor(Math.random() * charsets.uppercase.length)];
      newPassword = newPassword.substring(0, randomIndex) + randomChar + newPassword.substring(randomIndex + 1);
    }
    
    if (includeNumbers && !(/[0-9]/.test(newPassword))) {
      const randomIndex = Math.floor(Math.random() * length);
      const randomChar = charsets.numbers[Math.floor(Math.random() * charsets.numbers.length)];
      newPassword = newPassword.substring(0, randomIndex) + randomChar + newPassword.substring(randomIndex + 1);
    }
    
    if (includeSymbols && !(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword))) {
      const randomIndex = Math.floor(Math.random() * length);
      const randomChar = charsets.symbols[Math.floor(Math.random() * charsets.symbols.length)];
      newPassword = newPassword.substring(0, randomIndex) + randomChar + newPassword.substring(randomIndex + 1);
    }

    setPassword(newPassword);
    
    // Ajouter à l'historique (garder seulement les 10 derniers)
    setPasswordHistory(prev => [newPassword, ...prev.slice(0, 9)]);
    
    trackEvent('password_generator', 'generate_password', undefined, length);
  };

  const calculateStrength = (pwd) => {
    let score = 0;
    
    // Longueur
    if (pwd.length >= 8) score += 10;
    if (pwd.length >= 12) score += 10;
    if (pwd.length >= 16) score += 10;
    if (pwd.length >= 20) score += 10;
    
    // Complexité
    if (/[a-z]/.test(pwd)) score += 10;
    if (/[A-Z]/.test(pwd)) score += 10;
    if (/[0-9]/.test(pwd)) score += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
    
    // Patterns
    if (!/(.)\1{2,}/.test(pwd)) score += 10; // Pas de répétitions
    if (!/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(pwd)) {
      score += 10; // Pas de séquences
    }
    
    setStrength(Math.min(100, score));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent('password_generator', 'copy_password');
    } catch (err) {
      alert('Erreur lors de la copie');
    }
  };

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength < 40) return 'Faible';
    if (strength < 70) return 'Moyen';
    if (strength < 90) return 'Fort';
    return 'Très fort';
  };

  useEffect(() => {
    generatePassword();
  }, []);

  useEffect(() => {
    calculateStrength(password);
  }, [password]);

  // Estimer le temps de craquage
  const estimateCrackTime = () => {
    if (!password) return 'N/A';
    
    let possibleChars = 0;
    if (includeLowercase) possibleChars += 26;
    if (includeUppercase) possibleChars += 26;
    if (includeNumbers) possibleChars += 10;
    if (includeSymbols) possibleChars += charsets.symbols.length;
    
    const combinations = Math.pow(possibleChars, password.length);
    const guessesPerSecond = 1e9; // 1 milliard de tentatives par seconde
    const seconds = combinations / guessesPerSecond;
    
    if (seconds < 60) return 'Moins d\'une minute';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} heures`;
    if (seconds < 31536000) return `${Math.floor(seconds / 86400)} jours`;
    const years = seconds / 31536000;
    if (years < 1000) return `${Math.floor(years)} ans`;
    if (years < 1e6) return `${Math.floor(years / 1000)} milliers d'années`;
    if (years < 1e9) return `${Math.floor(years / 1e6)} millions d'années`;
    return 'Plus d\'un milliard d\'années';
  };

  return (
    <Layout 
      title="Générateur de Mots de Passe Sécurisés" 
      description="Créez des mots de passe forts et sécurisés. Générateur avec options personnalisables et indicateur de force."
      keywords="générateur mot de passe, password generator, sécurité, mot de passe fort"
    >
      <Helmet>
        <title>Générateur de Mots de Passe Sécurisés | BestoolsVerse</title>
        <meta name="description" content="Créez des mots de passe forts et sécurisés. Générateur avec options personnalisables et indicateur de force." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Générateur de Mots de Passe</h1>
            <p className="text-gray-400 mt-2">Créez des mots de passe sécurisés et uniques</p>
          </div>
          <Shield className="text-green-500" size={48} />
        </div>

        {/* Générateur principal */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 mb-8">
          {/* Affichage du mot de passe */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  readOnly
                  className="flex-1 bg-transparent text-2xl font-mono text-white outline-none"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={copyToClipboard}
                  className={`p-3 rounded-lg transition-all ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
                <button
                  onClick={generatePassword}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>

            {/* Indicateur de force */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Force du mot de passe</span>
                <span className={`text-sm font-medium ${
                  strength < 40 ? 'text-red-400' : strength < 70 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {getStrengthText()} ({strength}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Temps de craquage estimé : {estimateCrackTime()}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-3">Longueur : {length} caractères</label>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Majuscules (A-Z)</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Minuscules (a-z)</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Chiffres (0-9)</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Symboles (!@#$...)</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Exclure les caractères similaires (i, l, 1, L, o, 0, O)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Historique des mots de passe */}
        {passwordHistory.length > 0 && (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Historique récent</h3>
            <div className="space-y-2">
              {passwordHistory.map((pwd, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span className="font-mono text-sm text-gray-300 truncate flex-1">
                    {showPassword ? pwd : '••••••••••••••••'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pwd);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ml-4 p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conseils de sécurité */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lock className="mr-2" size={20} />
            Conseils de sécurité
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Bonnes pratiques</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-0.5" size={16} />
                  Utilisez un mot de passe unique pour chaque compte
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-0.5" size={16} />
                  Minimum 12 caractères, idéalement 16+
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-0.5" size={16} />
                  Utilisez un gestionnaire de mots de passe
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-0.5" size={16} />
                  Activez l'authentification à deux facteurs
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">À éviter</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <X className="text-red-500 mr-2 mt-0.5" size={16} />
                  Informations personnelles (dates, noms)
                </li>
                <li className="flex items-start">
                  <X className="text-red-500 mr-2 mt-0.5" size={16} />
                  Mots du dictionnaire
                </li>
                <li className="flex items-start">
                  <X className="text-red-500 mr-2 mt-0.5" size={16} />
                  Séquences simples (123456, azerty)
                </li>
                <li className="flex items-start">
                  <X className="text-red-500 mr-2 mt-0.5" size={16} />
                  Réutiliser le même mot de passe
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900 bg-opacity-50 rounded-lg border border-yellow-700">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-400 mr-3 flex-shrink-0" size={20} />
              <p className="text-sm text-yellow-200">
                Ne partagez jamais vos mots de passe. Méfiez-vous des emails de phishing 
                qui vous demandent vos identifiants. Utilisez toujours ce générateur sur des sites sécurisés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PasswordGenerator;