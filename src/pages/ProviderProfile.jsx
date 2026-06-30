import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, API_ORIGIN } from "../api";
import SEO from "../components/SEO";
import PrebookingChat from "../components/PrebookingChat";
import "../styles/pages.css";

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function MiniCalendar({ blockedDates }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;

  const blockedSet = new Set(
    (blockedDates || []).map(d => typeof d === "string" ? d.slice(0,10) : new Date(d).toISOString().slice(0,10))
  );

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  return (
    <div className="mini-cal">
      <div className="mini-cal-nav">
        <button onClick={prev}>‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button onClick={next}>›</button>
      </div>
      <div className="mini-cal-grid">
        {["L","M","M","J","V","S","D"].map((d,i) => <div key={i} className="mini-cal-dow">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const isBlocked = blockedSet.has(iso);
          const isPast = new Date(iso) < new Date(today.toISOString().slice(0,10));
          return (
            <div key={i} className={`mini-cal-day ${isBlocked ? "blocked" : ""} ${isPast ? "past" : ""}`}>
              {d}
            </div>
          );
        })}
      </div>
      <div className="mini-cal-legend">
        <span className="mini-cal-leg blocked" /> Indisponible
        <span className="mini-cal-leg avail" /> Disponible
      </div>
    </div>
  );
}

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider]     = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [blockedDates, setBlocked]  = useState([]);
  const [isFav, setIsFav]           = useState(false);
  const [favLoad, setFavLoad]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [showChat, setShowChat]     = useState(false);
  const [showDevis, setShowDevis]   = useState(false);
  const [devisForm, setDevisForm]   = useState({ description: "", date_souhaitee: "", message_client: "" });
  const [devisLoading, setDevisLoading] = useState(false);
  const [devisSent, setDevisSent]   = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const isLoggedIn = !!user?.token;
  const isClient   = user?.role === "client";

  useEffect(() => {
    Promise.all([
      api.get(`/providers/${id}`),
      api.get(`/reviews/provider/${id}`).catch(() => []),
      api.get(`/disponibilites/${id}`).catch(() => []),
      isLoggedIn ? api.get("/favoris/ids").catch(() => []) : Promise.resolve([]),
    ]).then(([p, r, blocked, favIds]) => {
      setProvider(p);
      setReviews(Array.isArray(r) ? r : []);
      setBlocked(Array.isArray(blocked) ? blocked : []);
      setIsFav(Array.isArray(favIds) && favIds.includes(id));
    }).catch(() => navigate("/prestataires"))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleFav() {
    if (!isLoggedIn) return navigate("/connexion");
    setFavLoad(true);
    try {
      const res = await api.post(`/favoris/${id}`);
      setIsFav(res.saved);
    } catch {} finally { setFavLoad(false); }
  }

  async function submitDevis(e) {
    e.preventDefault();
    if (!isLoggedIn) return navigate("/connexion");
    setDevisLoading(true);
    try {
      await api.post("/devis", { provider_id: id, service: provider.service, ...devisForm });
      setDevisSent(true);
    } catch (err) { alert(err.message); }
    finally { setDevisLoading(false); }
  }

  if (loading) return <div className="dash-loading">Chargement…</div>;
  if (!provider) return null;

  const p = provider;
  const fullName = `${p.prenom || ""} ${p.nom || ""}`.trim();
  const initials = (p.prenom?.[0] || "") + (p.nom?.[0] || "");
  const rating = parseFloat(p.rating || 0).toFixed(1);

  return (
    <main className="profile-page">
      <SEO
        title={`${fullName} — ${p.service}`}
        description={p.bio || `Prestataire ${p.service} à ${p.city}.`}
        path={`/prestataires/${id}`}
      />
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button className="profile-back" onClick={() => navigate("/prestataires")}>← Retour</button>
          {isClient && (
            <button
              onClick={toggleFav}
              disabled={favLoad}
              style={{
                background: isFav ? "#FEE2E2" : "#F3F4F6",
                color: isFav ? "#DC2626" : "#6B7280",
                border: "none", borderRadius: 10, padding: "8px 16px",
                fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6
              }}
            >
              {isFav ? "❤️ Sauvegardé" : "🤍 Sauvegarder"}
            </button>
          )}
        </div>

        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-top">
              {p.photo_url ? (
                <img className="profile-photo"
                  src={p.photo_url.startsWith("/") ? `${API_ORIGIN}${p.photo_url}` : p.photo_url}
                  alt={fullName}
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
              ) : null}
              <div className="profile-avatar" style={{ background: "var(--primary)", display: p.photo_url ? "none" : "flex" }}>
                {initials || "?"}
              </div>

              <div className="profile-top-info">
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 5 }}>
                  <h1>{fullName}</h1>
                  {p.premium && <span style={{ background: "#FEF3C7", color: "#D97706", fontSize: "0.78rem", fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>⭐ Pro</span>}
                  {p.available
                    ? <span className="badge-available">● Disponible</span>
                    : <span className="badge-unavailable">● Indisponible</span>
                  }
                </div>
                <div className="profile-service">{p.service}</div>
                <div className="profile-location">📍 {p.city}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.97rem" }}>
                  <span className="stars">{"★".repeat(Math.round(parseFloat(p.rating || 0)))}</span>
                  <strong>{rating}</strong>
                  <span style={{ color: "var(--gray-500)" }}>({p.reviews || 0} avis)</span>
                </div>
              </div>
            </div>

            <div className="profile-body">
              {p.bio && (
                <div className="profile-section">
                  <h3>À propos</h3>
                  <p>{p.bio}</p>
                </div>
              )}

              {/* Calendrier disponibilités */}
              <div className="profile-section">
                <h3>📅 Disponibilités</h3>
                <MiniCalendar blockedDates={blockedDates} />
              </div>

              <div className="profile-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Avis clients</h3>
                  {reviews.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF9C3", borderRadius: 10, padding: "6px 14px" }}>
                      <span style={{ color: "#F59E0B", fontSize: "1.1rem" }}>★</span>
                      <span style={{ fontWeight: 800, color: "#374151", fontSize: "1rem" }}>
                        {(reviews.reduce((s, r) => s + r.note, 0) / reviews.length).toFixed(1)}
                      </span>
                      <span style={{ color: "#6B7280", fontSize: "0.85rem" }}>({reviews.length} avis)</span>
                    </div>
                  )}
                </div>

                {reviews.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    {[5,4,3,2,1].map(n => {
                      const count = reviews.filter(r => r.note === n).length;
                      const pct   = Math.round((count / reviews.length) * 100);
                      return (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                          <span style={{ color: "#F59E0B", fontSize: "0.85rem", width: 14 }}>{n}★</span>
                          <div style={{ flex: 1, background: "#F3F4F6", borderRadius: 6, height: 8, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, background: "#F59E0B", height: "100%", borderRadius: 6 }} />
                          </div>
                          <span style={{ color: "#6B7280", fontSize: "0.8rem", width: 30 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>⭐</div>
                    <p style={{ margin: 0 }}>Aucun avis pour l'instant.</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="review-item" style={{ borderLeft: "3px solid #F59E0B" }}>
                        <div className="review-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span className="review-author" style={{ fontWeight: 700, color: "#1F2937" }}>
                              {r.client_name || "Client vérifié"}
                            </span>
                            {r.created_at && (
                              <span style={{ display: "block", fontSize: "0.78rem", color: "#9CA3AF", marginTop: 2 }}>
                                {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            {[1,2,3,4,5].map(s => (
                              <span key={s} style={{ color: s <= r.note ? "#F59E0B" : "#D1D5DB", fontSize: "1.05rem" }}>★</span>
                            ))}
                          </div>
                        </div>
                        {r.commentaire && (
                          <p className="review-text" style={{ margin: "10px 0 0", color: "#374151", fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.6 }}>
                            "{r.commentaire}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="profile-sidebar">
            <div className="booking-widget">
              {p.price && (
                <>
                  <div style={{ fontSize: "0.88rem", color: "var(--gray-500)", fontWeight: 600, marginBottom: 6 }}>Tarif horaire</div>
                  <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--navy)", marginBottom: 14 }}>
                    {p.price}€/h
                  </div>
                  <hr className="widget-sep" />
                </>
              )}
              <div className="booking-widget-rating">
                <span className="stars">{"★".repeat(Math.round(parseFloat(p.rating || 0)))}</span>
                <strong>{rating}</strong>
                <span>({p.reviews || 0} avis)</span>
              </div>
              <hr className="widget-sep" />

              <button
                className="btn-primary"
                onClick={() => isClient ? setShowChat(true) : navigate("/connexion")}
                style={{ width: "100%", padding: "15px", justifyContent: "center", marginBottom: 10 }}
              >
                💬 Réserver avec l'assistant
              </button>

              <button
                onClick={() => isClient ? setShowDevis(true) : navigate("/connexion")}
                style={{
                  width: "100%", padding: "13px", background: "#F3F4F6", color: "#374151",
                  border: "1.5px solid #E5E7EB", borderRadius: 12, fontWeight: 700,
                  cursor: "pointer", fontSize: "0.95rem"
                }}
              >
                📋 Demander un devis
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Chatbot pré-réservation */}
      {showChat && <PrebookingChat service={p.service} providerId={id} onClose={() => setShowChat(false)} />}

      {/* Modal devis */}
      {showDevis && (
        <div className="pb-overlay">
          <div className="pb-modal" style={{ maxWidth: 480 }}>
            <div className="pb-header">
              <span>📋 Demande de devis — {p.service}</span>
              <button onClick={() => { setShowDevis(false); setDevisSent(false); }}>✕</button>
            </div>
            {devisSent ? (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
                <h3 style={{ margin: "0 0 8px" }}>Devis envoyé !</h3>
                <p style={{ color: "var(--gray-500)" }}>Le prestataire vous répondra sous 24h. Consultez vos devis dans votre tableau de bord.</p>
                <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setShowDevis(false)}>Fermer</button>
              </div>
            ) : (
              <form onSubmit={submitDevis} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label>Décrivez votre besoin *</label>
                  <textarea rows={4} required placeholder="Ex: Je souhaite un nettoyage complet d'un appartement de 80m²…"
                    value={devisForm.description}
                    onChange={e => setDevisForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Date souhaitée</label>
                  <input type="date" value={devisForm.date_souhaitee}
                    min={new Date().toISOString().slice(0,10)}
                    onChange={e => setDevisForm(f => ({ ...f, date_souhaitee: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Message au prestataire</label>
                  <textarea rows={2} placeholder="Informations complémentaires…"
                    value={devisForm.message_client}
                    onChange={e => setDevisForm(f => ({ ...f, message_client: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={devisLoading} style={{ justifyContent: "center" }}>
                  {devisLoading ? "Envoi…" : "Envoyer la demande"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
