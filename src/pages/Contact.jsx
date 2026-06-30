import { useState } from "react";
import { api } from "../api";
import SEO from "../components/SEO";
import "../styles/pages.css";

const FAQ = [
  { q: "Comment réserver un prestataire ?", a: "Recherchez un prestataire, consultez son profil, choisissez une date et confirmez. Vous recevrez un email de confirmation." },
  { q: "Comment devenir prestataire ?", a: "Créez un compte, choisissez le rôle prestataire, complétez votre fiche et soumettez vos documents pour vérification." },
  { q: "Comment annuler une réservation ?", a: "Depuis votre espace client, onglet Réservations, cliquez sur Annuler. L'annulation est gratuite avant 24h." },
  { q: "Comment est calculée la commission ?", a: "La commission varie selon le niveau du prestataire : Débutant 15%, Intermédiaire 12%, Avancé 7%, Expert 3%." },
  { q: "Mes données sont-elles sécurisées ?", a: "Oui. Vos données sont hébergées en France, chiffrées et conformes au RGPD/CNIL. Consultez notre politique de confidentialité." },
];

export default function Contact() {
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page">
      <SEO
        title="Contactez-nous"
        description="Une question, une suggestion ? Notre équipe Prestalya est là pour vous répondre."
        path="/contact"
      />
      <section className="page-hero">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Une question, une suggestion ? Notre équipe est là pour vous répondre.</p>
        </div>
      </section>

      {/* Délais de réponse */}
      <div className="container" style={{ marginTop: 32 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {[
            { icon: "⚡", label: "Email", delay: "< 24h", color: "#7C3AED", bg: "#EDE9FE" },
            { icon: "💬", label: "Chat en ligne", delay: "Bientôt", color: "#059669", bg: "#D1FAE5" },
            { icon: "📞", label: "Téléphone", delay: "Lun–Ven 9h–18h", color: "#0EA5E9", bg: "#E0F2FE" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, background: item.bg, borderRadius: 14, padding: "14px 22px", minWidth: 200 }}>
              <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: item.color, fontSize: "0.95rem" }}>{item.label}</div>
                <div style={{ color: "#374151", fontSize: "0.85rem" }}>Réponse {item.delay}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-layout">
          <div className="contact-info">
            <h2>Nous sommes à votre écoute</h2>
            <p>Notre équipe répond à toutes vos questions dans les plus brefs délais.</p>
            <div className="contact-items">
              {[
                { icon: "📧", label: "Email", val: "manuellakamga20@gmail.com" },
                { icon: "📞", label: "Téléphone", val: "+33 6 34 66 01 03" },
                { icon: "📍", label: "Adresse", val: "Paris, France" },
                { icon: "🕐", label: "Disponibilité", val: "Lun–Ven, 9h–18h" },
              ].map((item) => (
                <div key={item.label} className="contact-item">
                  <div className="contact-item-icon">{item.icon}</div>
                  <div className="contact-item-text">
                    <strong>{item.label}</strong>
                    <span>{item.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Réseaux sociaux */}
            <div style={{ marginTop: 28 }}>
              <p style={{ fontWeight: 700, color: "var(--gray-700)", marginBottom: 12 }}>Suivez-nous</p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Instagram", icon: "📸" },
                  { label: "LinkedIn",  icon: "💼" },
                  { label: "Facebook",  icon: "👥" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--gray-100)", padding: "8px 14px", borderRadius: 10, fontSize: "0.9rem", fontWeight: 600, color: "var(--gray-700)", cursor: "pointer" }}>
                    {s.icon} {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h3>Envoyer un message</h3>
            {sent ? (
              <div className="success-box" style={{ padding: "24px 0" }}>
                <div className="success-icon">✓</div>
                <h2 style={{ fontSize: "1.4rem" }}>Message envoyé !</h2>
                <p>Nous vous répondrons sous 24h à l'adresse <strong>{form.email}</strong>.</p>
                <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: "0.97rem" }}>
                    {error}
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom *</label>
                    <input type="text" name="name" value={form.name} onChange={set} placeholder="Votre nom" required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={form.email} onChange={set} placeholder="votre@email.fr" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Sujet *</label>
                  <select name="subject" value={form.subject} onChange={set} required>
                    <option value="">Choisir un sujet</option>
                    <option>Question sur une réservation</option>
                    <option>Problème technique</option>
                    <option>Devenir prestataire</option>
                    <option>Litige ou signalement</option>
                    <option>Facturation / Paiement</option>
                    <option>Partenariat commercial</option>
                    <option>Presse / Médias</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea name="message" value={form.message} onChange={set} rows={5}
                    placeholder="Décrivez votre demande en détail..." required />
                </div>
                <button type="submit" className="btn-primary"
                  style={{ width: "100%", padding: "13px", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                  disabled={loading}>
                  {loading ? "Envoi en cours…" : "Envoyer le message"}
                </button>
                <p style={{ color: "var(--gray-400)", fontSize: "0.8rem", marginTop: 10, textAlign: "center" }}>
                  Réponse garantie sous 24h ouvrées
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container" style={{ maxWidth: 720, margin: "48px auto 64px" }}>
        <h2 style={{ textAlign: "center", marginBottom: 28 }}>Questions fréquentes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ border: "1.5px solid var(--gray-200)", borderRadius: 14, overflow: "hidden" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: openFaq === i ? "#F4F3FF" : "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.97rem", color: openFaq === i ? "var(--primary)" : "var(--gray-800)", textAlign: "left" }}
              >
                {item.q}
                <span style={{ fontSize: "1.2rem", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "0.2s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 18px", color: "var(--gray-600)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
