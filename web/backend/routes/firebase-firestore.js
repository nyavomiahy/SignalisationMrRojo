const express = require("express");
const router = express.Router();
const admin = require("../firebase");
const pool = require("../db");

// Fonction pour convertir une date string en Timestamp Firebase
function parseFirestoreDate(dateString) {
  // Format: "27 janvier 2026 à 08:25:02 UTC+3"
  // Supprimer " UTC+3" et convertir
  const cleaned = dateString.replace(" UTC+3", "");
  
  // Convertir en date JavaScript
  // "27 janvier 2026 à 08:25:02" -> "27 January 2026 08:25:02"
  const months = {
    'janvier': 'January', 'février': 'February', 'mars': 'March',
    'avril': 'April', 'mai': 'May', 'juin': 'June',
    'juillet': 'July', 'août': 'August', 'septembre': 'September',
    'octobre': 'October', 'novembre': 'November', 'décembre': 'December'
  };
  
  let parsedDate = cleaned;
  Object.keys(months).forEach(fr => {
    parsedDate = parsedDate.replace(fr, months[fr]);
  });
  
  parsedDate = parsedDate.replace(' à ', ' ');
  
  const dateObj = new Date(parsedDate);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Date invalide: ${dateString}`);
  }
  
  // Convertir en Timestamp Firebase
  return admin.firestore.Timestamp.fromDate(dateObj);
}
router.post("/", async (req, res) => {
  try {
    console.log(`🔍 Début de la synchronisation complète`);
    
    if (!admin.apps?.length) {
      throw new Error("Firebase non initialisé");
    }
    
    const db = admin.firestore();
    
    console.log(`📊 Récupération de tous les points depuis Firestore...`);
    const pointsSnapshot = await db.collection("point").get();
    
    console.log(`📊 ${pointsSnapshot.size} points trouvés dans Firestore`);
    
    console.log(`📊 Récupération de tous les statuts depuis Firestore...`);
    const statusSnapshot = await db.collection("status_point").get();
    
    console.log(`📊 ${statusSnapshot.size} statuts trouvés dans Firestore`);
    
    // Variables de comptage
    let pointsInserted = 0;
    let pointsUpdated = 0;
    let pointsSkipped = 0;
    let statusInserted = 0;
    let statusSkipped = 0;
    let errors = 0;
    
    const syncedDetails = [];
    
    // 3. Synchroniser les POINTS
    console.log(`🔄 Synchronisation des points...`);
    for (const pointDoc of pointsSnapshot.docs) {
      try {
        const pointId = pointDoc.id;
        const pointData = pointDoc.data();
        
        // Vérifier si le point existe déjà dans PostgreSQL
        const existingPoint = await pool.query(
          `SELECT id_point FROM points WHERE id_point = $1`,
          [pointId]
        );
        
        if (existingPoint.rows.length > 0) {
          // Point existe déjà, on peut le mettre à jour si nécessaire
          await pool.query(
            `UPDATE points 
             SET latitude = $1, longitude = $2, surface = $3, 
                 budget = $4, nameplace = $5, id_entreprise = $6
             WHERE id_point = $7`,
            [
              pointData.latitude || 0,
              pointData.longitude || 0,
              pointData.surface || 0,
              pointData.budget || 0,
              pointData.nameplace || 'Non spécifié',
              pointData.id_entreprise || 1,
              pointId
            ]
          );
          pointsUpdated++;
          console.log(`🔄 Point ${pointId} mis à jour`);
        } else {
          // Point n'existe pas, on l'insère
          await pool.query(
            `INSERT INTO points(id_point, latitude, longitude, surface, budget, nameplace, id_entreprise)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              pointId,
              pointData.latitude || 0,
              pointData.longitude || 0,
              pointData.surface || 0,
              pointData.budget || 0,
              pointData.nameplace || 'Non spécifié',
              pointData.id_entreprise || 1
            ]
          );
          pointsInserted++;
          console.log(`✅ Point ${pointId} inséré`);
        }
        
        syncedDetails.push({
          type: 'point',
          id: pointId,
          action: existingPoint.rows.length > 0 ? 'updated' : 'inserted'
        });
        
      } catch (error) {
        console.error(`❌ Erreur sur point ${pointDoc.id}:`, error.message);
        errors++;
      }
    }
    
    // 4. Synchroniser les STATUTS
    console.log(`🔄 Synchronisation des statuts...`);
    for (const statusDoc of statusSnapshot.docs) {
      try {
        const statusData = statusDoc.data();
        const pointId = statusData.id_point;
        
        if (!pointId) {
          console.warn(`⚠️  Statut sans id_point ignoré`);
          continue;
        }
        
        // Convertir la date Firestore en format PostgreSQL
        let statusDate = new Date();
        if (statusData.date && statusData.date.toDate) {
          statusDate = statusData.date.toDate();
        } else if (statusData.date) {
          statusDate = new Date(statusData.date);
        }
        
        // Vérifier si le statut existe déjà dans PostgreSQL
        // (on vérifie la combinaison id_point + date + status pour éviter les doublons)
        const existingStatus = await pool.query(
          `SELECT id_status_point FROM status_point 
           WHERE id_point = $1 AND daty = $2 AND status = $3`,
          [pointId, statusDate, statusData.status || 'nouveau']
        );
        
        if (existingStatus.rows.length > 0) {
          statusSkipped++;
          console.log(`⏭️  Statut pour point ${pointId} déjà existant, ignoré`);
        } else {
          // Insérer le nouveau statut
          await pool.query(
            `INSERT INTO status_point(id_point, status, daty)
             VALUES ($1, $2, $3)`,
            [pointId, statusData.status || 'nouveau', statusDate]
          );
          statusInserted++;
          console.log(`✅ Statut '${statusData.status}' pour point ${pointId} inséré`);
        }
        
        syncedDetails.push({
          type: 'status',
          pointId: pointId,
          status: statusData.status,
          action: existingStatus.rows.length > 0 ? 'skipped' : 'inserted'
        });
        
      } catch (error) {
        console.error(`❌ Erreur sur statut:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Synchronisation terminée:`);
    console.log(`📊 Points: ${pointsInserted} insérés, ${pointsUpdated} mis à jour, ${pointsSkipped} ignorés`);
    console.log(`📊 Statuts: ${statusInserted} insérés, ${statusSkipped} ignorés`);
    console.log(`⚠️  Erreurs: ${errors}`);
    
    res.json({
      success: true,
      summary: {
        totalPointsFirestore: pointsSnapshot.size,
        totalStatusFirestore: statusSnapshot.size,
        points: {
          inserted: pointsInserted,
          updated: pointsUpdated,
          skipped: pointsSkipped
        },
        status: {
          inserted: statusInserted,
          skipped: statusSkipped
        },
        errors: errors
      },
      details: syncedDetails.slice(0, 100) // Limiter à 100 entrées pour la réponse
    });
    
  } catch (error) {
    console.error(`🔥 Erreur lors de la synchronisation:`, error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});
router.post("/postgres-to-firebase", async (req, res) => {
  try {
    console.log(`🔍 Début de la synchronisation PostgreSQL → Firestore`);
    
    if (!admin.apps?.length) {
      throw new Error("Firebase non initialisé");
    }
    
    const db = admin.firestore();
    
    // Variables de comptage
    let pointsInserted = 0;
    let pointsSkipped = 0;
    let statusInserted = 0;
    let statusSkipped = 0;
    let errors = 0;
    
    const syncedDetails = [];
    
    // 1. Synchroniser les POINTS de PostgreSQL vers Firestore
    console.log(`📊 Récupération de tous les points depuis PostgreSQL...`);
    const pointsResult = await pool.query(`
      SELECT id_point, latitude, longitude, surface, budget, nameplace, id_entreprise 
      FROM points
    `);
    
    console.log(`📊 ${pointsResult.rows.length} points trouvés dans PostgreSQL`);
    
    for (const point of pointsResult.rows) {
      try {
        const pointId = point.id_point;
        
        // Vérifier si le point existe déjà dans Firestore
        const pointRef = db.collection("point").doc(pointId.toString());
        const existingPoint = await pointRef.get();
        
        if (existingPoint.exists) {
          // Le point existe déjà dans Firestore, on peut le mettre à jour si nécessaire
          await pointRef.update({
            latitude: point.latitude || 0,
            longitude: point.longitude || 0,
            surface: point.surface || 0,
            budget: point.budget || 0,
            nameplace: point.nameplace || 'Non spécifié',
            id_entreprise: point.id_entreprise || 1,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          pointsSkipped++; // On compte comme "ignoré" car existait déjà
          console.log(`⏭️  Point ${pointId} déjà existant dans Firestore, mis à jour`);
        } else {
          // Le point n'existe pas dans Firestore, on l'insère
          await pointRef.set({
            latitude: point.latitude || 0,
            longitude: point.longitude || 0,
            surface: point.surface || 0,
            budget: point.budget || 0,
            nameplace: point.nameplace || 'Non spécifié',
            id_entreprise: point.id_entreprise || 1,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          pointsInserted++;
          console.log(`✅ Point ${pointId} inséré dans Firestore`);
        }
        
        syncedDetails.push({
          type: 'point',
          id: pointId,
          action: existingPoint.exists ? 'updated' : 'inserted'
        });
        
      } catch (error) {
        console.error(`❌ Erreur sur point ${point.id_point}:`, error.message);
        errors++;
      }
    }
    
    // 2. Synchroniser les STATUTS de PostgreSQL vers Firestore
    console.log(`📊 Récupération de tous les statuts depuis PostgreSQL...`);
    const statusResult = await pool.query(`
      SELECT id_status_point, id_point, status, daty 
      FROM status_point 
      ORDER BY daty
    `);
    
    console.log(`📊 ${statusResult.rows.length} statuts trouvés dans PostgreSQL`);
    
    for (const status of statusResult.rows) {
      try {
        const pointId = status.id_point;
        
        if (!pointId) {
          console.warn(`⚠️  Statut sans id_point ignoré`);
          continue;
        }
        
        // Convertir la date PostgreSQL en format Firestore
        let statusDate;
        if (status.daty instanceof Date) {
          statusDate = admin.firestore.Timestamp.fromDate(status.daty);
        } else if (status.daty) {
          statusDate = admin.firestore.Timestamp.fromDate(new Date(status.daty));
        } else {
          statusDate = admin.firestore.Timestamp.now();
        }
        
        // Créer un ID unique pour le statut dans Firestore
        // Utiliser l'ID PostgreSQL ou créer un ID composite
        const statusId = status.id || `${pointId}_${statusDate.toMillis()}`;
        
        // Vérifier si le statut existe déjà dans Firestore
        const statusRef = db.collection("status_point").doc(statusId.toString());
        const existingStatus = await statusRef.get();
        
        if (existingStatus.exists) {
          // Le statut existe déjà, on peut le mettre à jour si nécessaire
          await statusRef.update({
            id_point: pointId,
            status: status.status || 'nouveau',
            date: statusDate,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          statusSkipped++;
          console.log(`⏭️  Statut ${statusId} déjà existant dans Firestore, mis à jour`);
        } else {
          // Le statut n'existe pas dans Firestore, on l'insère
          await statusRef.set({
            id_point: pointId,
            status: status.status || 'nouveau',
            date: statusDate,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          statusInserted++;
          console.log(`✅ Statut '${status.status}' pour point ${pointId} inséré dans Firestore`);
        }
        
        syncedDetails.push({
          type: 'status',
          id: statusId,
          pointId: pointId,
          status: status.status,
          action: existingStatus.exists ? 'skipped' : 'inserted'
        });
        
      } catch (error) {
        console.error(`❌ Erreur sur statut:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Synchronisation PostgreSQL → Firestore terminée:`);
    console.log(`📊 Points: ${pointsInserted} insérés, ${pointsSkipped} ignorés/mis à jour`);
    console.log(`📊 Statuts: ${statusInserted} insérés, ${statusSkipped} ignorés/mis à jour`);
    console.log(`⚠️  Erreurs: ${errors}`);
    
    res.json({
      success: true,
      summary: {
        totalPointsPostgres: pointsResult.rows.length,
        totalStatusPostgres: statusResult.rows.length,
        points: {
          inserted: pointsInserted,
          skipped: pointsSkipped
        },
        status: {
          inserted: statusInserted,
          skipped: statusSkipped
        },
        errors: errors
      },
      details: syncedDetails.slice(0, 100) // Limiter à 100 entrées pour la réponse
    });
    
  } catch (error) {
    console.error(`🔥 Erreur lors de la synchronisation PostgreSQL → Firestore:`, error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});


router.post("/postgres-to-firebase-users", async (req, res) => {
  try {
    console.log(`🔍 Début de la synchronisation utilisateurs PostgreSQL → Firebase`);
    
    if (!admin.apps?.length) {
      throw new Error("Firebase non initialisé");
    }
    
    const db = admin.firestore();
    const auth = admin.auth();
    
    // Variables de comptage
    let usersInserted = 0;
    let usersUpdated = 0;
    let usersSkipped = 0;
    let authUsersCreated = 0;
    let authUsersSkipped = 0;
    let errors = 0;
    
    const syncedDetails = [];
    
    // 1. Synchroniser les TYPES DE COMPTE
    console.log(`📊 Récupération des types de compte depuis PostgreSQL...`);
    const typesResult = await pool.query(`
      SELECT id_type_account, name_type, sync_id
      FROM type_account
    `);
    
    console.log(`📊 ${typesResult.rows.length} types de compte trouvés`);
    
    // Créer un map des types pour référence rapide
    const typeAccountMap = new Map();
    
    for (const typeAccount of typesResult.rows) {
      try {
        const typeId = typeAccount.id_type_account.toString();
        
        // Vérifier si le type existe déjà dans Firestore
        const typeRef = db.collection("type_account").doc(typeId);
        const existingType = await typeRef.get();
        
        if (existingType.exists) {
          // Mettre à jour si nécessaire
          await typeRef.update({
            name_type: typeAccount.name_type || '',
            sync_id: typeAccount.sync_id || '',
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`🔄 Type de compte ${typeId} mis à jour dans Firestore`);
        } else {
          // Insérer le nouveau type
          await typeRef.set({
            name_type: typeAccount.name_type || '',
            sync_id: typeAccount.sync_id || '',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`✅ Type de compte ${typeId} inséré dans Firestore`);
        }
        
        // Stocker dans le map pour référence
        typeAccountMap.set(typeAccount.id_type_account, typeAccount.name_type);
        
      } catch (error) {
        console.error(`❌ Erreur sur type de compte ${typeAccount.id_type_account}:`, error.message);
        errors++;
      }
    }
    
    // 2. Synchroniser les ENTREPRISES
    console.log(`📊 Récupération des entreprises depuis PostgreSQL...`);
    const entreprisesResult = await pool.query(`
      SELECT id_entreprise, name_entreprise, sync_id
      FROM entreprise
    `);
    
    console.log(`📊 ${entreprisesResult.rows.length} entreprises trouvées`);
    
    // Créer un map des entreprises pour référence rapide
    const entrepriseMap = new Map();
    
    for (const entreprise of entreprisesResult.rows) {
      try {
        const entrepriseId = entreprise.id_entreprise.toString();
        
        // Vérifier si l'entreprise existe déjà dans Firestore
        const entrepriseRef = db.collection("entreprise").doc(entrepriseId);
        const existingEntreprise = await entrepriseRef.get();
        
        if (existingEntreprise.exists) {
          // Mettre à jour si nécessaire
          await entrepriseRef.update({
            name_entreprise: entreprise.name_entreprise || '',
            sync_id: entreprise.sync_id || '',
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`🔄 Entreprise ${entrepriseId} mise à jour dans Firestore`);
        } else {
          // Insérer la nouvelle entreprise
          await entrepriseRef.set({
            name_entreprise: entreprise.name_entreprise || '',
            sync_id: entreprise.sync_id || '',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`✅ Entreprise ${entrepriseId} insérée dans Firestore`);
        }
        
        // Stocker dans le map pour référence
        entrepriseMap.set(entreprise.id_entreprise, entreprise.name_entreprise);
        
      } catch (error) {
        console.error(`❌ Erreur sur entreprise ${entreprise.id_entreprise}:`, error.message);
        errors++;
      }
    }
    
    // 3. Synchroniser les UTILISATEURS (Firestore + Authentication)
    console.log(`📊 Récupération de tous les utilisateurs depuis PostgreSQL...`);
    const usersResult = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.password,
        u.email,
        u.id_type_account,
        u.sync_id,
        u.updated_at,
        ta.name_type as type_name
      FROM users u
      LEFT JOIN type_account ta ON u.id_type_account = ta.id_type_account
      ORDER BY u.id
    `);
    
    console.log(`📊 ${usersResult.rows.length} utilisateurs trouvés dans PostgreSQL`);
    
    for (const user of usersResult.rows) {
      try {
        const userId = user.id.toString();
        const userEmail = user.email || '';
        const userPassword = user.password || '';
        const username = user.username || '';
        
        // Vérifier si l'utilisateur existe dans Firestore
        const userRef = db.collection("users").doc(userId);
        const existingUser = await userRef.get();
        
        // Vérifier si l'utilisateur existe dans Firebase Authentication
        let firebaseAuthUser = null;
        try {
          firebaseAuthUser = await auth.getUserByEmail(userEmail);
        } catch (error) {
          // L'utilisateur n'existe pas dans Auth, c'est normal
          if (error.code !== 'auth/user-not-found') {
            console.error(`⚠️  Erreur lors de la vérification Auth pour ${userEmail}:`, error.message);
          }
        }
        
        // 3a. Gérer Firebase Authentication
        if (firebaseAuthUser) {
          // L'utilisateur existe déjà dans Auth
          authUsersSkipped++;
          console.log(`⏭️  Utilisateur ${userEmail} déjà existant dans Firebase Auth`);
        } else {
          // Créer l'utilisateur dans Firebase Authentication
          try {
            const authUser = await auth.createUser({
              email: userEmail,
              emailVerified: true,
              password: userPassword,
              displayName: username,
              disabled: false
            });
            
            authUsersCreated++;
            console.log(`✅ Utilisateur ${userEmail} créé dans Firebase Auth (UID: ${authUser.uid})`);
            
            // Lier l'UID Firebase avec l'ID PostgreSQL
            await userRef.set({
              firebase_uid: authUser.uid,
              updated_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
          } catch (authError) {
            console.error(`❌ Erreur création Auth pour ${userEmail}:`, authError.message);
            errors++;
          }
        }
        
        // 3b. Gérer Firestore (données utilisateur)
        const userData = {
          username: username,
          email: userEmail,
          id_type_account: user.id_type_account || null,
          type_name: user.type_name || '',
          sync_id: user.sync_id || '',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Ajouter les dates si c'est une nouvelle insertion
        if (!existingUser.exists) {
          userData.created_at = admin.firestore.FieldValue.serverTimestamp();
        }
        
        // Ajouter l'UID Firebase si disponible
        if (firebaseAuthUser) {
          userData.firebase_uid = firebaseAuthUser.uid;
        }
        
        if (existingUser.exists) {
          // Mettre à jour l'utilisateur dans Firestore
          await userRef.update(userData);
          usersUpdated++;
          console.log(`🔄 Utilisateur ${userId} (${username}) mis à jour dans Firestore`);
        } else {
          // Insérer le nouvel utilisateur dans Firestore
          await userRef.set(userData);
          usersInserted++;
          console.log(`✅ Utilisateur ${userId} (${username}) inséré dans Firestore`);
        }
        
        syncedDetails.push({
          type: 'user',
          id: userId,
          username: username,
          email: userEmail,
          firestoreAction: existingUser.exists ? 'updated' : 'inserted',
          authAction: firebaseAuthUser ? 'skipped' : 'created'
        });
        
      } catch (error) {
        console.error(`❌ Erreur sur utilisateur ${user.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Synchronisation PostgreSQL → Firebase terminée:`);
    console.log(`📊 Types de compte: ${typesResult.rows.length} synchronisés`);
    console.log(`📊 Entreprises: ${entreprisesResult.rows.length} synchronisées`);
    console.log(`📊 Utilisateurs: ${usersInserted} insérés, ${usersUpdated} mis à jour`);
    console.log(`📊 Firebase Auth: ${authUsersCreated} créés, ${authUsersSkipped} existants`);
 
    console.log(`⚠️  Erreurs: ${errors}`);
    
    res.json({
      success: true,
      summary: {
        type_account: typesResult.rows.length,
        entreprises: entreprisesResult.rows.length,
        users: {
          postgresql: usersResult.rows.length,
          firestore: { inserted: usersInserted, updated: usersUpdated },
          auth: { created: authUsersCreated, skipped: authUsersSkipped }
        },
        errors: errors
      },
      details: syncedDetails.slice(0, 50) // Limiter à 50 entrées
    });
    
  } catch (error) {
    console.error(`🔥 Erreur lors de la synchronisation PostgreSQL → Firebase:`, error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});
// Fonction utilitaire pour parser les dates (gardée au cas où)
function parseFirestoreDate(dateString) {
  // Votre logique de parsing ici si nécessaire
  return admin.firestore.Timestamp.now();
}


// Route GET pour tester
router.get("/", (req, res) => {
  res.json({ 
    message: "API de synchronisation Firestore → PostgreSQL",
    endpoints: [
      "POST / - Sync tous les statuts 'nouveau'",
      "POST /postgres-to-firebase - Sync PostgreSQL → Firestore",
      "POST /postgres-to-firebase-users - Sync utilisateurs PostgreSQL → Firebase (Auth + Firestore)",
      "POST /by-date - Sync avec date spécifique",
      "POST /recent - Sync les récents (dernières 24h par défaut)"
    ]
  });
});

module.exports = router;