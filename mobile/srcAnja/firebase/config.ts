// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

export const collections = {
  type_account: collection(db, 'type_account'),
  users: collection(db, 'users'),
  entreprise: collection(db, 'entreprise'),
  point: collection(db, 'point'),
  statut_point: collection(db, 'statut_point'),
  user_point: collection(db, 'user_point')
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
  id_entreprise: string;
  nameplace: string;
  createdAt?: Timestamp;
}

export interface StatutPoint {
  id: string;
  id_point: string;
  status: string; // Modifié de number à string
  date: Timestamp | string;
}

export interface UserPoint {
  id: string;
  id_point: string;
  id_user: string;
}

export { Timestamp };