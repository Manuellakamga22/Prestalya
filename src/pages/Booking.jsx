import { useState } from "react";
import { servicesList, cities, providers } from "../data";
import "../styles/pages.css";

const slots = ["08h00", "09h00", "10h00", "11h00", "13h00", "14h00", "15h00", "16h00", "17h00", "18h00"];

export default function Booking() {
  const [form, setForm] = useState({ service: "", city: "", provider: "", date: "", slot: "", comment: "" });
  const [confirmed, setConfirmed] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (confirmed) {
    return (
      <main className="booking-page">
        <section className="page-hero"><div className="container"><h1>Réserver une prestation</h1></div></section>
        <div className="container">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2>Merci !</h2>
            <p>
              Votre demande de réservation pour <strong>{form.service}</strong> à <strong>{form.city}</strong><br />
              le <strong>{form.date}</strong> à <strong>{form.slot}</strong> a bien été enregistrée.<br />
              Un prestataire vous contactera sous 24h.
            </p>
            <button className="btn-primary" onClick={() => setConfirmed(false)}>
              Nouvelle réservation
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
          <p>Remplissez le formulaire, nous vous mettons en relation avec un prestataire.</p>
        </div>
      </section>

      <div className="container">
        <div className="booking-layout">
          <div className="booking-form-card">
            <h2>Votre demande</h2>
            <form onSubmit={(e) => { e.preventDefault(); setConfirmed(true); window.scrollTo(0, 0); }}>
              <div className="form-group">
                <label>Service souhaité *</label>
                <select name="service" value={form.service} onChange={set} required>
                  <option value="">Sélectionner un service</option>
                  {servicesList.slice(1).map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ville *</label>
                  <select name="city" value={form.city} onChange={set} required>
                    <option value="">Sélectionner une ville</option>
                    {cities.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prestataire</label>
                  <select name="provider" value={form.provider} onChange={set}>
                    <option value="">Au choix de Prestalya</option>
                    {providers.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date souhaitée *</label>
                  <input type="date" name="date" value={form.date} onChange={set}
                    min={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="form-group">
                  <label>Créneau horaire *</label>
                  <select name="slot" value={form.slot} onChange={set} required>
                    <option value="">Sélectionner un créneau</option>
                    {slots.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Commentaire (optionnel)</label>
                <textarea name="comment" value={form.comment} onChange={set}
                  placeholder="Superficie, accès, consignes particulières..." />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "13px", justifyContent: "center", fontSize: "0.95rem" }}>
                Confirmer la réservation
              </button>
            </form>
          </div>

          <aside>
            <div className="booking-summary">
              <h3>Récapitulatif</h3>
              {[
                ["Service", form.service],
                ["Ville", form.city],
                ["Prestataire", form.provider || "Au choix de Prestalya"],
                ["Date", form.date],
                ["Créneau", form.slot],
              ].map(([label, val]) => (
                <div key={label} className="summary-row">
                  <span className="summary-label">{label}</span>
                  <span className="summary-val">{val || "—"}</span>
                </div>
              ))}
              <div className="booking-note">
                ✅ Réservation gratuite, sans engagement. Un prestataire vous contacte sous 24h.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
