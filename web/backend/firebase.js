const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

try {
  // Chemin vers le fichier service account
  const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Fichier Firebase non trouvé: ${serviceAccountPath}`);
  }

  // Charger le fichier
  const serviceAccount = require(serviceAccountPath);

  // Initialiser Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("✅ Firebase initialisé avec succès");
  
  // Exporter l'instance admin
  module.exports = admin;

} catch (error) {
  console.error("❌ Erreur d'initialisation Firebase:", error.message);
  
  // Créer un export mock pour éviter les crashs (à des fins de test)
  module.exports = {
    apps: [],
    initializeApp: () => console.log("Firebase mock initialisé"),
    firestore: () => {
      console.log("Firestore mock appelé");
      return {
        collection: () => ({
          get: () => Promise.resolve({ docs: [] })
        })
      };
    }
  };
}