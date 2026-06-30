const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const DOCS_DIR    = path.join(__dirname, "../uploads/documents");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DOCS_DIR))    fs.mkdirSync(DOCS_DIR,    { recursive: true });

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOCS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const photoFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Format non autorisé. JPG, PNG ou WEBP uniquement."), false);
};

const docFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Format non autorisé. JPG, PNG, WEBP ou PDF uniquement."), false);
};

const photoUpload = multer({ storage: photoStorage, fileFilter: photoFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const docUpload   = multer({ storage: docStorage,   fileFilter: docFilter,   limits: { fileSize: 10 * 1024 * 1024 } });

// default export = photo upload (backward compat), named export for docs
module.exports = photoUpload;
module.exports.doc = docUpload;
