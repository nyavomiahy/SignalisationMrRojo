// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDfzlSA-IaQZpbyayTVsbpe9c-BC7FVjxY",
  authDomain: "mobile-10a78.firebaseapp.com",
  projectId: "mobile-10a78",
  storageBucket: "mobile-10a78.firebasestorage.app",
  messagingSenderId: "461724099351",
  appId: "1:461724099351:web:22c1b9f7013abffe1e8d52"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const collections = {
  type_account: collection(db, 'type_account'),
  users: collection(db, 'users'),
  entreprise: collection(db, 'entreprise'),
  point: collection(db, 'point'),
  statut_point: collection(db, 'statut_point'),
  status_point: collection(db, 'status_point'),
  user_point: collection(db, 'user_point'),
  image_point: collection(db, 'image_point'),
  notification_read: collection(db, 'notification_read')
};

export interface TypeAccount {
  id: string;
  name_type: 'Manager' | 'Utilisateur';
}

export interface User {
  id: string;
  username: string;
  mail: string;
  password: string;
  id_type_account: string;
}

export interface Entreprise {
  id: string;
  entreprise_name: string;
}

export interface Point {
  id: string;
  latitude: number;
  longitude: number;
  surface: number;
  budget: number;
  niveau: number;          // ✅ AJOUT
  id_entreprise: string;
  nameplace: string;
  createdAt?: Timestamp;
}


export interface StatutPoint {
  id: string;
  id_point: string;
  status: string; 
  date: Timestamp | string;
}

export interface StatusPoint {
  id_point: number;          // avant c'était string, maintenant number
  status: string;            // reste string
  date: Timestamp;           // date de l'événement
  created_at: Timestamp;     // date de création
  updated_at?: Timestamp;    // date de mise à jzour (optionnelle)
}


export interface UserPoint {
  id: string;
  id_point: string;
  id_user: string;
}

export interface ImagePoint {
  id: string;
  id_point: string;
  url: string;
  createdAt?: Timestamp;
}

export interface NotificationRead {
  id?: string;
  user_id: string;
  statut_point_id: string;
  read_at: Timestamp;
}

export { Timestamp };