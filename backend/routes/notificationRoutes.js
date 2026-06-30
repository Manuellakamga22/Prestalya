const router = require("express").Router();
const auth   = require("../middleware/auth");
const repo   = require("../repositories/notificationRepository");

router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const [notifs, unread] = await Promise.all([
      repo.findByUser(req.user.id),
      repo.countUnread(req.user.id),
    ]);
    res.json({ notifs, unread });
  } catch (err) { next(err); }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const n = await repo.markRead(req.params.id, req.user.id);
    if (!n) return res.status(404).json({ message: "Introuvable." });
    res.json(n);
  } catch (err) { next(err); }
});

router.patch("/read-all", async (req, res, next) => {
  try {
    await repo.markAllRead(req.user.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await repo.deleteOne(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
