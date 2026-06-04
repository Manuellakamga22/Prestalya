import { useState } from "react";
import { servicesList, cities } from "../data";
import "../styles/pages.css";

const advantages = [
  { icon: "📣", title: "Gagnez en visibilité", desc: "Votre profil est mis en avant auprès de milliers de clients dans votre ville." },
  { icon: "📥", title: "Recevez plus de demandes", desc: "Les clients vous contactent directement selon vos disponibilités." },
  { icon: "📅", title: "Gérez votre planning", desc: "Acceptez ou refusez les demandes selon vos disponibilités, en totale liberté." },
  { icon: "📈", title: "Développez votre activité", desc: "Augmentez votre chiffre d'affaires en accédant à une clientèle qualifiée." },
];

export default function BecomeProvider() {
  const [form, setForm] = useState({ name: "", email: "", city: "", service: "", experience: "" });
  const [sent, setSent] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <main className="become-page">
      <section className="become-hero">
        <div className="container">
          <h1>Devenir prestataire</h1>
          <p>Rejoignez Prestalya et développez votre activité. Des milliers de clients attendent vos services.</p>
        </div>
      </section>

      <div className="container">
        <div className="become-layout">
          <div className="become-left">
            <h2>Pourquoi nous rejoindre ?</h2>
            <div className="adv-list">
              {advantages.map((a, i) => (
                <div key={i} className="adv-item">
                  <div className="adv-item-icon">{a.icon}</div>
                  <div className="adv-item-text">
                    <strong>{a.title}</strong>
                    <span>{a.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="become-form-card">
            <h3>Déposer ma candidature</h3>
            {sent ? (
              <div className="success-box" style={{ padding: "24px 0" }}>
                <div className="success-icon">✓</div>
                <h2 style={{ fontSize: "1.4rem" }}>Merci !</h2>
                <p>Votre demande a bien été envoyée. Nous vous recontacterons très prochainement.</p>
                <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => setSent(false)}>
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input type="text" name="name" value={form.name} onChange={set} placeholder="Votre nom et prénom" required />
                </div>
                <div className="form-group">
                  <label>Adresse email *</label>
                  <input type="email" name="email" value={form.email} onChange={set} placeholder="votre@email.fr" required />
                </div>
                <div className="form-group">
                  <label>Ville *</label>
                  <select name="city" value={form.city} onChange={set} required>
                    <option value="">Sélectionner une ville</option>
                    {cities.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Service proposé *</label>
                  <select name="service" value={form.service} onChange={set} required>
                    <option value="">Sélectionner un service</option>
                    {servicesList.slice(1).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expérience</label>
                  <textarea name="experience" value={form.experience} onChange={set}
                    placeholder="Décrivez brièvement votre expérience et vos qualifications..." />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "13px", justifyContent: "center" }}>
                  Envoyer ma demande
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
