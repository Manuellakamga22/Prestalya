const router = require("express").Router();
const ctrl = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/:id/payer", auth, ctrl.payer);

module.exports = router;
