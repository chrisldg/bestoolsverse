// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [usageStats, setUsageStats] = useState({});

  // Plans d'abonnement
  const plans = {
    free: {
      name: 'Gratuit',
      price: 0,
      limits: {
        qrCodes: 5,
        fileConversions: 10,
        aiEdits: 3,
        storage: 100, // MB
        tools: ['qr-code', 'file-converter', 'color-palette', 'meme-generator']
      }
    },
    pro: {
      name: 'Pro',
      price: 9.99,
      limits: {
        qrCodes: 100,
        fileConversions: 500,
        aiEdits: 50,
        storage: 5000, // MB
        tools: 'all'
      }
    },
    business: {
      name: 'Business',
      price: 29.99,
      limits: {
        qrCodes: 'unlimited',
        fileConversions: 'unlimited',
        aiEdits: 'unlimited',
        storage: 50000, // MB
        tools: 'all',
        priority: true,
        api: true
      }
    }
  };

  // Inscription
  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour le profil
      await updateProfile(user, { displayName });
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        plan: 'free',
        createdAt: new Date().toISOString(),
        usageStats: {
          qrCodes: 0,
          fileConversions: 0,
          aiEdits: 0,
          storage: 0
        }
      });
      
      toast.success('Compte créé avec succès !');
      return user;
    } catch (error) {
      console.error('Erreur inscription:', error);
      toast.error('Erreur lors de la création du compte');
      throw error;
    }
  };

  // Connexion
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Connexion réussie !');
      return user;
    } catch (error) {
      console.error('Erreur connexion:', error);
      toast.error('Email ou mot de passe incorrect');
      throw error;
    }
  };

  // Connexion avec Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Vérifier si l'utilisateur existe déjà
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Créer le document utilisateur
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          plan: 'free',
          createdAt: new Date().toISOString(),
          usageStats: {
            qrCodes: 0,
            fileConversions: 0,
            aiEdits: 0,
            storage: 0
          }
        });
      }
      
      toast.success('Connexion avec Google réussie !');
      return user;
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      toast.error('Erreur lors de la connexion avec Google');
      throw error;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Réinitialisation du mot de passe
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
      throw error;
    }
  };

  // Vérifier les limites d'utilisation
  const checkUsageLimit = async (toolType) => {
    if (!currentUser) return false;
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();
    const plan = plans[userData.plan || 'free'];
    
    // Vérifier si l'outil est accessible
    if (plan.limits.tools !== 'all' && !plan.limits.tools.includes(toolType)) {
      toast.error('Cet outil n\'est pas disponible dans votre plan');
      return false;
    }
    
    // Vérifier les limites spécifiques
    const usage = userData.usageStats || {};
    
    switch (toolType) {
      case 'qr-code':
        if (plan.limits.qrCodes !== 'unlimited' && usage.qrCodes >= plan.limits.qrCodes) {
          toast.error('Limite de QR codes atteinte. Passez au plan Pro !');
          return false;
        }
        break;
      case 'file-converter':
        if (plan.limits.fileConversions !== 'unlimited' && usage.fileConversions >= plan.limits.fileConversions) {
          toast.error('Limite de conversions atteinte. Passez au plan Pro !');
          return false;
        }
        break;
      case 'ai-image-editor':
        if (plan.limits.aiEdits !== 'unlimited' && usage.aiEdits >= plan.limits.aiEdits) {
          toast.error('Limite d\'éditions IA atteinte. Passez au plan Pro !');
          return false;
        }
        break;
    }
    
    return true;
  };

  // Mettre à jour les statistiques d'utilisation
  const updateUsageStats = async (toolType) => {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const usage = userData.usageStats || {};
    
    const updateData = {};
    
    switch (toolType) {
      case 'qr-code':
        updateData['usageStats.qrCodes'] = (usage.qrCodes || 0) + 1;
        break;
      case 'file-converter':
        updateData['usageStats.fileConversions'] = (usage.fileConversions || 0) + 1;
        break;
      case 'ai-image-editor':
        updateData['usageStats.aiEdits'] = (usage.aiEdits || 0) + 1;
        break;
    }
    
    await updateDoc(userRef, updateData);
    
    // Mettre à jour l'état local
    setUsageStats(prev => ({
      ...prev,
      ...updateData
    }));
  };

  // Changer de plan
  const upgradePlan = async (newPlan) => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        plan: newPlan,
        upgradedAt: new Date().toISOString()
      });
      
      setUserPlan(newPlan);
      toast.success(`Plan mis à jour vers ${plans[newPlan].name} !`);
    } catch (error) {
      console.error('Erreur mise à jour plan:', error);
      toast.error('Erreur lors de la mise à jour du plan');
    }
  };

  // Observer l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Récupérer les données utilisateur
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserPlan(userData.plan || 'free');
          setUsageStats(userData.usageStats || {});
        }
      } else {
        setCurrentUser(null);
        setUserPlan('free');
        setUsageStats({});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userPlan,
    usageStats,
    plans,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    checkUsageLimit,
    updateUsageStats,
    upgradePlan
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};