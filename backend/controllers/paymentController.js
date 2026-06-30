const bookingService = require("../services/bookingService");
const paymentService = require("../services/paymentService");

const payer = async (req, res, next) => {
  try {
    const result = await bookingService.payerBooking(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
};

// Webhook Stripe — body brut requis pour la vérification de signature
const webhook = async (req, res) => {
  let event;
  try {
    event = paymentService.constructWebhookEvent(req.body, req.headers["stripe-signature"]);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await bookingService.handlePaymentSuccess(session).catch(() => {});
  }

  res.json({ received: true });
};

module.exports = { payer, webhook };
