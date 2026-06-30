const router = require("express").Router();
const auth = require("../middleware/auth");
const providerRepo = require("../repositories/providerRepository");
const dashRepo = require("../repositories/providerDashRepository");
const bookingRepo = require("../repositories/bookingRepository");
const upload = require("../middleware/upload");
const db = require("../config/db");

router.use(auth);

router.get("/stats", async (req, res, next) => {
  try {
    const profile = await providerRepo.findByUserId(req.user.id);
    if (!profile) return res.status(404).json({ message: "Profil prestataire introuvable." });
    const s = await dashRepo.getStats(profile.id);
    res.json({ ...s, provider_id: profile.id, photo_url: profile.photo_url || null });
  } catch (err) { next(err); }
});

router.get("/upcoming", async (req, res, next) => {
  try {
    const profile = await providerRepo.findByUserId(req.user.id);
    if (!profile) return res.status(404).json({ message: "Profil prestataire introuvable." });
    res.json(await dashRepo.getUpcoming(profile.id));
  } catch (err) { next(err); }
});

router.get("/bookings", async (req, res, next) => {
  try {
    const profile = await providerRepo.findByUserId(req.user.id);
    if (!profile) return res.status(404).json({ message: "Profil prestataire introuvable." });
    res.json(await bookingRepo.findByProvider(profile.id));
  } catch (err) { next(err); }
});

router.patch("/bookings/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["confirme", "annule", "termine"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Statut invalide." });
    const booking = await bookingRepo.updateStatus(req.params.id, status);
    res.json(booking);
  } catch (err) { next(err); }
});

router.patch("/disponibilite", async (req, res, next) => {
  try {
    const profile = await providerRepo.findByUserId(req.user.id);
    if (!profile) return res.status(404).json({ message: "Profil introuvable." });
    const updated = await providerRepo.update(profile.id, { available: req.body.available ? 1 : 0 });
    res.json(updated);
  } catch (err) { next(err); }
});

router.get("/profile", async (req, res, next) => {
  try {
    const profile = await providerRepo.findByUserId(req.user.id);
    res.json(profile || null);
  } catch (err) { next(err); }
});

router.post("/profile", async (req, res, next) => {
  try {
    const existing = await providerRepo.findByUserId(req.user.id);
    if (existing) {
      const updated = await providerRepo.update(existing.id, req.body);
      return res.json(updated);
    }
    const created = await providerRepo.create({ user_id: req.user.id, ...req.body });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.post("/photo", upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé." });
    const url = `/uploads/${req.file.filename}`;
    const profile = await providerRepo.findByUserId(req.user.id);
    if (profile) {
      await providerRepo.update(profile.id, { photo_url: url });
    }
    await db.query("UPDATE users SET photo_url = ? WHERE id = ?", [url, req.user.id]);
    res.json({ url });
  } catch (err) { next(err); }
});

module.exports = router;
