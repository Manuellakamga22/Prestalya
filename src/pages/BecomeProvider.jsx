import { useState } from "react";
import { servicesList, cities } from "../data";
import "../styles/pages.css";

const advantages = [
  { icon: "📣", title: "Gagnez en visibilité", desc: "Votre profil est mis en avant auprès de milliers de clients dans votre ville." },
  { icon: "📥", title: "Recevez des demandes", desc: "Les clients vous contactent directement selon vos disponibilités et votre secteur." },
  { icon: "📅", title: "Gérez votre planning", desc: "Acceptez ou refusez les demandes selon vos disponibilités, en totale liberté." },
  { icon: "📈", title: "Développez votre activité", desc: "Augmentez votre chiffre d'affaires en accédant à une clientèle qualifiée." },
  { icon: "🌟", title: "Construisez votre réputation", desc: "Collectez des avis vérifiés pour renforcer votre crédibilité professionnelle." },
  { icon: "🔐", title: "Plateforme sécurisée", desc: "Vos données et paiements sont protégés. Vous êtes entre de bonnes mains." },
];

export default function BecomeProvider() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", service: "", experience: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="become-page">
      <section className="become-hero">
        <div className="container">
          <h1>Rejoignez Prestalya en tant que prestataire</h1>
          <p>Développez votre activité, gagnez en visibilité et recevez des clients directement chez eux.</p>
        </div>
      </section>

      <section className="become-advantages">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pourquoi nous rejoindre ?</h2>
            <p className="section-subtitle">Des milliers de clients attendent vos services. Voici ce que Prestalya vous apporte.</p>
          </div>
          <div className="become-adv-grid">
            {advantages.map((a, i) => (
              <div key={i} className="become-adv-card">
                <div className="adv-icon">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="become-form-section">
        <div className="container">
          <div className="become-layout">
            <div className="become-left">
              <h2>Rejoignez la communauté Prestalya</h2>
              <p>Inscription gratuite et sans engagement. Nous étudions chaque candidature et vous recontactons sous 48h.</p>
              <ul className="become-checklist">
                {[
                  "Inscription 100% gratuite",
                  "Vérification de votre profil sous 48h",
                  "Accès à votre tableau de bord",
                  "Recevez vos premières demandes",
                  "Support dédié aux prestataires",
                  "Pas de frais d'abonnement",
                ].map((item, i) => (
                  <li key={i}>
                    <span className="check-icon">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="become-form-card">
              <h3>Déposer ma candidature</h3>
              {sent ? (
                <div>
                  <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: 16 }}>🎉</div>
                  <div className="success-message">
                    Votre demande a bien été envoyée ! Nous l'étudierons et vous recontacterons très prochainement.
                  </div>
                  <button className="btn-secondary" style={{ marginTop: 20, width: "100%" }} onClick={() => setSent(false)}>
                    Envoyer une autre demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nom complet *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Votre nom et prénom" required />
                  </div>
                  <div className="form-group">
                    <label>Adresse email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="votre@email.fr" required />
                  </div>
                  <div className="form-group">
                    <label>Téléphone *</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="06 00 00 00 00" required />
                  </div>
                  <div className="form-group">
                    <label>Ville *</label>
                    <select name="city" value={form.city} onChange={handleChange} required>
                      <option value="">Sélectionner une ville</option>
                      {cities.slice(1).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Service proposé *</label>
                    <select name="service" value={form.service} onChange={handleChange} required>
                      <option value="">Sélectionner un service</option>
                      {servicesList.slice(1).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Expérience</label>
                    <textarea name="experience" value={form.experience} onChange={handleChange} placeholder="Décrivez brièvement votre expérience et vos qualifications..." />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px" }}>
                    Envoyer ma demande
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
