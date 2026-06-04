import { useState } from "react";
import "../styles/pages.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="contact-page">
      <section className="page-hero">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Une question, une suggestion ou un problème ? Notre équipe est là pour vous répondre.</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          <div className="contact-info">
            <h2>Nous sommes à votre écoute</h2>
            <p>
              Que vous soyez client ou prestataire, notre équipe répond à toutes vos questions dans les plus brefs délais. N'hésitez pas à nous écrire.
            </p>
            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-item-icon">📧</div>
                <div className="contact-item-text">
                  <strong>Email</strong>
                  <span>contact@prestalya.fr</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon">📞</div>
                <div className="contact-item-text">
                  <strong>Téléphone</strong>
                  <span>01 23 45 67 89 (Lun–Ven, 9h–18h)</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon">📍</div>
                <div className="contact-item-text">
                  <strong>Adresse</strong>
                  <span>75 rue du Service, 75001 Paris, France</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon">⏱️</div>
                <div className="contact-item-text">
                  <strong>Délai de réponse</strong>
                  <span>Moins de 24h ouvrées</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h3>Envoyer un message</h3>
            {sent ? (
              <div>
                <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: 16 }}>✉️</div>
                <div className="success-message">
                  Votre message a bien été envoyé ! Nous vous répondrons dans les meilleurs délais.
                </div>
                <button className="btn-secondary" style={{ marginTop: 20, width: "100%" }} onClick={() => setSent(false)}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Votre nom *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Votre nom complet" required />
                </div>
                <div className="form-group">
                  <label>Adresse email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="votre@email.fr" required />
                </div>
                <div className="form-group">
                  <label>Sujet *</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Sélectionner un sujet</option>
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
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Décrivez votre demande..." required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px" }}>
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
