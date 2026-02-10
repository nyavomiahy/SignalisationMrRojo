const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET historique des prix
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_prix, prix, date
      FROM prix
      ORDER BY date DESC, id_prix DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET prix actuel (le plus récent)
router.get("/current", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT prix, date
      FROM prix
      ORDER BY date DESC, id_prix DESC
      LIMIT 1
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// UPDATE prix par id_prix
router.put("/update/:id_prix", async (req, res) => {
  try {
    const { id_prix } = req.params;
    const { prix_m2 } = req.body;

    await pool.query(
      "UPDATE prix SET prix = $1 WHERE id_prix = $2",
      [prix_m2, id_prix]
    );

    res.json({ message: "Prix mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
