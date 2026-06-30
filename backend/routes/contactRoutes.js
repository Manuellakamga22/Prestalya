const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { apiLimiter } = require("../middleware/rateLimiter");
const { sendMail } = require("../config/mailer");
const { contactConfirmation } = require("../config/emailTemplates");

const rules = [
  body("email").isEmail().withMessage("Email invalide."),
  body("message").isLength({ min: 10 }).withMessage("Message trop court."),
];

router.post("/", apiLimiter, rules, validate, async (req, res, next) => {
  try {
    const { name, prenom, nom, email, subject, sujet, message } = req.body;
    const displayName = name || `${prenom || ""} ${nom || ""}`.trim() || "Inconnu";
    const displaySubject = subject || sujet || "Sans sujet";

    await sendMail({
      to: process.env.MAIL_USER,
      subject: `[Contact] ${displaySubject}`,
      html: `<p><strong>${displayName}</strong> (${email})</p><p>${message}</p>`,
    });

    sendMail({
      to: email,
      subject: "Nous avons bien reçu votre message",
      html: contactConfirmation({ prenom: displayName, sujet: displaySubject }),
    }).catch(() => {});

    res.json({ message: "Message envoyé avec succès." });
  } catch (err) { next(err); }
});

module.exports = router;
