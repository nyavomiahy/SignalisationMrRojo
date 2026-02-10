// src/services/pointService.ts
import { db, collections, Point, StatutPoint, Entreprise } from '@/firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getCurrentUserFromStorage } from './userService';
import { analytics } from 'ionicons/icons';

// Fonction pour générer un nouvel ID séquentiel
const generateNewId = async (collectionName: keyof typeof collections): Promise<string> => {
  try {
    const collectionRef = collections[collectionName];
    const snapshot = await getDocs(collectionRef);
    
    // Trouver le plus grand ID numérique
    const ids = snapshot.docs.map(doc => {
      const id = doc.id;
      return isNaN(Number(id)) ? 0 : Number(id);
    });
    
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return (maxId + 1).toString();
    
  } catch (error) {
    console.error('Erreur génération ID:', error);
    return Date.now().toString();
                                
  }
};

// Créer un nouveau point
export const createPoint = async (
  pointData: Omit<Point, 'id'>
): Promise<{ success: boolean; pointId?: string; point?: any; error?: string }> => {
  try {
    const currentUser = getCurrentUserFromStorage();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    console.log('📍 Création point pour utilisateur:', currentUser.id);
    
    // Générer un nouvel ID pour le point
    const pointId = await generateNewId('point');
    const pointRef = doc(collections.point, pointId);
    
    const point: Point = {
      id: pointId,
      ...pointData,
      createdAt: serverTimestamp() as Timestamp
    };
    
    await setDoc(pointRef, point);
    console.log('✅ Point créé:', pointId);
    
    // Créer le statut par défaut
    const statutId = await generateNewId('statut_point');
    const statutRef = doc(collections.statut_point, statutId);
    
    await setDoc(statutRef, {
      id: statutId,
      id_point: pointId,
      status: 'nouveau',
      date: serverTimestamp()
    });
    console.log('✅ Statut créé pour point:', pointId);
    
    // Créer la relation user_point
    const userPointId = await generateNewId('user_point');
    const userPointRef = doc(collections.user_point, userPointId);
    
    await setDoc(userPointRef, {
      id: userPointId,
      id_point: pointId,
      id_user: currentUser.id
    });
    console.log('✅ Relation user_point créée');
    
    return { 
      success: true, 
      pointId,
      point: { ...point, id: pointId, userId: currentUser.id }
    };
    
  } catch (error: any) {
    console.error('❌ Erreur création point:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer tous les points
export const getAllPoints = async (): Promise<{ 
  success: boolean; 
  points?: any[]; 
  error?: string 
}> => {
  try {
    console.log('📥 Chargement de tous les points...');
    const querySnapshot = await getDocs(collections.point);
    console.log(`📊 ${querySnapshot.docs.length} points trouvés dans Firestore`);
    
    const pointsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const pointData = docSnapshot.data() as Point;
      
      // Récupérer l'utilisateur via user_point
      let userInfo = { userId: '', userName: '', userEmail: '' };
      
      try {
        // Récupérer tous les user_points et filtrer localement
        const userPointSnapshot = await getDocs(collections.user_point);
        const userPoints = userPointSnapshot.docs;
        
        const userPoint = userPoints.find(doc => doc.data().id_point === docSnapshot.id);
        if (userPoint) {
          const userId = userPoint.data().id_user;
          if (userId) {
            const userDoc = await getDoc(doc(collections.users, userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userInfo = {
                userId,
                userName: userData.username || 'Utilisateur',
                userEmail: userData.mail || ''
              };
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur récupération utilisateur:', error);
      }
      
      // Récupérer le statut
      let lastStatus = 'nouveau';
      let statusDate = null;
      
      try {
        const statutSnapshot = await getDocs(collections.statut_point);
        const statuts = statutSnapshot.docs
          .filter(doc => doc.data().id_point === docSnapshot.id)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (statuts.length > 0) {
          // Trier localement par date (plus récent d'abord)
          statuts.sort((a, b) => {
            const dateA = a.date?.toDate?.() || new Date(0);
            const dateB = b.date?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          
          lastStatus = statuts[0].status || 'nouveau';
          statusDate = statuts[0].date || null;
        }
      } catch (error) {
        console.log('⚠️ Erreur récupération statut:', error);
      }
      
      return {
        id: docSnapshot.id,
        ...pointData,
        ...userInfo,
        status: lastStatus,
        statusDate,
        createdAt: pointData.createdAt || null
      };
    });
    
    const points = await Promise.all(pointsPromises);
    
    // Trier par date (le plus récent d'abord)
    points.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`✅ ${points.length} points chargés avec succès`);
    return { success: true, points };
    
  } catch (error: any) {
    console.error('❌ Erreur récupération points:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer les points de l'utilisateur connecté
export const getMyPoints = async (): Promise<{ 
  success: boolean; 
  points?: any[]; 
  error?: string 
}> => {
  try {
    const currentUser = getCurrentUserFromStorage();
    
    if (!currentUser) {
      return { 
        success: false, 
        error: 'Utilisateur non connecté' 
      };
    }

    console.log('📥 Chargement des points pour utilisateur:', currentUser.id);
    
    // 1. Récupérer tous les user_points et filtrer localement
    const userPointSnapshot = await getDocs(collections.user_point);
    const myUserPoints = userPointSnapshot.docs
      .filter(doc => doc.data().id_user === currentUser.id)
      .map(doc => doc.data().id_point);
    
    console.log(`📊 ${myUserPoints.length} relations user_point trouvées`);
    
    if (myUserPoints.length === 0) {
      console.log('ℹ️ Aucun point trouvé pour cet utilisateur');
      return { success: true, points: [] };
    }
    
    // 2. Récupérer tous les points
    const pointSnapshot = await getDocs(collections.point);
    const myPoints = pointSnapshot.docs
      .filter(doc => myUserPoints.includes(doc.id))
      .map(async (doc) => {
        const pointData = doc.data();
        
        // Récupérer le statut
        let lastStatus = 'nouveau';
        let statusDate = null;
        
        try {
          const statutSnapshot = await getDocs(collections.statut_point);
          const statuts = statutSnapshot.docs
            .filter(statutDoc => statutDoc.data().id_point === doc.id)
            .map(statutDoc => ({ id: statutDoc.id, ...statutDoc.data() }));
          
          if (statuts.length > 0) {
            // Trier localement par date
            statuts.sort((a, b) => {
              const dateA = a.date?.toDate?.() || new Date(0);
              const dateB = b.date?.toDate?.() || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });
            
            lastStatus = statuts[0].status || 'nouveau';
            statusDate = statuts[0].date || null;
          }
        } catch (error) {
          console.log('⚠️ Erreur récupération statut:', error);
        }
        
        return {
          id: doc.id,
          ...pointData,
          userId: currentUser.id,
          userName: currentUser.username,
          userEmail: currentUser.email,
          status: lastStatus,
          statusDate,
          createdAt: pointData.createdAt || null
        };
      });
    
    const points = await Promise.all(myPoints);
    
    // Trier par date (le plus récent d'abord)
    points.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`✅ ${points.length} points personnels chargés`);
    return { success: true, points };
    
  } catch (error: any) {
    console.error('❌ Erreur récupération mes points:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Récupérer toutes les entreprises
export const getAllEntreprises = async (): Promise<{ 
  success: boolean; 
  entreprises?: Entreprise[]; 
  error?: string 
}> => {
  try {
    console.log('🏢 Chargement des entreprises...');
    const querySnapshot = await getDocs(collections.entreprise);
    const entreprises: Entreprise[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entreprises.push({
        id: doc.id,
        entreprise_name: data.entreprise_name || ''
      });
    });
    
    console.log(`✅ ${entreprises.length} entreprises chargées`);
    return { success: true, entreprises };
  } catch (error: any) {
    console.error('❌ Erreur récupération entreprises:', error);
    return { success: false, error: error.message };
  }
};

// Mettre à jour le statut d'un point
export const updatePointStatus = async (
  pointId: string,
  status: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const statutId = await generateNewId('statut_point');
    const statutRef = doc(collections.statut_point, statutId);
    
    await setDoc(statutRef, {
      id: statutId,
      id_point: pointId,
      status,
      date: serverTimestamp()
    });
    
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Erreur mise à jour statut:', error);
    return { success: false, error: error.message };
  }
};