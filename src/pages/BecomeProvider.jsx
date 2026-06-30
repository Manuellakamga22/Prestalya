import { useState, useEffect } from "react";
import { api } from "../api";
import { services as ALL_SERVICES } from "../data";
import SEO from "../components/SEO";
import "../styles/pages.css";

const ALL_PLATFORM_SERVICES = ALL_SERVICES.map(s => s.title).sort();

const advantages = [
  { icon: "📣", title: "Gagnez en visibilité", desc: "Votre profil est mis en avant auprès de milliers de clients dans votre ville." },
  { icon: "📥", title: "Recevez plus de demandes", desc: "Les clients vous contactent directement selon vos disponibilités." },
  { icon: "📅", title: "Gérez votre planning", desc: "Acceptez ou refusez les demandes selon vos disponibilités, en totale liberté." },
  { icon: "📈", title: "Développez votre activité", desc: "Augmentez votre chiffre d'affaires en accédant à une clientèle qualifiée." },
];

export default function BecomeProvider() {
  const [form, setForm] = useState({ name: "", email: "", city: "", service: "", experience: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [expandLoading, setExpandLoading] = useState(false);

  useEffect(() => {
    api.get("/providers?limit=200").then((data) => {
      const list = data.providers || data;
      setCities([...new Set(list.map((p) => p.city).filter(Boolean))].sort());
    }).catch(() => {});
  }, []);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function expandExperience() {
    if (!form.experience.trim()) return;
    setExpandLoading(true);
    try {
      const res = await api.post("/ai/expand-experience", { keywords: form.experience, service: form.service });
      setForm(f => ({ ...f, experience: res.text }));
    } catch {} finally { setExpandLoading(false); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/contact", {
        name: form.name,
        email: form.email,
        subject: "Candidature prestataire",
        message: `Ville : ${form.city}\nService : ${form.service}\n\n${form.experience}`,
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="become-page">
      <SEO
        title="Devenir prestataire sur Prestalya"
        description="Rejoignez Prestalya et développez votre activité. Des milliers de clients attendent vos services."
        path="/devenir-prestataire"
      />
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
                <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => { setSent(false); setForm({ name: "", email: "", city: "", service: "", experience: "" }); }}>
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: "0.97rem" }}>
                    {error}
                  </div>
                )}
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
                  <input type="text" name="city" value={form.city} onChange={set} placeholder="Ex : Paris, Lyon, Marseille…" list="cities-list" required />
                  <datalist id="cities-list">
                    {cities.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Service proposé *</label>
                  <select name="service" value={form.service} onChange={set} required>
                    <option value="">Sélectionner un service</option>
                    {ALL_PLATFORM_SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Expérience
                    <button type="button" onClick={expandExperience} disabled={expandLoading || !form.experience.trim()}
                      style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", color: "white", border: "none",
                        borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                        opacity: (expandLoading || !form.experience.trim()) ? 0.6 : 1 }}>
                      {expandLoading ? "Rédaction…" : "Rédiger automatiquement"}
                    </button>
                  </label>
                  <textarea name="experience" value={form.experience} onChange={set}
                    placeholder="Notez quelques mots-clés (ex: 5 ans ménage, sérieux, ponctuel) puis cliquez sur Rédiger automatiquement..." />
                </div>
                <button type="submit" className="btn-primary"
                  style={{ width: "100%", padding: "13px", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                  disabled={loading}>
                  {loading ? "Envoi en cours…" : "Envoyer ma demande"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
