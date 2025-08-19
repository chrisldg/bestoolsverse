// src/test-firebase.js
import { auth, db } from './config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const testFirebase = async () => {
  try {
    // Test de création d'utilisateur
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'test@example.com',
      'password123'
    );
    
    console.log('✅ Utilisateur créé:', userCredential.user.uid);
    
    // Test d'écriture dans Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: 'test@example.com',
      createdAt: new Date(),
      plan: 'free'
    });
    
    console.log('✅ Document Firestore créé');
    console.log('🎉 Firebase fonctionne correctement !');
    
  } catch (error) {
    console.error('❌ Erreur Firebase:', error.message);
  }
};

// Pour tester, décommentez la ligne suivante
// testFirebase();