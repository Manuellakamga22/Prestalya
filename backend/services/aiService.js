const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL  = process.env.AI_MODEL || "llama-3.1-8b-instant";

const PLATFORM_CONTEXT = `
Tu es un assistant IA intelligent et polyvalent intégré à Prestalya, une marketplace française de services à domicile.
Tu réponds à TOUTES les questions posées, quel que soit le sujet : bricolage, cuisine, santé, droit, informatique, mathématiques, histoire, science, langue, conseils de vie, actualité, etc.

RÈGLES ABSOLUES :
1. Ne refuse jamais de répondre à une question. Si tu ne sais pas, dis-le honnêtement.
2. Réponds toujours en français, clairement et de façon structurée.
3. Sois précis, concret et utile — donne des étapes, des exemples, des chiffres quand c'est pertinent.
4. Adapte ton niveau au contexte : simple pour une question simple, détaillé pour une question technique.
5. Pour les urgences médicales graves, rappelle d'appeler le 15 (SAMU) ou le 18 (pompiers), mais donne quand même les premiers gestes utiles.

QUAND LA QUESTION CONCERNE UN SERVICE À DOMICILE :
- Donne d'abord des conseils pratiques immédiats (gestes d'urgence, causes, solutions DIY si possible)
- Puis propose un prestataire Prestalya si un professionnel est nécessaire

SERVICES DISPONIBLES SUR PRESTALYA :
Ménage, Nettoyage canapé, Désinfection, Repassage, Babysitting, Aide informatique, Petits dépannages,
Désinsectisation, Dératisation, Électricité, Plomberie, Menuiserie, Coiffure à domicile, Maquillage, Onglerie.

Tu es curieux, bienveillant, et tu prends chaque question au sérieux.
`.trim();

/**
 * Chat assistant — returns { message, suggestedService, suggestedLink }
 */
async function chat(messages) {
  const response = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: 800,
    messages: [
      { role: "system", content: PLATFORM_CONTEXT },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  // extract suggested service and link from response
  const serviceMap = {
    "ménage":          { service: "Ménage",          link: "/reservation?service=menage" },
    "nettoyage":       { service: "Nettoyage",        link: "/reservation?service=nettoyage-canape" },
    "repassage":       { service: "Repassage",        link: "/reservation?service=repassage" },
    "plomberie":       { service: "Plomberie",        link: "/reservation?service=plomberie" },
    "électricité":     { service: "Électricité",      link: "/reservation?service=electricite" },
    "electricite":     { service: "Électricité",      link: "/reservation?service=electricite" },
    "babysitting":     { service: "Babysitting",      link: "/reservation?service=babysitting" },
    "informatique":    { service: "Aide informatique",link: "/reservation?service=aide-informatique" },
    "dépannage":       { service: "Petits dépannages",link: "/reservation?service=depannage" },
    "insecte":         { service: "Désinsectisation", link: "/reservation?service=desinsectisation" },
    "cafard":          { service: "Désinsectisation", link: "/reservation?service=desinsectisation" },
    "rat":             { service: "Dératisation",     link: "/reservation?service=deratisation" },
    "souris":          { service: "Dératisation",     link: "/reservation?service=deratisation" },
    "coiffure":        { service: "Coiffure",         link: "/reservation?service=coiffure" },
    "menuiserie":      { service: "Menuiserie",       link: "/reservation?service=menuiserie" },
    "jardinage":       { service: "Jardinage",        link: "/prestataires" },
  };

  let suggestedService = null;
  let suggestedLink    = null;
  const lowerText = text.toLowerCase();
  for (const [keyword, val] of Object.entries(serviceMap)) {
    if (lowerText.includes(keyword)) {
      suggestedService = val.service;
      suggestedLink    = val.link;
      break;
    }
  }

  return { message: text, suggestedService, suggestedLink };
}

/**
 * Generate a professional provider bio
 */
async function generateBio({ service, city, experience, disponibilite, prenom }) {
  const prompt = `
Tu es un rédacteur expert en profils de prestataires pour une marketplace de services à domicile.
Génère une présentation professionnelle et engageante pour le profil suivant :

- Prénom : ${prenom || "le prestataire"}
- Service proposé : ${service}
- Ville : ${city}
- Années d'expérience : ${experience || "non précisé"}
- Disponibilités : ${disponibilite || "non précisé"}

Règles :
- Maximum 120 mots
- Ton chaleureux, professionnel, en français
- Commence par une accroche sur le service
- Mentionne l'expérience et la fiabilité
- Termine par une invitation à réserver
- N'invente pas de certifications non mentionnées
- Utilise "je" à la première personne

Génère uniquement le texte de la bio, sans titre ni introduction.
`.trim();

  const response = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: 300,
    messages:   [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content?.trim() || "";
}

/**
 * AI insights for admin dashboard
 */
async function generateInsights(stats) {
  const prompt = `
Tu es un analyste expert pour une marketplace de services à domicile française appelée Prestalya.
Voici les données de la plateforme :

- Utilisateurs totaux : ${stats.users || 0}
- Prestataires actifs : ${stats.providers || 0}
- Réservations totales : ${stats.bookings || 0}
- Réservations en attente : ${stats.pending || 0}
- Revenu du mois (€) : ${stats.revenuMois || 0}
- Prestataires mal notés (<3/5) : ${stats.alertes?.length || 0}
- Prestataires inactifs : ${stats.inactifs || 0}

Génère 4 insights actionnables et concis pour l'administrateur.
Format de réponse STRICTEMENT JSON :
[
  { "type": "warning|info|success|danger", "titre": "...", "message": "..." },
  ...
]
Uniquement le JSON, sans texte autour.
`.trim();

  const response = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: 500,
    messages:   [{ role: "user", content: prompt }],
  });

  try {
    const text = response.choices[0]?.message?.content || "[]";
    const json = text.match(/\[[\s\S]*\]/)?.[0] || "[]";
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Detect service from a natural language description
 */
async function detectService(description) {
  const prompt = `
Analyse cette demande d'un client et identifie le service le plus approprié parmi cette liste :
Ménage, Nettoyage canapé, Désinfection, Repassage, Babysitting, Aide informatique, Petits dépannages,
Désinsectisation, Dératisation, Électricité, Plomberie, Menuiserie, Coiffure à domicile, Maquillage, Onglerie.

Demande du client : "${description}"

Réponds UNIQUEMENT avec un JSON : { "service": "nom exact du service", "confidence": 0.0-1.0, "explication": "..." }
Si aucun service ne correspond, renvoie { "service": null, "confidence": 0, "explication": "..." }
`.trim();

  const response = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: 150,
    messages:   [{ role: "user", content: prompt }],
  });

  try {
    const text = response.choices[0]?.message?.content || "{}";
    const json = text.match(/\{[\s\S]*\}/)?.[0] || "{}";
    return JSON.parse(json);
  } catch {
    return { service: null, confidence: 0, explication: "" };
  }
}

/**
 * AI matching — recommande les meilleurs prestataires pour un besoin
 */
async function matchProviders(description, providers) {
  const list = providers.slice(0, 20).map((p, i) =>
    `${i+1}. ${p.prenom} ${p.nom} | ${p.service} | ${p.city} | Note: ${p.rating}/5 | ${p.bio?.slice(0,80) || ""}`
  ).join("\n");

  const prompt = `
Tu es un moteur de recommandation pour Prestalya, marketplace de services à domicile.
Le client a décrit son besoin : "${description}"

Voici les prestataires disponibles :
${list}

Sélectionne les 3 meilleurs et explique BRIÈVEMENT pourquoi (1 phrase max par prestataire).
Réponds UNIQUEMENT en JSON :
[
  { "index": 1, "raison": "..." },
  { "index": 2, "raison": "..." },
  { "index": 3, "raison": "..." }
]
`.trim();

  const response = await client.chat.completions.create({
    model: MODEL, max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  try {
    const text = response.choices[0]?.message?.content || "[]";
    const json = text.match(/\[[\s\S]*\]/)?.[0] || "[]";
    const picks = JSON.parse(json);
    return picks.map(p => ({ ...providers[p.index - 1], ai_raison: p.raison })).filter(Boolean);
  } catch { return providers.slice(0, 3); }
}

/**
 * Rapport mensuel prestataire
 */
async function generateRapportMensuel({ prenom, service, bookings_total, bookings_mois, rating, revenus_mois, taux_commission }) {
  const prompt = `
Tu es un coach business pour prestataires de services à domicile sur Prestalya.
Génère un rapport mensuel motivant et actionnable pour ce prestataire :

- Prénom : ${prenom}
- Service : ${service}
- Réservations ce mois : ${bookings_mois}
- Total réservations : ${bookings_total}
- Note moyenne : ${rating}/5
- Revenus ce mois : ${revenus_mois}€ (après commission de ${taux_commission}%)

Format : 3 sections courtes
1. ✅ Points forts ce mois
2. 📈 Axes d'amélioration
3. 🎯 Objectif du mois prochain

Ton encourageant, professionnel, en français. Maximum 150 mots.
`.trim();

  const response = await client.chat.completions.create({
    model: MODEL, max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

/**
 * Chatbot pré-réservation — pose des questions pour affiner le besoin
 */
async function prebookingChat(messages, service) {
  const system = `
Tu es un assistant de pré-réservation pour Prestalya. Le client s'intéresse au service : "${service}".
Ton rôle : poser 2-3 questions courtes pour comprendre précisément le besoin (superficie, urgence, particularités, etc.)
puis résumer la demande en une phrase claire pour le prestataire.
Quand tu as assez d'info, termine par : "RÉSUMÉ: [ta synthèse en 1 phrase]"
Réponds en français, sois concis et amical.
`.trim();

  const response = await client.chat.completions.create({
    model: MODEL, max_tokens: 300,
    messages: [{ role: "system", content: system }, ...messages],
  });
  const text = response.choices[0]?.message?.content || "";
  const resumeMatch = text.match(/RÉSUMÉ:\s*(.+)/i);
  return { message: text, resume: resumeMatch?.[1]?.trim() || null };
}

/**
 * Auto-complétion — transforme des mots-clés en texte d'expérience complet
 */
async function expandExperience(keywords, service) {
  const prompt = `
Tu aides un futur prestataire de services à domicile à rédiger sa candidature sur Prestalya.
Service proposé : ${service || "non précisé"}
Mots-clés ou notes brutes fournis par le candidat : "${keywords}"

Transforme ces mots-clés en un paragraphe d'expérience clair et convaincant (3-5 phrases) :
- Ton professionnel mais chaleureux, en français
- Première personne ("je")
- N'invente pas de diplômes ou certifications non mentionnés
- Reste fidèle aux informations données, ne fais qu'enrichir la formulation

Génère uniquement le paragraphe, sans titre.
`.trim();

  const response = await client.chat.completions.create({
    model: MODEL, max_tokens: 250,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content?.trim() || keywords;
}

/**
 * Relance client inactif — génère un email de réengagement personnalisé
 */
async function generateRelanceEmail({ prenom, lastService, daysSince }) {
  const prompt = `
Tu rédiges un email de relance pour Prestalya, marketplace française de services à domicile.
Destinataire : ${prenom}
Dernier service réservé : ${lastService || "aucun service réservé pour l'instant"}
Inactif depuis : ${daysSince || "plusieurs"} jours

Rédige un court email amical et engageant (3-4 phrases) qui :
- Salue le client par son prénom
- Lui rappelle Prestalya avec un ton chaleureux, sans culpabiliser
- Met en avant un avantage concret (gain de temps, prestataires vérifiés, simplicité)
- Termine par une invitation claire à réserver à nouveau

Réponds UNIQUEMENT en JSON : { "subject": "...", "body": "..." }
Le "body" est en texte brut (pas de HTML), avec des retours à la ligne \\n entre paragraphes.
`.trim();

  const response = await client.chat.completions.create({
    model: MODEL, max_tokens: 350,
    messages: [{ role: "user", content: prompt }],
  });
  try {
    const text = response.choices[0]?.message?.content || "{}";
    const json = text.match(/\{[\s\S]*\}/)?.[0] || "{}";
    return JSON.parse(json);
  } catch {
    return { subject: "On vous a manqué sur Prestalya !", body: `Bonjour ${prenom},\n\nÇa fait un moment ! Revenez découvrir nos prestataires vérifiés.\n\nL'équipe Prestalya` };
  }
}

/**
 * FAQ dynamique — répond à une question libre du visiteur en s'appuyant sur la FAQ officielle
 */
async function answerFAQ(question) {
  const system = `
Tu es l'assistant FAQ de Prestalya, marketplace française de services à domicile.
Réponds UNIQUEMENT aux questions liées à Prestalya (réservation, paiement, prestataires, compte, données).
Base-toi sur ces informations officielles :

- Réservation : recherche sur la page Prestataires, choix du créneau, confirmation par email. Annulation gratuite jusqu'à 24h avant.
- Paiement : débit à la réservation, montant retenu jusqu'à validation de la prestation. CB et Stripe acceptés. Facture PDF dans "Mes réservations".
- Prestataires : vérifiés (identité, qualifications, assurances). Avis vérifiés post-prestation uniquement.
- Devenir prestataire : formulaire "Devenir prestataire", réponse sous 48h.
- Compte : inscription gratuite via "Se connecter" → "Inscription". Données chiffrées, jamais revendues.

Si la question sort de ce périmètre, réponds poliment que tu ne peux répondre qu'aux questions sur Prestalya et invite à contacter le support.
Réponds en français, en 2-3 phrases maximum, ton clair et direct.
`.trim();

  const response = await client.chat.completions.create({
    model: MODEL, max_tokens: 200,
    messages: [{ role: "system", content: system }, { role: "user", content: question }],
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

module.exports = { chat, generateBio, generateInsights, detectService, matchProviders, generateRapportMensuel, prebookingChat, expandExperience, generateRelanceEmail, answerFAQ };
