// src/services/userService.ts
import { loginUserApi, logoutUserApi, loginUserApiMock, testApiConnection } from './apiService';

export interface AppUser {
  id: string;
  email: string;
  username: string;
  id_type_account: string;
  name_type?: 'Manager' | 'Utilisateur';
}

const USE_REAL_API = true; 

export const loginUserWithFirestore = async (email: string, password: string) => {
  console.log('🔑 Début authentification...');
  
  if (USE_REAL_API) {
    // D'abord tester la connexion API
    const isApiAvailable = await testApiConnection();
    
    if (!isApiAvailable) {
      console.log('⚠️ API non disponible, utilisation du mock');
      return loginUserApiMock(email, password);
    }
    
    // Utiliser la vraie API
    return loginUserApi(email, password);
  } else {
    // Utiliser le mock
    return loginUserApiMock(email, password);
  }
};

export const logoutUserFirestore = logoutUserApi;

export const getCurrentUserFromStorage = (): AppUser | null => {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      console.log('🔍 Aucun utilisateur en session');
      return null;
    }
    
    const user = JSON.parse(userStr) as AppUser;
    console.log('👤 Utilisateur en session:', user);
    return user;
  } catch (error) {
    console.error('❌ Erreur parsing user:', error);
    localStorage.removeItem('currentUser');
    return null;
  }
};

export const isLoggedIn = (): boolean => {
  return !!getCurrentUserFromStorage();
};

// Fonction pour simuler une connexion rapide (pour tests)
export const quickLogin = (userType: 'manager' | 'user') => {
  const users = {
    manager: {
      id: "1",
      email: "olona@example.com",
      username: "olona",
      id_type_account: "1",
      name_type: "Manager" as const
    },
    user: {
      id: "2",
      email: "mario@example.com",
      username: "mario",
      id_type_account: "2",
      name_type: "Utilisateur" as const
    }
  };
  
  const user = users[userType];
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  console.log(`🚀 Connexion rapide: ${user.username}`);
  
  return user;
};