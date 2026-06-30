const router = require("express").Router();
const auth   = require("../middleware/auth");
const repo   = require("../repositories/devisRepository");
const provRepo = require("../repositories/providerRepository");
const userRepo = require("../repositories/userRepository");
const notif  = require("../services/notificationService");
const { sendMail } = require("../config/mailer");
const tpl    = require("../config/emailTemplates");

// Client: créer un devis
router.post("/", auth, async (req, res, next) => {
  try {
    const { provider_id, service, description, date_souhaitee, message_client } = req.body;
    if (!provider_id || !service || !description)
      return res.status(400).json({ message: "provider_id, service et description requis." });
    const d = await repo.create({ client_id: req.user.id, provider_id, service, description, date_souhaitee, message_client });
    const prov = await provRepo.findById(provider_id);
    if (prov) await notif.push(prov.user_id, {
      type: "new_booking", title: "Nouvelle demande de devis",
      body: `${req.user.prenom} demande un devis pour : ${service}`,
      link: "/prestataire"
    });
    res.status(201).json(d);
  } catch (err) { next(err); }
});

// Client: mes devis
router.get("/mes-devis", auth, async (req, res, next) => {
  try {
    res.json(await repo.findByClient(req.user.id));
  } catch (err) { next(err); }
});

// Prestataire: devis reçus
router.get("/recus", auth, async (req, res, next) => {
  try {
    const prov = await provRepo.findByUserId(req.user.id);
    if (!prov) return res.json([]);
    res.json(await repo.findByProvider(prov.id));
  } catch (err) { next(err); }
});

// Prestataire: répondre à un devis
router.patch("/:id/repondre", auth, async (req, res, next) => {
  try {
    const { montant, message_provider } = req.body;
    if (!montant) return res.status(400).json({ message: "montant requis." });
    const d = await repo.respond(req.params.id, { montant, message_provider, status: "envoye" });
    await notif.push(d.client_id, {
      type: "booking_update", title: "Devis reçu !",
      body: `Votre devis pour ${d.service} a été chiffré à ${montant}€`,
      link: "/dashboard"
    });
    const client = await userRepo.findById(d.client_id).catch(() => null);
    if (client?.email) {
      sendMail({
        to: client.email,
        subject: `Votre devis pour ${d.service} est arrivé 📩`,
        html: tpl.devisRecu({ prenom: client.prenom, service: d.service, montant, message: message_provider }),
      }).catch(() => {});
    }
    res.json(d);
  } catch (err) { next(err); }
});

// Client: accepter ou refuser
router.patch("/:id/statut", auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["accepte","refuse"].includes(status))
      return res.status(400).json({ message: "status invalide." });
    const d = await repo.updateStatus(req.params.id, status);
    if (status === "accepte") {
      const prov = await provRepo.findById(d.provider_id).catch(() => null);
      if (prov) {
        const provUser = await userRepo.findById(prov.user_id).catch(() => null);
        const client   = await userRepo.findById(d.client_id).catch(() => null);
        if (provUser?.email) {
          sendMail({
            to: provUser.email,
            subject: "Votre devis a été accepté ! 🎉",
            html: tpl.devisAccepte({ prenomProvider: provUser.prenom, prenomClient: client?.prenom || "Le client", service: d.service, montant: d.montant }),
          }).catch(() => {});
        }
      }
    }
    res.json(d);
  } catch (err) { next(err); }
});

module.exports = router;
