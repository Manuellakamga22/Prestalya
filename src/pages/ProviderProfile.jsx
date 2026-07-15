import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, API_ORIGIN } from "../api";
import SEO from "../components/SEO";
import "../styles/pages.css";

const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function getWeekDates(offset) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

const WEEK_SLOTS = ["08h00","09h00","10h00","11h00","12h00","13h00","14h00","15h00","16h00","17h00","18h00","19h00"];
const SLOT_LABEL = s => s.replace("h", "h") + "–" + (String(parseInt(s)+1).padStart(2,"0")) + "h00";

function DispoGrid({ disponibilites, selectedDate, selectedSlot, onSelect }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);
  const todayIso = new Date().toISOString().slice(0,10);

  const hasAnyDispo = weekDates.some(date =>
    WEEK_SLOTS.some(s => disponibilites[date]?.[s] === "disponible")
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setWeekOffset(w => w-1)} disabled={weekOffset === 0}
          style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #E5E7EB", background: "#fff", cursor: weekOffset===0 ? "not-allowed" : "pointer", fontWeight: 700, opacity: weekOffset===0 ? 0.4 : 1 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--gray-600)" }}>
          {(() => { const d1 = new Date(weekDates[0]); const d2 = new Date(weekDates[6]); return `${d1.getDate()}/${d1.getMonth()+1} – ${d2.getDate()}/${d2.getMonth()+1}`; })()}
        </span>
        <button onClick={() => setWeekOffset(w => w+1)}
          style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 700 }}>→</button>
        {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)}
          style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }}>Aujourd'hui</button>}
      </div>

      {!hasAnyDispo ? (
        <div style={{ textAlign: "center", padding: "24px", color: "var(--gray-400)", background: "#F9FAFB", borderRadius: 12 }}>
          <p style={{ margin: 0 }}>Aucun créneau disponible cette semaine.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 6px", fontSize: "0.8rem", color: "var(--gray-400)", textAlign: "left", borderBottom: "2px solid #E5E7EB", minWidth: 64 }}>Heure</th>
                {JOURS.map((j, i) => {
                  const isToday = weekDates[i] === todayIso;
                  const isPast = weekDates[i] < todayIso;
                  return (
                    <th key={j} style={{ padding: "8px 4px", textAlign: "center", fontSize: "0.82rem", fontWeight: 800,
                      color: isPast ? "#CBD5E1" : isToday ? "#7C3AED" : "var(--text)",
                      borderBottom: isToday ? "2px solid #7C3AED" : "2px solid #E5E7EB" }}>
                      {j}<br/>
                      <span style={{ fontSize: "0.72rem", fontWeight: 400, color: isPast ? "#CBD5E1" : "var(--gray-400)" }}>
                        {weekDates[i].slice(8)}/{weekDates[i].slice(5,7)}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {WEEK_SLOTS.map(slot => (
                <tr key={slot}>
                  <td style={{ padding: "5px 6px", fontSize: "0.78rem", color: "var(--gray-400)", whiteSpace: "nowrap", borderBottom: "1px solid #F3F4F6" }}>{slot}</td>
                  {weekDates.map((date, i) => {
                    const st = disponibilites[date]?.[slot];
                    const isPast = date < todayIso || (date === todayIso && parseInt(slot) <= new Date().getHours());
                    const isDispo = st === "disponible" && !isPast;
                    const isSelected = selectedDate === date && selectedSlot === slot;
                    return (
                      <td key={date} style={{ textAlign: "center", padding: "3px 2px", borderBottom: "1px solid #F3F4F6" }}>
                        {isDispo ? (
                          <button onClick={() => onSelect(date, slot)}
                            style={{
                              width: 28, height: 28, borderRadius: 6, border: isSelected ? "2px solid #7C3AED" : "1.5px solid #A78BFA",
                              background: isSelected ? "#7C3AED" : "#EDE9FE",
                              color: isSelected ? "#fff" : "#7C3AED",
                              cursor: "pointer", fontWeight: 800, fontSize: "0.7rem", transition: "all 0.15s"
                            }}>✓</button>
                        ) : st === "reserve" || st === "en_attente" ? (
                          <span style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>—</span>
                        ) : (
                          <span style={{ fontSize: "0.7rem", color: "#E5E7EB" }}>·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider]     = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [disponibilites, setDispo]  = useState({});
  const [isFav, setIsFav]           = useState(false);
  const [favLoad, setFavLoad]       = useState(false);
  const [loading, setLoading]       = useState(true);

  // booking inline
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [comment, setComment]           = useState("");
  const [booking, setBooking]           = useState(false);
  const [bookingDone, setBookingDone]   = useState(false);
  const [bookingError, setBookingError] = useState("");

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const isLoggedIn = !!user?.token;
  const isClient   = user?.role === "client";

  useEffect(() => {
    Promise.all([
      api.get(`/providers/${id}`),
      api.get(`/reviews/provider/${id}`).catch(() => []),
      api.get(`/disponibilites/${id}`).catch(() => ({})),
      isLoggedIn ? api.get("/favoris/ids").catch(() => []) : Promise.resolve([]),
    ]).then(([p, r, dispo, favIds]) => {
      setProvider(p);
      setReviews(Array.isArray(r) ? r : []);
      setDispo(typeof dispo === "object" && !Array.isArray(dispo) ? dispo : {});
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

  async function submitBooking(e) {
    e.preventDefault();
    if (!isLoggedIn) return navigate("/connexion");
    if (!selectedDate || !selectedSlot) { setBookingError("Choisissez un créneau dans le planning."); return; }
    setBooking(true);
    setBookingError("");
    try {
      await api.post("/bookings", {
        provider_id: id,
        service: provider.service,
        city: provider.city,
        date: selectedDate,
        slot: selectedSlot,
        comment,
      });
      setBookingDone(true);
    } catch (err) {
      setBookingError(err.message || "Erreur, veuillez réessayer.");
    } finally { setBooking(false); }
  }

  if (loading) return <div className="dash-loading">Chargement…</div>;
  if (!provider) return null;

  const p = provider;
  const fullName = `${p.prenom || ""} ${p.nom || ""}`.trim();
  const initials  = (p.prenom?.[0] || "") + (p.nom?.[0] || "");
  const rating    = parseFloat(p.rating || 0).toFixed(1);

  return (
    <main className="profile-page">
      <SEO
        title={`${fullName} — ${p.service}`}
        description={p.bio || `Prestataire ${p.service} à ${p.city}.`}
        path={`/prestataires/${id}`}
      />
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button className="profile-back" onClick={() => navigate(-1)}>← Retour</button>
          {isClient && (
            <button onClick={toggleFav} disabled={favLoad}
              style={{ background: isFav ? "#FEE2E2" : "#F3F4F6", color: isFav ? "#DC2626" : "#6B7280",
                border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
              {isFav ? "❤️ Sauvegardé" : "🤍 Sauvegarder"}
            </button>
          )}
        </div>

        <div className="profile-layout">
          {/* ── Colonne principale ── */}
          <div className="profile-card">

            {/* En-tête prestataire */}
            <div className="profile-top">
              {p.photo_url ? (
                <img className="profile-photo"
                  src={p.photo_url.startsWith("/") ? `${API_ORIGIN}${p.photo_url}` : p.photo_url}
                  alt={fullName}
                  onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
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
                    : <span className="badge-unavailable">● Indisponible</span>}
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
              {/* Annonce */}
              {p.bio && (
                <div className="profile-section">
                  <h3>📢 Son annonce</h3>
                  <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{p.bio}</p>
                </div>
              )}

              {/* Disponibilités */}
              <div className="profile-section">
                <h3>📅 Ses créneaux disponibles</h3>
                <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: 16 }}>
                  Cliquez sur un créneau violet <span style={{ background: "#EDE9FE", color: "#7C3AED", borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>✓</span> pour le sélectionner.
                </p>
                <DispoGrid
                  disponibilites={disponibilites}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelect={(date, slot) => { setSelectedDate(date); setSelectedSlot(slot); setBookingError(""); }}
                />
              </div>

              {/* Avis */}
              <div className="profile-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Avis clients</h3>
                  {reviews.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF9C3", borderRadius: 10, padding: "6px 14px" }}>
                      <span style={{ color: "#F59E0B" }}>★</span>
                      <span style={{ fontWeight: 800 }}>{(reviews.reduce((s,r) => s+r.note,0)/reviews.length).toFixed(1)}</span>
                      <span style={{ color: "#6B7280", fontSize: "0.85rem" }}>({reviews.length})</span>
                    </div>
                  )}
                </div>
                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>⭐</div>
                    <p style={{ margin: 0 }}>Aucun avis pour l'instant.</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map(r => (
                      <div key={r.id} className="review-item" style={{ borderLeft: "3px solid #F59E0B" }}>
                        <div className="review-header" style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <span className="review-author" style={{ fontWeight: 700 }}>{r.client_name || "Client vérifié"}</span>
                            {r.created_at && <span style={{ display: "block", fontSize: "0.78rem", color: "#9CA3AF", marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>}
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ color: s<=r.note ? "#F59E0B" : "#D1D5DB", fontSize: "1.05rem" }}>★</span>)}
                          </div>
                        </div>
                        {r.commentaire && <p className="review-text" style={{ margin: "10px 0 0", fontStyle: "italic" }}>"{r.commentaire}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar réservation ── */}
          <aside className="profile-sidebar">
            <div className="booking-widget">
              {p.tarif_horaire || p.price ? (
                <>
                  <div style={{ fontSize: "0.88rem", color: "var(--gray-500)", fontWeight: 600, marginBottom: 6 }}>Tarif horaire</div>
                  <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--navy)", marginBottom: 14 }}>
                    {p.tarif_horaire || p.price}€/h
                  </div>
                  <hr className="widget-sep" />
                </>
              ) : null}
              <div className="booking-widget-rating">
                <span className="stars">{"★".repeat(Math.round(parseFloat(p.rating||0)))}</span>
                <strong>{rating}</strong>
                <span>({p.reviews||0} avis)</span>
              </div>
              <hr className="widget-sep" />

              {bookingDone ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 800, color: "#065F46", marginBottom: 4 }}>Demande envoyée !</p>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.88rem", marginBottom: 16 }}>
                    {fullName} va recevoir votre demande et peut accepter ou refuser. Le chat s'ouvrira dès l'acceptation.
                  </p>
                  <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => navigate("/dashboard")}>
                    Voir mes réservations →
                  </button>
                </div>
              ) : (
                <form onSubmit={submitBooking} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 8, color: "var(--text)" }}>Créneau sélectionné</p>
                    {selectedDate && selectedSlot ? (
                      <div style={{ background: "#EDE9FE", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, color: "#5B21B6", fontSize: "0.92rem" }}>
                            {new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                          <p style={{ margin: "2px 0 0", color: "#7C3AED", fontWeight: 700, fontSize: "0.9rem" }}>{selectedSlot.replace("h","h")}–{String(parseInt(selectedSlot)+1).padStart(2,"0")}h00</p>
                        </div>
                        <button type="button" onClick={() => { setSelectedDate(""); setSelectedSlot(""); }}
                          style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                      </div>
                    ) : (
                      <p style={{ color: "var(--gray-400)", fontSize: "0.88rem", fontStyle: "italic", background: "#F9FAFB", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                        ← Choisissez un créneau dans le planning
                      </p>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: "0.88rem" }}>Message (optionnel)</label>
                    <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Précisez votre besoin…"
                      style={{ fontSize: "0.88rem", resize: "vertical" }} />
                  </div>

                  {bookingError && (
                    <p style={{ color: "#DC2626", fontWeight: 600, fontSize: "0.88rem", margin: 0 }}>{bookingError}</p>
                  )}

                  <button type="submit" className="btn-primary" disabled={booking || !selectedDate || !selectedSlot}
                    style={{ width: "100%", padding: "14px", justifyContent: "center", opacity: (!selectedDate||!selectedSlot) ? 0.6 : 1 }}>
                    {booking ? "Envoi…" : !isClient ? "Se connecter pour réserver" : "📩 Envoyer la demande"}
                  </button>
                  <p style={{ fontSize: "0.78rem", color: "var(--gray-400)", textAlign: "center", margin: 0 }}>
                    Le prestataire peut accepter ou refuser. Le chat s'ouvre après acceptation.
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
