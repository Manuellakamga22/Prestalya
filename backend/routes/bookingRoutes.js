const router = require("express").Router();
const ctrl = require("../controllers/bookingController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { body } = require("express-validator");

const createRules = [
  body("service").notEmpty().withMessage("Service requis."),
  body("date").isDate().withMessage("Date invalide."),
];

router.post("/",              auth, createRules, validate, ctrl.create);
router.get("/me",             auth, ctrl.myBookings);
router.get("/open",           auth, ctrl.getOpenBookings);
router.post("/:id/accepter",            auth, ctrl.acceptOpenBooking);
router.post("/:id/accepter-demande",    auth, ctrl.acceptBooking);
router.post("/:id/refuser",             auth, ctrl.refuseBooking);
router.post("/:id/proposer",            auth, ctrl.proposeAlternative);
router.post("/:id/repondre-proposition",auth, ctrl.respondProposal);
router.post("/:id/confirmer",           auth, ctrl.confirmBooking);
router.patch("/:id/status",             auth, ctrl.updateStatus);

module.exports = router;
