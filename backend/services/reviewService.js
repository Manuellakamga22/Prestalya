const reviewRepo = require("../repositories/reviewRepository");
const bookingRepo = require("../repositories/bookingRepository");
const providerRepo = require("../repositories/providerRepository");
const notifService = require("./notificationService");

const leave = async (client_id, { booking_id, note, commentaire }) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });
  if (booking.client_id !== client_id) throw Object.assign(new Error("Non autorisé."), { status: 403 });
  if (booking.status !== "termine") throw Object.assign(new Error("La prestation doit être terminée pour laisser un avis."), { status: 400 });

  const existing = await reviewRepo.findByBooking(booking_id);
  if (existing) throw Object.assign(new Error("Avis déjà déposé pour cette réservation."), { status: 409 });

  const review = await reviewRepo.create({
    booking_id,
    client_id,
    provider_id: booking.provider_id,
    note,
    commentaire,
  });

  // notify provider
  const provider = await providerRepo.findById(booking.provider_id).catch(() => null);
  if (provider?.user_id) {
    notifService.push(provider.user_id, {
      type:  "new_review",
      title: "Nouvel avis reçu",
      body:  `Un client vous a laissé une note de ${note}/5.${commentaire ? ` "${commentaire.slice(0,50)}…"` : ""}`,
      link:  "/prestataire",
    }).catch(() => {});
  }

  return review;
};

const getByProvider = async (provider_id) => {
  const provider = await providerRepo.findById(provider_id);
  if (!provider) throw Object.assign(new Error("Prestataire introuvable."), { status: 404 });
  return reviewRepo.findByProvider(provider_id);
};

module.exports = { leave, getByProvider };
