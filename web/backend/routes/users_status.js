const express = require("express");
const router = express.Router();
const pool = require("../db");

/* =========================
   GET : utilisateurs + dernier statut
   ========================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        COALESCE(su.status, 1) AS status,
        COALESCE(su.description, 'actif') AS description
      FROM users u
      LEFT JOIN LATERAL (
        SELECT status, description
        FROM status_users
        WHERE id_user = u.id
        ORDER BY daty DESC, id_status_users DESC
        LIMIT 1
      ) su ON true
      ORDER BY u.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* =========================
   POST : bloquer / débloquer user
   ========================= */
router.post("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    await pool.query(
      `
      INSERT INTO status_users(id_user, status, description, daty)
      VALUES ($1, $2, $3, CURRENT_DATE)
      `,
      [id, status, description]
    );

    res.json({ message: "Statut utilisateur mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
