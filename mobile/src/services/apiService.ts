import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp
} from "firebase/firestore";

export async function login(email: string, password: string) {

  // 1️⃣ Vérifier si l'utilisateur existe dans Firestore
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("mail", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Utilisateur non trouvé");
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  const userRef = doc(db, "users", userDoc.id);

  // 2️⃣ Vérifier le nombre de tentatives
  if ((userData.nbrTentative || 0) >= 3) {
    throw new Error("Compte bloqué après 3 tentatives");
  }

  try {
    // 3️⃣ Connexion Firebase Auth
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;
    const token = await user.getIdToken();

    // 4️⃣ Reset des tentatives
    await updateDoc(userRef, {
      nbrTentative: 0,
      firebaseUid: user.uid,
      updatedAt: Timestamp.now()
    });

    // 5️⃣ Stocker la session
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email,
      username: userData.username,
      id_type_account: userData.id_type_account
    }));

    return true;

  } catch (error) {

    // 6️⃣ Incrémenter les tentatives
    const newCount = (userData.nbrTentative || 0) + 1;

    await updateDoc(userRef, {
      nbrTentative: newCount,
      updatedAt: Timestamp.now()
    });

    if (newCount >= 3) {
      throw new Error("Compte bloqué après 3 tentatives");
    }

    throw new Error("Email ou mot de passe incorrect");
  }
}
