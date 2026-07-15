const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.CLIENT_URL || "http://localhost:5173";
    if (!origin || origin === allowed || origin.endsWith(".vercel.app") || origin === "http://localhost:5173") {
      callback(null, true);
    } else {
      callback(new Error("CORS non autorisé"));
    }
  },
  credentials: true,
}));
app.use(morgan("dev"));

// Webhook Stripe : body brut requis pour la vérification de signature, AVANT express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), require("./controllers/paymentController").webhook);

app.use(express.json());
app.use("/api", apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/providers",     require("./routes/providerRoutes"));
app.use("/api/bookings",      require("./routes/bookingRoutes"));
app.use("/api/chat",          require("./routes/chatRoutes"));
app.use("/api/reviews",       require("./routes/reviewRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));
app.use("/api/upload",        require("./routes/uploadRoutes"));
app.use("/api/contact",       require("./routes/contactRoutes"));
app.use("/api/provider-dash", require("./routes/providerDashRoutes"));
app.use("/api/commissions",     require("./routes/commissionRoutes"));
app.use("/api/notifications",   require("./routes/notificationRoutes"));
app.use("/api/documents",       require("./routes/documentRoutes"));
app.use("/api/ai",              require("./routes/aiRoutes"));
app.use("/api/users",           require("./routes/userRoutes"));
app.use("/api/devis",          require("./routes/devisRoutes"));
app.use("/api/favoris",        require("./routes/favorisRoutes"));
app.use("/api/disponibilites", require("./routes/disponibiliteRoutes"));
app.use("/api/parrainage",     require("./routes/parrainageRoutes"));
app.use("/api/factures",       require("./routes/factureRoutes"));
app.use("/api/payments",       require("./routes/paymentRoutes"));
app.use("/api/site-reviews",   require("./routes/siteReviewRoutes"));
app.use("/uploads/documents", require("express").static(require("path").join(__dirname, "uploads/documents")));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.use(errorHandler);

module.exports = app;
