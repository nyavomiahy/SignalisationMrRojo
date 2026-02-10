// src/services/apiService.ts
import { AppUser } from './userService';

const API_URL = 'http://localhost:8082/api';

export const loginUserApi = async (email: string, password: string): Promise<{
  success: boolean;
  user?: AppUser;
  error?: string;
  message?: string;
}> => {
  try {
    console.log('🔐 Tentative de connexion API:', { email, password });
    
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        mail: email,
        psswd: password
      })
    });
    
    console.log('📡 Réponse API - Status:', response.status);
    
    const responseText = await response.text();
    console.log('📡 Réponse API - Text:', responseText);
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      return {
        success: false,
        error: 'Réponse du serveur invalide'
      };
    }
    
    console.log('📡 Réponse API - Data:', data);
    
    if (!response.ok) {
      const errorMsg = data.message || data.error || `Erreur ${response.status}: ${response.statusText}`;
      console.error('❌ Erreur API:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
    
    // Structure de la réponse attendue - plusieurs formats possibles
    let user: AppUser;
    
    if (data.user) {
      // Format: { user: { ... } }
      user = {
        id: data.user.id || '',
        email: data.user.mail || data.user.email || '',
        username: data.user.username || data.user.name || '',
        id_type_account: data.user.id_type_account || data.user.typeAccountId || '',
        name_type: data.user.name_type || (data.user.isManager ? 'Manager' : 'Utilisateur')
      };
    } else if (data.mail) {
    user = {
    id: data.id ?? '',
    email: data.mail,
    username: data.username ?? '',
    id_type_account: data.typeAccount?.id ?? '',
    name_type: data.typeAccount?.name_type ?? ''
  };


    } else {
      console.error('❌ Format de réponse API inconnu:', data);
      return {
        success: false,
        error: 'Format de réponse inattendu du serveur'
      };
    }

    if (!user.email) {
      console.error('❌ Données utilisateur incomplètes:', user);
      return {
        success: false,
        error: 'Données utilisateur incomplètes'
      };
    }
    
    console.log('✅ Utilisateur connecté via API:', user);
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return {
      success: true,
      user,
      message: 'Connexion réussie'
    };
    
  } catch (error: any) {
    console.error('🚨 Erreur de connexion API:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        success: false,
        error: 'Impossible de joindre le serveur. Vérifiez que l\'API est en cours d\'exécution.'
      };
    }
    
    return {
      success: false,
      error: 'Erreur de connexion: ' + error.message
    };
  }
};

export const loginUserApiMock = async (email: string, password: string): Promise<{
  success: boolean;
  user?: AppUser;
  error?: string;
  message?: string;
}> => {
  console.log('🧪 Utilisation mock API pour:', email);
  
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Données de test
  const testUsers = [
    { 
      id: "1", 
      mail: "olona@example.com", 
      password: "123456", 
      username: "olona", 
      id_type_account: "1", 
      name_type: "Manager" 
    },
    { 
      id: "2", 
      mail: "mario@example.com", 
      password: "abcdef", 
      username: "mario", 
      id_type_account: "2", 
      name_type: "Utilisateur" 
    }
  ];
  
  const user = testUsers.find(u => u.mail === email && u.password === password);
  
  if (!user) {
    return {
      success: false,
      error: "Identifiants incorrects"
    };
  }
  
  const { password: _, ...userWithoutPassword } = user;
  
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  
  return {
    success: true,
    user: userWithoutPassword,
    message: 'Connexion réussie (mode test)'
  };
};

export const logoutUserApi = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  console.log('👋 Utilisateur déconnecté');
  return { success: true, message: 'Déconnexion réussie' };
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Test de connexion à l'API
export const testApiConnection = async () => {
  console.log('🧪 Test de connexion à l\'API...');
  
  try {
    const response = await fetch(`${API_URL}/health` || `${API_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Test API - Status:', response.status);
    console.log('📡 Test API - OK:', response.ok);
    
    return response.ok;
  } catch (error) {
    console.error('❌ Test API échoué:', error);
    return false;
  }
};