const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET points

router.get("/", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT p.id_point, p.latitude, p.longitude, p.surface, p.budget, p.nameplace, e.name_entreprise,
               sp.status, sp.daty
        FROM points p
        LEFT JOIN entreprise e ON e.id_entreprise = p.id_entreprise
        LEFT JOIN LATERAL (
            SELECT status, daty
            FROM status_point
            WHERE id_point = p.id_point
            ORDER BY daty DESC, id_status_point DESC
            LIMIT 1
        ) sp ON true
      `);
  
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  

// DELETE point
router.delete("/:id_point", async (req, res) => {
  try {
    const { id_point } = req.params;
    await pool.query("DELETE FROM points WHERE id_point = $1", [id_point]);
    res.json({ message: "Point supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// UPDATE point (ex: update nameplace)
router.put("/:id_point", async (req, res) => {
  try {
    const { id_point } = req.params;
    const { nameplace } = req.body;

    await pool.query(
      "UPDATE points SET nameplace = $1 WHERE id_point = $2",
      [nameplace, id_point]
    );

    res.json({ message: "Point mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;
