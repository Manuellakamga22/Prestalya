const router = require("express").Router();
const ctrl = require("../controllers/commissionController");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/",         ctrl.getTaux);
router.put("/",         auth, adminOnly, ctrl.updateTaux);
router.post("/simuler", auth, ctrl.simuler);

module.exports = router;
