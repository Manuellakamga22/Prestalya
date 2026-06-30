const router  = require("express").Router();
const auth    = require("../middleware/auth");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const db      = require("../config/db");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `photo_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Format non autorisé. Images uniquement."));
  },
});

router.post("/photo", auth, upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier reçu." });
    const url = `/uploads/${req.file.filename}`;
    await db.query("UPDATE users SET photo_url = ? WHERE id = ?", [url, req.user.id]);
    await db.query("UPDATE providers SET photo_url = ? WHERE user_id = ?", [url, req.user.id]);
    res.json({ url });
  } catch (err) {
    console.error("PHOTO UPLOAD ERROR:", err);
    next(err);
  }
});

module.exports = router;
