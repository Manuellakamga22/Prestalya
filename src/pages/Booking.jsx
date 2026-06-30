import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { services as ALL_SERVICES } from "../data";
import SEO from "../components/SEO";
import "../styles/pages.css";

const ALL_SLOTS = ["08h00","09h00","10h00","11h00","12h00","13h00","14h00","15h00","16h00","17h00","18h00","19h00"];
const ALL_PLATFORM_SERVICES = ALL_SERVICES.map(s => s.title).sort();

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProvider = searchParams.get("provider");

  const [form, setForm] = useState({ service: "", city: "", provider_id: preselectedProvider || "", date: "", slot: "", comment: "" });
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    api.get("/providers?limit=200").then((data) => {
      const list = data.providers || data;
      setProviders(list);
      const uniqueCities = [...new Set(list.map((p) => p.city).filter(Boolean))].sort();
      setCities(uniqueCities);
    }).catch(() => {});
  }, []);

  // Charger les créneaux bloqués quand on choisit un prestataire + une date
  useEffect(() => {
    if (!form.provider_id || !form.date) { setBlockedSlots({}); return; }
    const prov = providers.find(p => p.id === form.provider_id);
    if (!prov) return;
    api.get(`/disponibilites/${form.provider_id}`).then(data => {
      setBlockedSlots(data || {});
      setForm(f => ({ ...f, slot: "" })); // reset créneau si date/prest change
    }).catch(() => {});
  }, [form.provider_id, form.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/connexion"); return; }

    setLoading(true);
    try {
      const body = {
        service: form.service,
        city: form.city,
        date: form.date,
        slot: form.slot,
        comment: form.comment,
      };
      if (form.provider_id) body.provider_id = form.provider_id;

      const data = await api.post("/bookings", body);

      const providerName = providers.find((p) => p.id === form.provider_id)
        ? `${providers.find((p) => p.id === form.provider_id).prenom} ${providers.find((p) => p.id === form.provider_id).nom}`
        : "Au choix de Prestalya";

      navigate("/reservation/confirmation", {
        state: { service: form.service, date: form.date, provider: providerName, bookingId: data.id },
      });
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = providers.find((p) => p.id === form.provider_id);

  return (
    <main className="booking-page">
      <SEO
        title="Réserver une prestation à domicile"
        description="Réservez votre prestation à domicile en quelques minutes."
        path="/reservation"
      />
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
            {error && (
              <div style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: "0.97rem", fontWeight: 600 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service souhaité *</label>
                <select name="service" value={form.service} onChange={set} required>
                  <option value="">Sélectionner un service</option>
                  {ALL_PLATFORM_SERVICES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ville *</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={set}
                    required
                    placeholder="Ex : Paris, Lyon, Marseille…"
                    list="cities-list"
                  />
                  <datalist id="cities-list">
                    {cities.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Prestataire</label>
                  <select name="provider_id" value={form.provider_id} onChange={set}>
                    <option value="">Au choix de Prestalya</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom} — {p.service}
                      </option>
                    ))}
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
                    {ALL_SLOTS.map(s => {
                      const isBlocked = form.date && !!blockedSlots[form.date]?.[s];
                      return (
                        <option key={s} value={s} disabled={isBlocked}>
                          {s}{isBlocked ? " — Indisponible" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {form.provider_id && form.date && Object.keys(blockedSlots).length > 0 && (
                    <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginTop: 4 }}>
                      Les créneaux grisés sont indisponibles pour ce prestataire ce jour-là.
                    </p>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Commentaire (optionnel)</label>
                <textarea name="comment" value={form.comment} onChange={set}
                  placeholder="Superficie, accès, consignes particulières..." />
              </div>
              <button type="submit" className="btn-primary"
                style={{ width: "100%", padding: "13px", justifyContent: "center", fontSize: "0.95rem", opacity: loading ? 0.7 : 1 }}
                disabled={loading}>
                {loading ? "Envoi en cours…" : "Confirmer la réservation"}
              </button>
            </form>
          </div>

          <aside>
            <div className="booking-summary">
              <h3>Récapitulatif</h3>
              {[
                ["Service", form.service],
                ["Ville", form.city],
                ["Prestataire", selectedProvider ? `${selectedProvider.prenom} ${selectedProvider.nom}` : "Au choix de Prestalya"],
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
