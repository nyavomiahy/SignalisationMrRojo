const express = require("express");
const router = express.Router();
const pool = require("../db");

/* =========================
   GET : liste des utilisateurs
   ========================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        t.name_type
      FROM users u
      JOIN type_account t ON t.id_type_account = u.id_type_account
      ORDER BY u.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


/* =========================
   DELETE : supprimer un utilisateur
   ========================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Sécurité : éviter suppression admin si besoin
    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* =========================
   PUT : modifier un utilisateur
   ========================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, id_type_account } = req.body;

    await pool.query(
      `
      UPDATE users
      SET username = $1,
          email = $2,
          id_type_account = $3
      WHERE id = $4
      `,
      [username, email, id_type_account, id]
    );

    res.json({ message: "Utilisateur modifié" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
