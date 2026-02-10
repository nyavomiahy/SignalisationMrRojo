// src/services/imageService.ts
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  storage, 
  collections 
} from '@/firebase/config';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Génère un nouvel ID pour la collection image_point
 */
const generateNewImageId = async (): Promise<string> => {
  try {
    const snapshot = await getDocs(collections.image_point);
    
    const ids = snapshot.docs.map(doc => {
      const id = doc.id;
      return isNaN(Number(id)) ? 0 : Number(id);
    });
    
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return (maxId + 1).toString();
    
  } catch (error) {
    console.error('Erreur génération ID image:', error);
    return Date.now().toString();
  }
};

/**
 * Upload une image vers Firebase Storage et crée l'enregistrement dans Firestore
 * @param file - Le fichier image à uploader
 * @param pointId - L'ID du point associé
 * @returns Promise avec l'URL de l'image et l'ID de l'enregistrement
 */
export const uploadPointImage = async (
  imageFile: File, 
  pointId: string
): Promise<{ 
  success: boolean; 
  imageId?: string; 
  url?: string; 
  error?: string 
}> => {
  try {
    console.log('📤 Début upload image pour point:', pointId);
    console.log('📁 Fichier:', imageFile.name, 'Taille:', imageFile.size);
    
    // 1. Upload vers Firebase Storage
    const storageRef = ref(storage, `point-images/${pointId}/${Date.now()}_${imageFile.name}`);
    const uploadResult = await uploadBytes(storageRef, imageFile);
    
    // 2. Récupérer l'URL de téléchargement
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('✅ URL image:', downloadURL);
    
    // 3. Enregistrer dans Firestore (image_point)
    const imageId = Date.now().toString(); // ID simple
    const imagePointRef = doc(collections.image_point, imageId);
    
    await setDoc(imagePointRef, {
      id: imageId,
      id_point: pointId,
      url: downloadURL,
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Image enregistrée dans Firestore avec ID:', imageId);
    
    return { 
      success: true, 
      imageId, 
      url: downloadURL 
    };
    
  } catch (error: any) {
    console.error('❌ Erreur upload image:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de l\'upload de l\'image' 
    };
  }
};

/**
 * Récupère les images associées à un point
 */
export const getPointImages = async (
  pointId: string
): Promise<{ success: boolean; images?: ImagePoint[]; error?: string }> => {
  try {
    const snapshot = await getDocs(collections.image_point);
    
    const images = snapshot.docs
      .filter(doc => doc.data().id_point === pointId)
      .map(doc => doc.data() as ImagePoint);

    return { success: true, images };

  } catch (error: any) {
    console.error('❌ Erreur récupération images:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la récupération des images'
    };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Stocke une image en base64 dans Firestore (collection image_point)
 */
export const uploadPointImageBase64 = async (
  imageFile: File,
  pointId: string
): Promise<{ success: boolean; imageId?: string; error?: string }> => {
  try {
    const base64 = await fileToBase64(imageFile);
    const imageId = Date.now().toString();
    const imagePointRef = doc(collections.image_point, imageId);
    await setDoc(imagePointRef, {
      id: imageId,
      id_point: pointId,
      base64,
      createdAt: serverTimestamp()
    });
    return { success: true, imageId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
