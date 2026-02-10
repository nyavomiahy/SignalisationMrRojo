// src/services/authService.ts
import { auth } from '@/firebase/config';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

// Interface pour notre utilisateur
export interface AppUser {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// Convertir Firebase User -> Notre User
const mapFirebaseUser = (firebaseUser: FirebaseUser | null): AppUser | null => {
  if (!firebaseUser) return null;
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  };
};

// 1. Connexion
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = mapFirebaseUser(userCredential.user);
    
    return { 
      success: true, 
      user,
      message: 'Connexion réussie'
    };
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    
    // Messages d'erreur plus conviviaux
    let errorMessage = "Erreur de connexion";
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "Email invalide";
        break;
      case 'auth/user-disabled':
        errorMessage = "Ce compte a été désactivé";
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

// 2. Inscription (au cas où vous voudriez plus tard)
export const registerUser = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le nom d'affichage
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    const user = mapFirebaseUser(userCredential.user);
    
    return {
      success: true,
      user,
      message: 'Compte créé avec succès'
    };
  } catch (error: any) {
    console.error('Erreur d\'inscription:', error);
    
    let errorMessage = "Erreur lors de l'inscription";
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Cet email est déjà utilisé";
        break;
      case 'auth/invalid-email':
        errorMessage = "Email invalide";
        break;
      case 'auth/operation-not-allowed':
        errorMessage = "L'inscription est temporairement désactivée";
        break;
      case 'auth/weak-password':
        errorMessage = "Le mot de passe est trop faible";
        break;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 3. Déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, message: 'Déconnexion réussie' };
  } catch (error: any) {
    console.error('Erreur de déconnexion:', error);
    return { 
      success: false, 
      error: 'Erreur lors de la déconnexion' 
    };
  }
};

// 4. Réinitialisation de mot de passe
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      message: 'Email de réinitialisation envoyé' 
    };
  } catch (error: any) {
    console.error('Erreur réinitialisation:', error);
    return { 
      success: false, 
      error: 'Erreur lors de l\'envoi de l\'email' 
    };
  }
};

// 5. Écouter les changements d'authentification
export const onAuthChange = (callback: (user: AppUser | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(mapFirebaseUser(firebaseUser));
  });
};

// 6. Récupérer l'utilisateur actuel
export const getCurrentUser = (): AppUser | null => {
  return mapFirebaseUser(auth.currentUser);
};

// 7. Vérifier si l'utilisateur est connecté
export const isLoggedIn = (): boolean => {
  return !!auth.currentUser;
};