const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST : ajouter un status
router.post("/", async (req, res) => {
  try {
    const { id_point, status, daty } = req.body;

    await pool.query(
      "INSERT INTO status_point (id_point, status, daty) VALUES ($1, $2, $3)",
      [id_point, status, daty]
    );

    res.json({ message: "Status ajouté" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔥 GET : récupérer le status actuel d'un point (le dernier)
router.get("/:id_point", async (req, res) => {
  try {
    const { id_point } = req.params;

    const result = await pool.query(
      `SELECT status, daty
       FROM status_point
       WHERE id_point = $1
       ORDER BY daty DESC
       LIMIT 1`,
      [id_point]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔥 GET : récupérer le dernier status de **tous** les points
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (id_point)
        id_point,
        status
      FROM status_point
      ORDER BY id_point, updated_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
