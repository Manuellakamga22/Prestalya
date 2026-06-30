import { useState } from "react";
import { api } from "../api";
import SEO from "../components/SEO";
import "../styles/pages.css";

const faqs = [
  {
    cat: "Réservation",
    items: [
      { q: "Comment réserver un prestataire ?", a: "Recherchez un service depuis la page Prestataires, consultez les profils et cliquez sur « Réserver ». Choisissez une date, un créneau et confirmez. Vous recevrez une confirmation par email." },
      { q: "Puis-je annuler ou modifier ma réservation ?", a: "Oui, vous pouvez annuler jusqu'à 24h avant la prestation sans frais depuis votre espace personnel. Au-delà, des frais d'annulation peuvent s'appliquer selon les conditions du prestataire." },
      { q: "Que se passe-t-il si le prestataire annule ?", a: "En cas d'annulation de la part du prestataire, vous êtes remboursé intégralement et nous vous proposons des alternatives disponibles dans les plus brefs délais." },
    ],
  },
  {
    cat: "Paiement",
    items: [
      { q: "Quand suis-je débité ?", a: "Le paiement est débité au moment de la réservation, mais le montant est retenu et n'est transféré au prestataire qu'après la réalisation et votre validation de la prestation." },
      { q: "Quels moyens de paiement sont acceptés ?", a: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) et les paiements via Stripe. Les virements bancaires sont disponibles pour les entreprises." },
      { q: "Comment obtenir une facture ?", a: "Votre facture est disponible dans votre espace personnel rubrique « Mes réservations », téléchargeable en PDF à tout moment." },
    ],
  },
  {
    cat: "Prestataires",
    items: [
      { q: "Comment les prestataires sont-ils sélectionnés ?", a: "Chaque prestataire est vérifié par notre équipe : identité, qualifications, assurances et références. Seuls les profils validés apparaissent sur la plateforme." },
      { q: "Puis-je laisser un avis ?", a: "Oui, après chaque prestation vous recevez une invitation à laisser un avis noté. Les avis sont vérifiés et publiés uniquement pour les prestations réalisées." },
      { q: "Comment devenir prestataire sur Prestalya ?", a: "Remplissez le formulaire « Devenir prestataire », notre équipe étudie votre candidature et vous recontacte sous 48h pour finaliser votre profil." },
    ],
  },
  {
    cat: "Compte",
    items: [
      { q: "Comment créer un compte ?", a: "Cliquez sur « Se connecter » puis sur « Inscription ». Renseignez vos informations et validez votre email. C'est gratuit et sans engagement." },
      { q: "Mes données sont-elles en sécurité ?", a: "Oui. Toutes vos données sont chiffrées et stockées de manière sécurisée. Nous ne revendons jamais vos informations à des tiers. Consultez notre politique de confidentialité pour plus de détails." },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--gray-200)", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left" }}>
        <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: "1.3rem", color: "var(--primary)", flexShrink: 0, transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s", fontWeight: 300 }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20, color: "var(--gray-500)", fontSize: "1rem", lineHeight: 1.8 }}>{a}</div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const res = await api.post("/ai/faq", { question: question.trim() });
      setAnswer(res.answer);
    } catch {
      setAnswer("Désolé, une erreur est survenue. Réessayez ou contactez le support.");
    } finally { setAsking(false); }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.flatMap(cat => cat.items.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    })))
  };
  return (
    <main>
      <SEO
        title="FAQ – Questions fréquentes"
        description="Trouvez les réponses à vos questions sur Prestalya : réservations, paiements, prestataires, compte et données personnelles."
        path="/faq"
        jsonLd={jsonLd}
      />
      <section className="page-hero">
        <div className="container">
          <h1>Questions fréquentes</h1>
          <p>Retrouvez les réponses aux questions les plus courantes sur Prestalya.</p>
        </div>
      </section>

      <section style={{ padding: "64px 0 96px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          {faqs.map((cat) => (
            <div key={cat.cat} style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-block", width: 28, height: 3, background: "var(--primary)", borderRadius: 2 }} />
                {cat.cat}
              </h2>
              <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", padding: "0 28px", border: "1px solid rgba(124,58,237,0.07)" }}>
                {cat.items.map((item) => <AccordionItem key={item.q} {...item} />)}
              </div>
            </div>
          ))}

          <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", padding: "32px", marginTop: 16, border: "1px solid rgba(124,58,237,0.07)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12, textAlign: "center" }}>✨</div>
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text)", marginBottom: 8, textAlign: "center" }}>Posez votre question à notre assistant</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: 20, textAlign: "center" }}>Une réponse instantanée, à partir de nos informations officielles.</p>
            <form onSubmit={handleAsk} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex : Comment annuler ma réservation ?"
                style={{ flex: 1, minWidth: 220, padding: "12px 16px", borderRadius: 10, border: "1.5px solid var(--gray-200)", fontSize: "0.95rem" }}
              />
              <button type="submit" className="btn-primary" disabled={asking || !question.trim()} style={{ opacity: (asking || !question.trim()) ? 0.6 : 1 }}>
                {asking ? "…" : "Demander"}
              </button>
            </form>
            {answer && (
              <div style={{ marginTop: 18, background: "var(--primary-light)", borderRadius: 10, padding: "16px 18px", color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {answer}
              </div>
            )}
          </div>

          <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius-lg)", padding: "32px", textAlign: "center", marginTop: 24 }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>💬</div>
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text)", marginBottom: 8 }}>Vous n'avez pas trouvé votre réponse ?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: 20 }}>Notre équipe est disponible du lundi au vendredi de 9h à 18h.</p>
            <a href="/contact" className="btn-primary" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>Nous contacter</a>
          </div>
        </div>
      </section>
    </main>
  );
}
