const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST : ajouter un status
// router.post("/", async (req, res) => {
//   try {
//     const { id_point, status, daty } = req.body;

//     await pool.query(
//       "INSERT INTO status_point (id_point, status, daty) VALUES ($1, $2, $3)",
//       [id_point, status, daty]
//     );

//     res.json({ message: "Status ajouté" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// });
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_point, status, daty, niveau } = req.body;

    // 1. Insérer ou mettre à jour le status_point
    await client.query(
      "INSERT INTO status_point (id_point, status, daty) VALUES ($1, $2, $3)",
      [id_point, status, daty]
    );

    // 2. Mettre à jour le niveau dans la table points (si fourni)
    if (niveau !== undefined && niveau !== null) {
      await client.query(
        "UPDATE points SET niveau = $1, updated_at = NOW() WHERE id_point = $2",
        [niveau, id_point]
      );
    }

    await client.query('COMMIT');
    res.json({ message: "Status et niveau mis à jour avec succès" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
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
