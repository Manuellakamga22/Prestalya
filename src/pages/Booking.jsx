import { useState } from "react";
import { servicesList, cities } from "../data";
import "../styles/pages.css";

const slots = ["08h00", "09h00", "10h00", "11h00", "13h00", "14h00", "15h00", "16h00", "17h00", "18h00"];

export default function Booking() {
  const [form, setForm] = useState({
    service: "",
    city: "",
    date: "",
    slot: "",
    comment: "",
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (confirmed) {
    return (
      <main className="booking-page">
        <div className="container">
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--blue-deep)", marginBottom: 12 }}>
              Demande envoyée avec succès !
            </h2>
            <p style={{ color: "var(--gray-text)", marginBottom: 24, lineHeight: 1.7 }}>
              Votre demande de réservation pour <strong>{form.service}</strong> à <strong>{form.city}</strong> le <strong>{form.date}</strong> à <strong>{form.slot}</strong> a bien été enregistrée.
            </p>
            <div className="success-message">
              Un prestataire vous contactera très prochainement pour confirmer le rendez-vous.
            </div>
            <button className="btn-primary" style={{ marginTop: 28 }} onClick={() => setConfirmed(false)}>
              Faire une nouvelle réservation
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <section className="page-hero">
        <div className="container">
          <h1>Réserver une prestation</h1>
          <p>Remplissez le formulaire ci-dessous et nous vous mettrons en relation avec un prestataire.</p>
        </div>
      </section>

      <div className="container" style={{ marginTop: 48 }}>
        <div className="booking-layout">
          <div className="booking-form-card">
            <h2>Votre demande</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Service souhaité *</label>
                  <select name="service" value={form.service} onChange={handleChange} required>
                    <option value="">Sélectionner un service</option>
                    {servicesList.slice(1).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Votre ville *</label>
                  <select name="city" value={form.city} onChange={handleChange} required>
                    <option value="">Sélectionner une ville</option>
                    {cities.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date souhaitée *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Créneau horaire *</label>
                  <select name="slot" value={form.slot} onChange={handleChange} required>
                    <option value="">Sélectionner un créneau</option>
                    {slots.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Commentaire ou précisions</label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  placeholder="Décrivez votre besoin, superficie, accès, consignes particulières..."
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "15px", fontSize: "1rem" }}>
                Confirmer la réservation
              </button>
            </form>
          </div>

          <aside className="booking-summary">
            <h3>Récapitulatif</h3>
            <div className="summary-item">
              <span className="summary-label">Service</span>
              <span className="summary-value">{form.service || "—"}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Ville</span>
              <span className="summary-value">{form.city || "—"}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date</span>
              <span className="summary-value">{form.date || "—"}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Créneau</span>
              <span className="summary-value">{form.slot || "—"}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Note</span>
              <span className="summary-value" style={{ color: "var(--gray-text)", fontSize: "0.85rem" }}>
                {form.comment || "Aucune précision"}
              </span>
            </div>

            <div style={{ background: "var(--green-light)", borderRadius: 10, padding: "16px", marginTop: 20 }}>
              <p style={{ color: "var(--green)", fontSize: "0.88rem", fontWeight: 600 }}>
                ✅ Réservation gratuite, sans engagement. Un prestataire vous contacte sous 24h.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
