const router = require("express").Router();
const ctrl = require("../controllers/reviewController");
const auth = require("../middleware/auth");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

const rules = [
  body("booking_id").notEmpty().withMessage("booking_id requis."),
  body("note").isInt({ min: 1, max: 5 }).withMessage("Note entre 1 et 5."),
];

router.post("/",              auth, rules, validate, ctrl.leave);
router.get("/mine",           auth, ctrl.getMine);
router.get("/provider/:id",   ctrl.getByProvider);

module.exports = router;
