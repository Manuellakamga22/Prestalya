const router = require("express").Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { body } = require("express-validator");

const registerRules = [
  body("prenom").notEmpty().withMessage("Prénom requis."),
  body("nom").notEmpty().withMessage("Nom requis."),
  body("email").isEmail().withMessage("Email invalide."),
  body("password").isLength({ min: 6 }).withMessage("Mot de passe minimum 6 caractères."),
];

const loginRules = [
  body("email").isEmail().withMessage("Email invalide."),
  body("password").notEmpty().withMessage("Mot de passe requis."),
];

const resetRules = [
  body("token").notEmpty().withMessage("Token requis."),
  body("password").isLength({ min: 6 }).withMessage("Mot de passe minimum 6 caractères."),
];

router.post("/register",        authLimiter, registerRules, validate, ctrl.register);
router.post("/login",           authLimiter, loginRules,    validate, ctrl.login);
router.post("/forgot-password", authLimiter, ctrl.forgotPassword);
router.post("/reset-password",  resetRules,  validate,      ctrl.resetPassword);
router.get("/me",               auth,                       ctrl.me);

module.exports = router;
