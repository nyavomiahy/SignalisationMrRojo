const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        t.name_type,
        s.status,
        s.description
      FROM users u
      JOIN type_account t ON t.id_type_account = u.id_type_account
      JOIN status_users s ON s.id_user = u.id
      WHERE u.email = $1 AND u.password = $2
      ORDER BY s.daty DESC, s.id_status_users DESC
      LIMIT 1
    `, [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];

    // 🚫 compte bloqué
    if (user.status === 2) {
      return res.status(403).json({
        error: "Compte bloqué. Contactez l’administrateur."
      });
    }

    // 🚫 pas manager
    if (user.name_type !== "manager") {
      return res.status(403).json({
        error: "Accès réservé aux managers"
      });
    }

    res.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



router.post("/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const { username, email, password, id_type_account } = req.body;

    if (!username || !email || !password || !id_type_account) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // Vérifier si email existe déjà
    const check = await client.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // 🔐 Début transaction
    await client.query("BEGIN");

    // 1️⃣ Insertion user
    const insertUser = await client.query(
      `
      INSERT INTO users (username, email, password, id_type_account)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [username, email, password, parseInt(id_type_account)]
    );

    const userId = insertUser.rows[0].id;

    // 2️⃣ Insertion statut initial
    await client.query(
      `
      INSERT INTO status_users (id_user, status, description, daty)
      VALUES ($1, 1, 'actif', CURRENT_DATE)
      `,
      [userId]
    );

    // ✅ Commit
    await client.query("COMMIT");

    res.json({
      message: "Inscription réussie",
      userId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

module.exports = router;
