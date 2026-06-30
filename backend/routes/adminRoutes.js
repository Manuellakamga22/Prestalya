const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.use(auth, adminOnly);

router.get("/stats",                    ctrl.stats);
router.get("/users",                    ctrl.users);
router.get("/bookings",                 ctrl.bookings);
router.get("/providers",                ctrl.providers);
router.get("/revenus",                  ctrl.revenus);
router.patch("/commissions/:niveau",    ctrl.updateCommission);
router.delete("/users/:id",             ctrl.deleteUser);
router.get("/inactive-clients",         ctrl.inactiveClients);
router.post("/relance/:id",             ctrl.relanceClient);

module.exports = router;
