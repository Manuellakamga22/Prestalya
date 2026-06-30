const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Crée une session de paiement Stripe Checkout pour une réservation
// montantAPayer : montant réellement à régler par carte (après déduction du crédit parrainage)
// rewardIdsConsumed : ids des récompenses de parrainage à marquer comme utilisées une fois le paiement confirmé
const createCheckoutSession = async (booking, montantAPayer, rewardIdsConsumed = []) => {
  const amountCents = Math.round(montantAPayer * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: undefined,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Prestation Prestalya — ${booking.service}`,
            description: `Réservation du ${new Date(booking.date).toLocaleDateString("fr-FR")} à ${booking.slot || ""}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: { booking_id: booking.id, reward_ids: rewardIdsConsumed.join(",") },
    success_url: `${CLIENT_URL}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/paiement/annule?booking_id=${booking.id}`,
  });

  return session;
};

const constructWebhookEvent = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

const retrieveSession = async (sessionId) => {
  return stripe.checkout.sessions.retrieve(sessionId);
};

const refundPayment = async (paymentIntentId) => {
  return stripe.refunds.create({ payment_intent: paymentIntentId });
};

module.exports = { createCheckoutSession, constructWebhookEvent, retrieveSession, refundPayment };
