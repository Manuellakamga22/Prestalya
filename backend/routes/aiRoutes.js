const router = require("express").Router();
const auth   = require("../middleware/auth");
const ai     = require("../services/aiService");

// ── Assistant chat (public) ──
router.post("/chat", async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ message: "messages requis." });
    const result = await ai.chat(messages);
    res.json(result);
  } catch (err) { next(err); }
});

// ── Generate provider bio ──
router.post("/generate-bio", auth, async (req, res, next) => {
  try {
    const { service, city, experience, disponibilite, prenom } = req.body;
    if (!service) return res.status(400).json({ message: "service requis." });
    const bio = await ai.generateBio({ service, city, experience, disponibilite, prenom });
    res.json({ bio });
  } catch (err) { next(err); }
});

// ── Admin insights ──
router.post("/insights", auth, async (req, res, next) => {
  try {
    const insights = await ai.generateInsights(req.body);
    res.json(insights);
  } catch (err) { next(err); }
});

// ── Detect service from free text ──
router.post("/detect-service", async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: "description requise." });
    const result = await ai.detectService(description);
    res.json(result);
  } catch (err) { next(err); }
});

// ── AI Matching ──
router.post("/match", async (req, res, next) => {
  try {
    const { description, providers } = req.body;
    if (!description || !Array.isArray(providers))
      return res.status(400).json({ message: "description et providers requis." });
    res.json(await ai.matchProviders(description, providers));
  } catch (err) { next(err); }
});

// ── Rapport mensuel prestataire ──
router.post("/rapport-mensuel", auth, async (req, res, next) => {
  try {
    const rapport = await ai.generateRapportMensuel(req.body);
    res.json({ rapport });
  } catch (err) { next(err); }
});

// ── Chatbot pré-réservation ──
router.post("/prebooking", async (req, res, next) => {
  try {
    const { messages, service } = req.body;
    if (!Array.isArray(messages) || !service)
      return res.status(400).json({ message: "messages et service requis." });
    res.json(await ai.prebookingChat(messages, service));
  } catch (err) { next(err); }
});

// ── Auto-complétion expérience (formulaire candidature) ──
router.post("/expand-experience", async (req, res, next) => {
  try {
    const { keywords, service } = req.body;
    if (!keywords) return res.status(400).json({ message: "keywords requis." });
    const text = await ai.expandExperience(keywords, service);
    res.json({ text });
  } catch (err) { next(err); }
});

// ── FAQ dynamique (public) ──
router.post("/faq", async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "question requise." });
    const answer = await ai.answerFAQ(question);
    res.json({ answer });
  } catch (err) { next(err); }
});

module.exports = router;
