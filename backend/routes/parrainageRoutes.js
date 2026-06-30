const router = require("express").Router();
const auth   = require("../middleware/auth");
const repo   = require("../repositories/parrainageRepository");

// Mon code parrainage
router.get("/mon-code", auth, async (req, res, next) => {
  try {
    const code = await repo.getOrCreateCode(req.user.id);
    res.json({ code });
  } catch (err) { next(err); }
});

// Mes récompenses
router.get("/recompenses", auth, async (req, res, next) => {
  try {
    const [rewards, credit] = await Promise.all([
      repo.getRewards(req.user.id),
      repo.getTotalCredit(req.user.id),
    ]);
    res.json({ rewards, credit });
  } catch (err) { next(err); }
});

// Appliquer un code (à l'inscription)
router.post("/appliquer", auth, async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "code requis." });
    const result = await repo.applyReferral(req.user.id, code);
    if (!result) return res.status(400).json({ message: "Code invalide ou déjà utilisé." });
    res.json({ message: "Code appliqué ! Vous et votre parrain recevez 10€ de crédit.", credit: result.credit });
  } catch (err) { next(err); }
});

module.exports = router;
