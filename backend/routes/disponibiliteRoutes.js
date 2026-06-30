const router  = require("express").Router();
const auth    = require("../middleware/auth");
const repo    = require("../repositories/disponibiliteRepository");
const provRepo = require("../repositories/providerRepository");

// GET créneaux bloqués d'un prestataire (public) → { "2026-08-05": ["09h00","10h00"] }
router.get("/:provider_id", async (req, res, next) => {
  try {
    res.json(await repo.findByProvider(req.params.provider_id));
  } catch (err) { next(err); }
});

// Toggle un créneau précis
router.post("/toggle", auth, async (req, res, next) => {
  try {
    const { date_off, slot } = req.body;
    if (!date_off || !slot) return res.status(400).json({ message: "date_off et slot requis." });
    const prov = await provRepo.findByUserId(req.user.id);
    if (!prov) return res.status(404).json({ message: "Profil prestataire introuvable." });
    res.json(await repo.toggleSlot(prov.id, date_off, slot));
  } catch (err) { next(err); }
});

module.exports = router;
