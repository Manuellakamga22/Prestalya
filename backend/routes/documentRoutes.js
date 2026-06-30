const router  = require("express").Router();
const auth     = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const upload   = require("../middleware/upload").doc;
const docRepo  = require("../repositories/documentRepository");
const notifSvc = require("../services/notificationService");
const userRepo = require("../repositories/userRepository");
const { sendMail } = require("../config/mailer");
const tpl      = require("../config/emailTemplates");
const path     = require("path");
const fs       = require("fs");

// ensure upload dir exists
const DOC_DIR = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(DOC_DIR)) fs.mkdirSync(DOC_DIR, { recursive: true });

const uploadDoc = upload.single("file");

// ── Prestataire : upload a document ──
router.post("/", auth, (req, res, next) => {
  uploadDoc(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "Aucun fichier reçu." });
    try {
      const { type, label } = req.body;
      if (!type || !label) return res.status(400).json({ message: "type et label requis." });
      const doc = await docRepo.create({
        user_id:       req.user.id,
        type,
        label,
        filename:      req.file.filename,
        original_name: req.file.originalname,
      });
      res.status(201).json(doc);
    } catch (e) { next(e); }
  });
});

// ── Prestataire : get my documents ──
router.get("/me", auth, async (req, res, next) => {
  try {
    const docs = await docRepo.findByUser(req.user.id);
    res.json(docs);
  } catch (e) { next(e); }
});

// ── Prestataire : mark profile as submitted ──
router.post("/submit", auth, async (req, res, next) => {
  try {
    await docRepo.markSubmitted(req.user.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ── Admin : list all documents ──
router.get("/", auth, adminOnly, async (req, res, next) => {
  try {
    const docs = await docRepo.findAll(req.query.status || null);
    res.json(docs);
  } catch (e) { next(e); }
});

// ── Admin : validate or reject a document ──
router.patch("/:id/status", auth, adminOnly, async (req, res, next) => {
  try {
    const { status, reject_reason } = req.body;
    if (!["valide", "rejete"].includes(status))
      return res.status(400).json({ message: "Statut invalide." });
    const doc = await docRepo.updateStatus(req.params.id, status, reject_reason || null);

    // if all docs validated → mark provider as verified
    if (status === "valide") {
      const allDocs = await docRepo.findByUser(doc.user_id);
      const required = ["identite", "casier"];
      const allOk = required.every(t => allDocs.some(d => d.type === t && d.status === "valide"));
      if (allOk) {
        await docRepo.setVerified(doc.user_id, true);
        const u = await userRepo.findById(doc.user_id).catch(() => null);
        if (u?.email) sendMail({ to: u.email, subject: "Profil vérifié ✅ — Prestalya", html: tpl.documentsValides({ prenom: u.prenom }) }).catch(() => {});
        notifSvc.push(doc.user_id, {
          type:  "booking_confirmed",
          title: "Profil vérifié ✓",
          body:  "Félicitations ! Votre profil prestataire a été vérifié. Le badge ✓ est maintenant visible.",
          link:  "/prestataire",
        }).catch(() => {});
      }
    }

    // if rejected → notify provider
    if (status === "rejete") {
      notifSvc.push(doc.user_id, {
        type:  "booking_cancelled",
        title: "Document refusé",
        body:  `Votre document "${doc.label}" a été refusé.${reject_reason ? ` Motif : ${reject_reason}` : ""}`,
        link:  "/completer-profil",
      }).catch(() => {});
      await docRepo.setVerified(doc.user_id, false);
    }

    res.json(doc);
  } catch (e) { next(e); }
});

// ── Serve document files (admin only) ──
router.get("/file/:filename", auth, adminOnly, (req, res) => {
  const file = path.join(DOC_DIR, req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).json({ message: "Fichier introuvable." });
  res.sendFile(file);
});

module.exports = router;
