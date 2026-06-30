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
    if (!result) return res.status(400).json({ message: "Code invalide." });
    if (result.alreadyUsed) return res.status(409).json({ message: "Vous avez déjà utilisé un code de parrainage." });
    res.json({ message: "Code appliqué ! Votre parrain reçoit 10€ de crédit.", credit: result.credit });
  } catch (err) { next(err); }
});

module.exports = router;
