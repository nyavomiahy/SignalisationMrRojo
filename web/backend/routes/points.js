const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET points

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_point,
        p.latitude,
        p.longitude,
        p.surface,
        p.niveau,
        p.nameplace,
        e.name_entreprise,
        sp_latest.status AS dernier_status,
        sp_latest.daty AS date_dernier_status,
        sp_first.daty AS date_creation,
        -- calcul budget à la volée avec prix correspondant à la date de création
        p.surface * p.niveau * (
          SELECT prix
          FROM prix
          WHERE date <= sp_first.daty
          ORDER BY date DESC, id_prix DESC
          LIMIT 1
        ) AS budget
      FROM points p
      LEFT JOIN entreprise e ON e.id_entreprise = p.id_entreprise
      -- dernier status
      LEFT JOIN LATERAL (
          SELECT status, daty
          FROM status_point
          WHERE id_point = p.id_point
          ORDER BY daty DESC, id_status_point DESC
          LIMIT 1
      ) sp_latest ON true
      -- premier status pour date de création
      LEFT JOIN LATERAL (
          SELECT daty
          FROM status_point
          WHERE id_point = p.id_point
          ORDER BY daty ASC, id_status_point ASC
          LIMIT 1
      ) sp_first ON true
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
router.get("/images/:idPoint", async (req, res) => {
  try {
    const { idPoint } = req.params;

    const result = await pool.query(
      "SELECT base64 FROM image_point WHERE id_point = $1",
      [idPoint]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image non trouvée" });
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
