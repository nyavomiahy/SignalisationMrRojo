// src/services/authFirebaseService.ts
import { auth, db } from '@/firebase/config';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Interface unifiée
export interface AppUser {
  id: string;
  email: string;
  username: string;
  id_type_account: string;
  name_type: 'Manager' | 'Utilisateur';
  displayName?: string;
  photoURL?: string;
  createdAt?: any;
}

// Fonction pour créer/obtenir un utilisateur dans Firestore
const ensureUserInFirestore = async (firebaseUser: any): Promise<AppUser> => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    // Utilisateur existe déjà
    const data = userDoc.data();
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      username: data.username || firebaseUser.email?.split('@')[0] || '',
      id_type_account: data.id_type_account || '2',
      name_type: data.name_type || 'Utilisateur',
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: data.createdAt
    };
  } else {
    // Créer un nouvel utilisateur dans Firestore
    const newUser: Omit<AppUser, 'id'> = {
      email: firebaseUser.email!,
      username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
      id_type_account: '2', // Par défaut "Utilisateur"
      name_type: 'Utilisateur',
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: serverTimestamp()
    };
    
    await setDoc(userDocRef, newUser);
    
    return {
      id: firebaseUser.uid,
      ...newUser
    };
  }
};

// 1. Connexion directe Firebase
export const loginWithFirebase = async (
  email: string, 
  password: string
): Promise<{
  success: boolean;
  user?: AppUser;
  error?: string;
  message?: string;
}> => {
  try {
    console.log('🔑 Connexion Firebase:', email);
    
    // Authentification Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Récupérer/créer l'utilisateur dans Firestore
    const user = await ensureUserInFirestore(userCredential.user);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    console.log('✅ Connexion réussie:', user.username);
    
    return {
      success: true,
      user,
      message: 'Connexion réussie'
    };
    
  } catch (error: any) {
    console.error('❌ Erreur connexion Firebase:', error);
    
    let errorMessage = "Erreur de connexion";
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "Email invalide";
        break;
      case 'auth/user-not-found':
        errorMessage = "Aucun compte trouvé avec cet email";
        break;
      case 'auth/wrong-password':
        errorMessage = "Mot de passe incorrect";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Trop de tentatives. Réessayez plus tard";
        break;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 2. Inscription
export const registerWithFirebase = async (
  email: string,
  password: string,
  username: string,
  role: 'Manager' | 'Utilisateur' = 'Utilisateur'
): Promise<{
  success: boolean;
  user?: AppUser;
  error?: string;
  message?: string;
}> => {
  try {
    console.log('📝 Inscription Firebase:', { email, username });
    
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le displayName
    if (username) {
      await updateProfile(userCredential.user, { displayName: username });
    }
    
    // Créer le document dans Firestore
    const userData: Omit<AppUser, 'id'> = {
      email,
      username,
      id_type_account: role === 'Manager' ? '1' : '2',
      name_type: role,
      displayName: username,
      createdAt: serverTimestamp()
    };
    
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, userData);
    
    const user: AppUser = {
      id: userCredential.user.uid,
      ...userData
    };
    
    // Sauvegarder dans localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return {
      success: true,
      user,
      message: 'Compte créé avec succès'
    };
    
  } catch (error: any) {
    console.error('❌ Erreur inscription Firebase:', error);
    
    let errorMessage = "Erreur lors de l'inscription";
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Cet email est déjà utilisé";
        break;
      case 'auth/weak-password':
        errorMessage = "Le mot de passe est trop faible (min. 6 caractères)";
        break;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 3. Déconnexion
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('currentUser');
    return { success: true, message: 'Déconnexion réussie' };
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    return { success: false, error: 'Erreur lors de la déconnexion' };
  }
};

// 4. Utilisateur actuel
export const getCurrentUser = (): AppUser | null => {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// 5. Vérifier si connecté
export const isLoggedIn = (): boolean => {
  return !!getCurrentUser();
};

// 6. Écouter les changements d'authentification
export const onAuthStateChange = (callback: (user: AppUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await ensureUserInFirestore(firebaseUser);
      localStorage.setItem('currentUser', JSON.stringify(user));
      callback(user);
    } else {
      localStorage.removeItem('currentUser');
      callback(null);
    }
  });
};

// 7. Méthodes de test rapide
export const quickLogin = (userType: 'manager' | 'utilisateur') => {
  const users = {
    manager: {
      id: "manager_123",
      email: "manager@example.com",
      username: "Manager",
      id_type_account: "1",
      name_type: "Manager" as const
    },
    utilisateur: {
      id: "user_456",
      email: "user@example.com",
      username: "Utilisateur",
      id_type_account: "2",
      name_type: "Utilisateur" as const
    }
  };
  
  const user = users[userType];
  localStorage.setItem('currentUser', JSON.stringify(user));
  console.log(`🚀 Connexion rapide: ${user.username}`);
  return user;
};