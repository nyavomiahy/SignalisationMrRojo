// src/services/userService.ts
import { login } from '../services/apiService'; // Assurez-vous que ce chemin est correct

export interface AppUser {
  uid: string;
  email: string;
  username: string;
  id_type_account: string;
  name_type?: 'Manager' | 'Utilisateur';
}

// Détermine si on utilise la vraie API ou le mock
const USE_REAL_API = true;

/**
 * Connexion de l'utilisateur via Firestore/Auth
 */
export const loginUserWithFirestore = async (email: string, password: string): Promise<AppUser> => {
  console.log('🔑 Début authentification...');
  
  try {
    if (USE_REAL_API) {
      // Utiliser la vraie API de connexion
      const loginSuccess = await login(email, password);
      
      if (!loginSuccess) {
        throw new Error('Échec de la connexion');
      }
      
      // Récupérer l'utilisateur depuis localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Session utilisateur non trouvée');
      }
      
      const firebaseUser = JSON.parse(userStr);
      
      // Construire l'objet AppUser
      const appUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.username,
        id_type_account: firebaseUser.id_type_account,
        name_type: firebaseUser.id_type_account === '1' ? 'Manager' : 'Utilisateur'
      };
      
      // Stocker dans currentUser pour compatibilité
      localStorage.setItem('currentUser', JSON.stringify(appUser));
      
      console.log('✅ Connexion réussie:', appUser.username);
      return appUser;
      
    } else {
      // Utiliser le mock
      return loginUserApiMock(email, password);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    throw error;
  }
};

/**
 * Fonction mock pour les tests (si nécessaire)
 */
const loginUserApiMock = async (email: string, password: string): Promise<AppUser> => {
  console.log('🔄 Utilisation du mock API');
  
  // Simulation de délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Vérification des identifiants mock
  if (email === 'manager@example.com' && password === 'password') {
    const managerUser: AppUser = {
      uid: 'mock-uid-1',
      email: 'manager@example.com',
      username: 'ManagerMock',
      id_type_account: '1',
      name_type: 'Manager'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(managerUser));
    return managerUser;
  }
  
  if (email === 'user@example.com' && password === 'password') {
    const regularUser: AppUser = {
      uid: 'mock-uid-2',
      email: 'user@example.com',
      username: 'UserMock',
      id_type_account: '2',
      name_type: 'Utilisateur'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(regularUser));
    return regularUser;
  }
  
  throw new Error('Email ou mot de passe incorrect');
};

/**
 * Déconnexion de l'utilisateur
 */
export const logoutUserFirestore = (): { success: boolean; message: string } => {
  try {
    // Nettoyer tous les éléments de session
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Déconnexion Firebase si disponible
    // if (typeof auth !== 'undefined') {
    //   // Vous devrez peut-être importer et utiliser signOut
    //   // import { signOut } from "firebase/auth";
    //   // await signOut(auth);
    // }
    
    console.log('✅ Déconnexion réussie');
    return { success: true, message: 'Déconnecté avec succès' };
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    return { success: false, message: 'Erreur lors de la déconnexion' };
  }
};

/**
 * Récupérer l'utilisateur courant depuis le stockage local
 */
export const getCurrentUserFromStorage = (): AppUser | null => {
  try {
    // D'abord essayer avec currentUser (votre format)
    const userStr = localStorage.getItem('currentUser');
    
    if (!userStr) {
      // Ensuite essayer avec user (format Firebase)
      const firebaseUserStr = localStorage.getItem('user');
      if (firebaseUserStr) {
        const firebaseUser = JSON.parse(firebaseUserStr);
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.username,
          id_type_account: firebaseUser.id_type_account,
          name_type: firebaseUser.id_type_account === '1' ? 'Manager' : 'Utilisateur'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(appUser));
        return appUser;
      }
      
      console.log('🔍 Aucun utilisateur en session');
      return null;
    }
    
    const user = JSON.parse(userStr) as AppUser;
    console.log('👤 Utilisateur en session:', user.username);
    return user;
  } catch (error) {
    console.error('❌ Erreur parsing user:', error);
    // Nettoyer les données corrompues
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isLoggedIn = (): boolean => {
  return !!getCurrentUserFromStorage() || !!localStorage.getItem('token');
};

/**
 * Vérifier si l'utilisateur est un manager
 */
export const isManager = (): boolean => {
  const user = getCurrentUserFromStorage();
  return user?.id_type_account === '1' || user?.name_type === 'Manager';
};

/**
 * Récupérer le token d'authentification
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Fonction pour simuler une connexion rapide (pour tests)
 */
export const quickLogin = (userType: 'manager' | 'user'): AppUser => {
  const users = {
    manager: {
      uid: "firebase-uid-1",
      email: "olona@example.com",
      username: "olona",
      id_type_account: "1",
      name_type: "Manager" as const
    },
    user: {
      uid: "firebase-uid-2",
      email: "mario@example.com",
      username: "mario",
      id_type_account: "2",
      name_type: "Utilisateur" as const
    }
  };
  
  const user = users[userType];
  
  // Simuler le stockage comme le vrai login
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', 'mock-jwt-token-for-' + user.username);
  
  console.log(`🚀 Connexion rapide: ${user.username}`);
  
  return user;
};