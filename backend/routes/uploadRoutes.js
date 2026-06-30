const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const db = require("../config/db");
const path = require("path");

router.post("/photo", auth, upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé." });
    const url = `/uploads/${req.file.filename}`;
    await db.query("UPDATE users SET photo_url = ? WHERE id = ?", [url, req.user.id]);
    res.json({ url });
  } catch (err) { next(err); }
});

module.exports = router;
