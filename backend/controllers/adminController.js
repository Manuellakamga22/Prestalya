const adminRepo = require("../repositories/adminRepository");
const userRepo = require("../repositories/userRepository");
const ai = require("../services/aiService");
const { sendMail } = require("../config/mailer");

const stats = async (req, res, next) => {
  try { res.json(await adminRepo.getStats()); } catch (err) { next(err); }
};

const users = async (req, res, next) => {
  try { res.json(await adminRepo.getAllUsers()); } catch (err) { next(err); }
};

const bookings = async (req, res, next) => {
  try { res.json(await adminRepo.getAllBookings()); } catch (err) { next(err); }
};

const providers = async (req, res, next) => {
  try { res.json(await adminRepo.getAllProviders()); } catch (err) { next(err); }
};

const revenus = async (req, res, next) => {
  try { res.json(await adminRepo.getRevenus()); } catch (err) { next(err); }
};

const updateCommission = async (req, res, next) => {
  try {
    await adminRepo.updateCommission(req.params.niveau, req.body.taux);
    res.json({ message: "Commission mise à jour." });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminRepo.deleteUser(req.params.id);
    res.json({ message: "Utilisateur supprimé." });
  } catch (err) { next(err); }
};

const inactiveClients = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    res.json(await adminRepo.getInactiveClients(days));
  } catch (err) { next(err); }
};

const relanceClient = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Client introuvable." });

    const inactifs = await adminRepo.getInactiveClients(0);
    const match = inactifs.find(c => c.id === user.id);
    const daysSince = match?.last_booking_at
      ? Math.floor((Date.now() - new Date(match.last_booking_at)) / 86400000)
      : null;

    const { subject, body } = await ai.generateRelanceEmail({
      prenom: user.prenom,
      lastService: match?.last_service || null,
      daysSince,
    });

    await sendMail({
      to: user.email,
      subject,
      html: `<div style="font-family:sans-serif;line-height:1.7;white-space:pre-line">${body}</div>`,
    });

    res.json({ message: "Relance envoyée.", subject, body });
  } catch (err) { next(err); }
};

module.exports = { stats, users, bookings, providers, revenus, updateCommission, deleteUser, inactiveClients, relanceClient };
