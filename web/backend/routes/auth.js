const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user (managers)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *       '401':
 *         description: Unauthorized
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(`
      SELECT u.*, t.name_type
      FROM users u
      JOIN type_account t ON t.id_type_account = u.id_type_account
      WHERE u.email = $1 AND u.password = $2
    `, [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];

    if (user.name_type !== "manager") {
      return res.status(403).json({ error: "Accès réservé aux managers" });
    }

    res.json({ message: "Connexion réussie", user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               id_type_account:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Registration successful
 *       '400':
 *         description: Bad request or email already used
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, id_type_account } = req.body;

    if (!username || !email || !password || !id_type_account) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // Vérifier si email existe déjà
    const check = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    
    if (check.rows.length > 0) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }
    
    // insertion
    await pool.query(
      `INSERT INTO users (username, email, password, id_type_account)
       VALUES ($1, $2, $3, $4)`,
      [username, email, password, parseInt(id_type_account)]
    );

    res.json({ message: "Inscription réussie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
module.exports = router;
