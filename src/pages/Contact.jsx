import { useState } from "react";
import "../styles/pages.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <main className="contact-page">
      <section className="page-hero">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Une question, une suggestion ? Notre équipe est là pour vous répondre.</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          <div className="contact-info">
            <h2>Nous sommes à votre écoute</h2>
            <p>Notre équipe répond à toutes vos questions dans les plus brefs délais. N'hésitez pas à nous écrire.</p>
            <div className="contact-items">
              {[
                { icon: "📧", label: "Email", val: "contact@prestalya.com" },
                { icon: "📞", label: "Téléphone", val: "+33 6 12 34 56 78" },
                { icon: "📍", label: "Adresse", val: "Paris, France" },
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
          </div>

          <div className="contact-form-card">
            <h3>Envoyer un message</h3>
            {sent ? (
              <div className="success-box" style={{ padding: "24px 0" }}>
                <div className="success-icon">✓</div>
                <h2 style={{ fontSize: "1.4rem" }}>Merci !</h2>
                <p>Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.</p>
                <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => setSent(false)}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
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
                    <option>Question générale</option>
                    <option>Problème de réservation</option>
                    <option>Devenir prestataire</option>
                    <option>Signaler un problème</option>
                    <option>Partenariat</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea name="message" value={form.message} onChange={set}
                    placeholder="Décrivez votre demande..." required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "13px", justifyContent: "center" }}>
                  Envoyer
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
