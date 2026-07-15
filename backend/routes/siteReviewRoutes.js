const router = require("express").Router();
const auth = require("../middleware/auth");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const rules = [
  body("note").isInt({ min: 1, max: 5 }).withMessage("Note entre 1 et 5."),
  body("commentaire").isLength({ min: 5 }).withMessage("Commentaire trop court."),
];

// Poster un avis sur le site
router.post("/", auth, rules, validate, async (req, res, next) => {
  try {
    const { note, commentaire } = req.body;
    const id = uuidv4();
    await db.query(
      "INSERT INTO site_reviews (id, user_id, note, commentaire) VALUES (?,?,?,?)",
      [id, req.user.id, note, commentaire]
    );
    const [rows] = await db.query("SELECT * FROM site_reviews WHERE id = ?", [id]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// Récupérer les avis du site (public)
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT sr.id, sr.note, sr.commentaire, sr.created_at,
              CONCAT(u.prenom,' ',u.nom) AS auteur, u.photo_url
       FROM site_reviews sr JOIN users u ON u.id = sr.user_id
       ORDER BY sr.created_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Vérifier si l'utilisateur a déjà posté
router.get("/mine", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT id FROM site_reviews WHERE user_id = ?", [req.user.id]);
    res.json({ hasReviewed: rows.length > 0 });
  } catch (err) { next(err); }
});

module.exports = router;
