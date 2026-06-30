const router = require("express").Router();
const auth   = require("../middleware/auth");
const repo   = require("../repositories/favorisRepository");

// Toggle favori
router.post("/:provider_id", auth, async (req, res, next) => {
  try {
    res.json(await repo.toggle(req.user.id, req.params.provider_id));
  } catch (err) { next(err); }
});

// Mes favoris
router.get("/", auth, async (req, res, next) => {
  try {
    res.json(await repo.findByClient(req.user.id));
  } catch (err) { next(err); }
});

// IDs favoris (pour afficher les coeurs)
router.get("/ids", auth, async (req, res, next) => {
  try {
    res.json(await repo.getClientFavIds(req.user.id));
  } catch (err) { next(err); }
});

module.exports = router;
