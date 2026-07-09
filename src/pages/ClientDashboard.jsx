import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, API_ORIGIN } from "../api";
import SEO from "../components/SEO";
import "../styles/dashboard.css";

const STATUS_LABEL = { en_attente: "En attente", propose: "Créneau proposé", accepte: "Accepté — à confirmer", refuse: "Refusé", confirme: "Confirmé", annule: "Annulé", termine: "Terminé" };
const STATUS_COLOR = { en_attente: "#F59E0B", propose: "#EA580C", accepte: "#2563EB", refuse: "#DC2626", confirme: "#059669", annule: "#DC2626", termine: "#7C3AED" };
const STATUS_BG    = { en_attente: "#FEF3C7", propose: "#FFEDD5", accepte: "#DBEAFE", refuse: "#FEE2E2", confirme: "#D1FAE5", annule: "#FEE2E2", termine: "#EDE9FE" };

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [convs, setConvs]         = useState([]);
  const [tab, setTab]             = useState("apercu");
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilter] = useState("tous");
  const [avisModal, setAvisModal] = useState(null);
  const [avisForm, setAvisForm]   = useState({ note: 5, commentaire: "" });
  const [avisSent, setAvisSent]   = useState({});
  const [avisLoading, setAvisLoad]= useState(false);
  const [photoUrl, setPhotoUrl]   = useState(null);
  const [photoLoad, setPhotoLoad] = useState(false);
  const [photoMsg, setPhotoMsg]   = useState(null);
  const photoInputRef = React.useRef(null);

  // recherche
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchCity, setSearchCity]     = useState("");
  const [searchResults, setSearchRes]   = useState([]);
  const [searchDone, setSearchDone]     = useState(false);
  const [searchLoading, setSearchLoad]  = useState(false);

  // devis
  const [mesDev, setMesDev]             = useState([]);
  const [devLoad, setDevLoad]           = useState(false);

  // favoris
  const [favoris, setFavoris]           = useState([]);
  const [favLoad, setFavLoad]           = useState(false);

  // parrainage
  const [referralCode, setReferralCode] = useState("");
  const [rewards, setRewards]           = useState([]);
  const [credit, setCredit]             = useState(0);
  const [inputCode, setInputCode]       = useState("");
  const [codeMsg, setCodeMsg]           = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/connexion"); return; }
    const u = JSON.parse(stored);
    if (u.role === "admin") { navigate("/admin"); return; }
    if (u.role === "prestataire") { navigate("/prestataire"); return; }
    setUser(u);
    setPhotoUrl(u.photo_url || null);
    Promise.all([api.get("/bookings/me"), api.get("/chat")])
      .then(([b, c]) => { setBookings(b); setConvs(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function cancelBooking(id) {
    if (!confirm("Annuler cette réservation ?")) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status: "annule" });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "annule" } : b));
    } catch (e) { alert(e.message); }
  }

  const [bookingActionId, setBookingActionId] = useState(null);

  async function repondreProposition(id, accept) {
    setBookingActionId(id);
    try {
      const updated = await api.post(`/bookings/${id}/repondre-proposition`, { accept });
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
    } catch (e) { alert(e.message); }
    finally { setBookingActionId(null); }
  }

  async function confirmerPrestation(id) {
    setBookingActionId(id);
    try {
      const updated = await api.post(`/bookings/${id}/confirmer`, {});
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
    } catch (e) { alert(e.message); }
    finally { setBookingActionId(null); }
  }

  // Paiement Stripe (avec déduction automatique du crédit de parrainage disponible)
  async function payerEtConfirmer(id) {
    setBookingActionId(id);
    try {
      const res = await api.post(`/payments/${id}/payer`, {});
      if (res.paidWithCredit) {
        // Entièrement couvert par le crédit parrainage : pas de redirection Stripe nécessaire
        const b = await api.get("/bookings/me").catch(() => []);
        setBookings(b);
        setBookingActionId(null);
        alert("Réservation payée avec votre crédit de parrainage !");
        return;
      }
      window.location.href = res.url;
    } catch (e) { alert(e.message); setBookingActionId(null); }
  }

  async function submitAvis(e) {
    e.preventDefault();
    setAvisLoad(true);
    try {
      await api.post("/reviews", { booking_id: avisModal.id, note: avisForm.note, commentaire: avisForm.commentaire });
      setAvisSent(prev => ({ ...prev, [avisModal.id]: true }));
      setAvisModal(null);
      setAvisForm({ note: 5, commentaire: "" });
    } catch (e) { alert(e.message); }
    finally { setAvisLoad(false); }
  }

  useEffect(() => {
    if (tab !== "devis") return;
    setDevLoad(true);
    api.get("/devis/mes-devis").then(setMesDev).catch(() => {}).finally(() => setDevLoad(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== "favoris") return;
    setFavLoad(true);
    api.get("/favoris").then(setFavoris).catch(() => {}).finally(() => setFavLoad(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== "parrainage") return;
    Promise.all([api.get("/parrainage/mon-code"), api.get("/parrainage/recompenses")])
      .then(([c, r]) => { setReferralCode(c.code); setRewards(r.rewards || []); setCredit(r.credit || 0); })
      .catch(() => {});
  }, [tab]);

  async function uploadPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoad(true); setPhotoMsg(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
      const res = await fetch(`${API_ORIGIN}/api/users/photo`, {
        method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
      setPhotoUrl(data.url);
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...u, photo_url: data.url }));
      setPhotoMsg({ ok: true, text: "Photo mise à jour !" });
    } catch (err) { setPhotoMsg({ ok: false, text: err.message || "Erreur upload" }); }
    finally { setPhotoLoad(false); }
  }

  async function appliquerCode() {
    if (!inputCode.trim()) return;
    try {
      const res = await api.post("/parrainage/appliquer", { code: inputCode.trim().toUpperCase() });
      setCodeMsg({ ok: true, text: res.message });
    } catch (e) { setCodeMsg({ ok: false, text: e.message }); }
  }

  async function removeFavori(provider_id) {
    await api.post(`/favoris/${provider_id}`);
    setFavoris(prev => prev.filter(f => f.id !== provider_id));
  }

  async function acceptDevis(id) {
    try {
      const updated = await api.patch(`/devis/${id}/statut`, { status: "accepte" });
      setMesDev(prev => prev.map(d => d.id === id ? updated : d));
    } catch (e) { alert(e.message); }
  }

  async function refuseDevis(id) {
    try {
      const updated = await api.patch(`/devis/${id}/statut`, { status: "refuse" });
      setMesDev(prev => prev.map(d => d.id === id ? updated : d));
    } catch (e) { alert(e.message); }
  }

  async function rechercherService(e) {
    e.preventDefault();
    if (!searchQuery.trim() && !searchCity.trim()) return;
    setSearchLoad(true);
    setSearchDone(false);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("service", searchQuery.trim());
      if (searchCity.trim())  params.append("city", searchCity.trim());
      const data = await api.get(`/providers?${params.toString()}`);
      const list = Array.isArray(data) ? data : (data.providers || []);
      const q = searchQuery.toLowerCase();
      const filtered = list.filter(p => {
        const name = `${p.prenom || ""} ${p.nom || ""}`.toLowerCase();
        const svc  = (p.service || "").toLowerCase();
        const city = (p.city || "").toLowerCase();
        const matchQ    = !searchQuery || name.includes(q) || svc.includes(q);
        const matchCity = !searchCity  || city.includes(searchCity.toLowerCase());
        return matchQ && matchCity;
      });
      setSearchRes(filtered);
      setSearchDone(true);
    } catch { setSearchRes([]); setSearchDone(true); }
    finally { setSearchLoad(false); }
  }

  const unread   = convs.filter(c => (c.unread || c.unreadClient || 0) > 0).length;
  const upcoming = bookings.filter(b => b.status === "confirme").sort((a, b) => new Date(a.date) - new Date(b.date));
  const filtered = filterStatus === "tous" ? bookings : bookings.filter(b => b.status === filterStatus);
  const kpis = [
    { icon: "📋", val: bookings.length,                                     label: "Total",      color: "#6366F1" },
    { icon: "⏳", val: bookings.filter(b => b.status === "en_attente").length, label: "En attente", color: "#F59E0B" },
    { icon: "✅", val: bookings.filter(b => b.status === "confirme").length,  label: "Confirmées", color: "#059669" },
    { icon: "🎉", val: bookings.filter(b => b.status === "termine").length,   label: "Terminées",  color: "#7C3AED" },
  ];

  if (loading) return <div className="dash-loading">Chargement…</div>;

  return (
    <main className="dash-page">
      <SEO title="Mon espace client" description="Gérez vos réservations et messages sur Prestalya." path="/dashboard" />

      {avisModal && (
        <div className="dash-modal-overlay" onClick={() => setAvisModal(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>Laisser un avis</h3>
                <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", margin: "4px 0 0" }}>
                  {avisModal.service} · {avisModal.provider_name || "Prestataire"}
                </p>
              </div>
              <button onClick={() => setAvisModal(null)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--gray-400)" }}>×</button>
            </div>
            <form onSubmit={submitAvis}>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>Votre note</p>
              <div className="dash-stars-row">
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} className={`dash-star ${n <= avisForm.note ? "on" : ""}`} onClick={() => setAvisForm({ ...avisForm, note: n })}>★</span>
                ))}
                <span style={{ marginLeft: 10, fontWeight: 800, fontSize: "1.1rem", color: "#F59E0B" }}>{avisForm.note}/5</span>
              </div>
              <div className="form-group" style={{ marginTop: 18 }}>
                <label>Commentaire (optionnel)</label>
                <textarea rows={4} value={avisForm.commentaire} onChange={e => setAvisForm({ ...avisForm, commentaire: e.target.value })} placeholder="Décrivez votre expérience…" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button type="submit" className="btn-primary" disabled={avisLoading} style={{ flex: 1, justifyContent: "center" }}>
                  {avisLoading ? "Envoi…" : "Publier l'avis"}
                </button>
                <button type="button" onClick={() => setAvisModal(null)} style={{ flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "none", fontWeight: 600, cursor: "pointer" }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-avatar" style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", overflow: "hidden", cursor: "pointer", position: "relative" }}
            onClick={() => photoInputRef.current?.click()} title="Changer la photo">
            {photoUrl
              ? <img src={`${API_ORIGIN}${photoUrl}`} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} onError={e => e.target.style.display="none"} />
              : <span style={{ fontSize: "1.4rem" }}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>
            }
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", opacity: 0, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
              <span style={{ color: "#fff", fontSize: "1.2rem" }}>📷</span>
            </div>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadPhoto} />
          <p className="dash-name">{user?.prenom} {user?.nom}</p>
          <span className="dash-badge" style={{ background: "#EEF2FF", color: "#4F46E5", marginBottom: 12 }}>Client</span>
          <nav className="dash-nav">
            {[
              { key: "apercu",        icon: "🏠", label: "Aperçu" },
              { key: "recherche",     icon: "🔍", label: "Rechercher" },
              { key: "devis",         icon: "📋", label: "Mes devis" },
              { key: "favoris",       icon: "❤️", label: "Favoris" },
              { key: "reservations",  icon: "🗓️", label: "Réservations" },
              { key: "messages",      icon: "💬", label: "Messages", badge: unread },
              { key: "parrainage",    icon: "🎁", label: "Parrainage" },
              { key: "profil",        icon: "👤", label: "Mon profil" },
            ].map(n => (
              <button key={n.key} className={tab === n.key ? "active" : ""} onClick={() => setTab(n.key)}>
                {n.icon} {n.label}
                {n.badge > 0 && <span className="dash-conv-unread" style={{ marginLeft: 6 }}>{n.badge}</span>}
              </button>
            ))}
          </nav>
          <Link to="/reservation" className="btn-primary dash-cta" style={{ textAlign: "center", justifyContent: "center" }}>
            + Nouvelle réservation
          </Link>
          <button className="dash-logout" onClick={() => { localStorage.removeItem("user"); navigate("/"); }}>Se déconnecter</button>
        </aside>

        <div className="dash-content">

          {/* ── APERÇU ── */}
          {tab === "apercu" && (
            <>
              <div className="dash-welcome">
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Bonjour, {user?.prenom} 👋</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>Voici un résumé de votre activité</p>
                </div>
                <Link to="/reservation" className="btn-primary" style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff" }}>
                  + Réserver
                </Link>
              </div>

              <div className="dash-kpi-grid">
                {kpis.map(k => (
                  <div key={k.label} className="dash-kpi-card" style={{ borderTop: `3px solid ${k.color}` }}>
                    <span className="dash-kpi-icon" style={{ color: k.color }}>{k.icon}</span>
                    <span className="dash-kpi-val">{k.val}</span>
                    <span className="dash-kpi-label">{k.label}</span>
                  </div>
                ))}
              </div>

              {upcoming.length > 0 && (
                <div className="dash-section">
                  <h3 className="dash-section-title">Prochain rendez-vous</h3>
                  <div className="dash-next-booking">
                    <div className="dash-next-date">
                      <span className="dash-next-day">{new Date(upcoming[0].date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
                      <span className="dash-next-slot">{upcoming[0].slot || "—"}</span>
                    </div>
                    <div className="dash-next-info">
                      <p className="dash-next-service">{upcoming[0].service}</p>
                      <p className="dash-next-provider">{upcoming[0].provider_name || "Prestataire affecté"}</p>
                    </div>
                    <span className="dash-badge" style={{ background: STATUS_BG.confirme, color: STATUS_COLOR.confirme }}>Confirmé ✓</span>
                  </div>
                </div>
              )}

              <div className="dash-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 className="dash-section-title" style={{ margin: 0 }}>Dernières réservations</h3>
                  <button className="dash-link-btn" onClick={() => setTab("reservations")}>Voir tout →</button>
                </div>
                {bookings.length === 0 ? (
                  <div className="dash-empty">
                    <p>Aucune réservation pour l'instant.</p>
                    <button className="btn-primary" onClick={() => setTab("recherche")} style={{ marginTop: 12 }}>🔍 Chercher un prestataire</button>
                  </div>
                ) : (
                  <div className="dash-booking-cards">
                    {bookings.slice(0, 3).map(b => (
                      <div key={b.id} className="dash-booking-card">
                        <div className="dash-booking-card-left">
                          <span className="dash-booking-icon">🔧</span>
                          <div>
                            <p className="dash-booking-service">{b.service}</p>
                            <p className="dash-booking-meta">{new Date(b.date).toLocaleDateString("fr-FR")}{b.slot ? ` · ${b.slot}` : ""}</p>
                          </div>
                        </div>
                        <span className="dash-badge" style={{ background: STATUS_BG[b.status], color: STATUS_COLOR[b.status] }}>
                          {STATUS_LABEL[b.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── RECHERCHE ── */}
          {tab === "recherche" && (
            <div className="dash-section">
              <h2>Trouver un prestataire</h2>
              <p style={{ color: "var(--gray-500)", marginBottom: 20 }}>Recherchez par service ou par ville.</p>

              <form onSubmit={rechercherService} className="dash-search-form">
                <div className="dash-search-fields">
                  <div className="dash-search-field">
                    <span className="dash-search-field-icon">🔧</span>
                    <input
                      className="dash-search-field-input"
                      placeholder="Service (ex : ménage, plomberie…)"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="dash-search-field">
                    <span className="dash-search-field-icon">📍</span>
                    <input
                      className="dash-search-field-input"
                      placeholder="Ville (ex : Paris, Lyon…)"
                      value={searchCity}
                      onChange={e => setSearchCity(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={searchLoading} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                  {searchLoading ? "Recherche…" : "🔍 Rechercher"}
                </button>
              </form>

              {searchDone && (
                <div style={{ marginTop: 28 }}>
                  <p style={{ fontWeight: 700, marginBottom: 14, color: "var(--gray-600)" }}>
                    {searchResults.length} prestataire{searchResults.length !== 1 ? "s" : ""} trouvé{searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.length === 0 ? (
                    <div className="dash-empty">
                      <p>Aucun prestataire trouvé pour ces critères.</p>
                      <p style={{ fontSize: "0.88rem", color: "var(--gray-400)", marginTop: 6 }}>Essayez un autre service ou une autre ville.</p>
                    </div>
                  ) : (
                    <div className="dash-provider-results">
                      {searchResults.map(p => (
                        <div key={p.id} className="dash-provider-card">
                          <div className="dash-provider-card-avatar">
                            {p.photo_url
                              ? <img src={`${API_ORIGIN}${p.photo_url}`} alt={p.prenom} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                              : <span>{p.prenom?.[0]}{p.nom?.[0]}</span>
                            }
                          </div>
                          <div className="dash-provider-card-info">
                            <p className="dash-provider-card-name">{p.prenom} {p.nom}</p>
                            <p className="dash-provider-card-service">{p.service}</p>
                            <p className="dash-provider-card-city">📍 {p.city}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                              <span style={{ color: "#F59E0B" }}>{"★".repeat(Math.round(parseFloat(p.rating || 0)))}</span>
                              <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{parseFloat(p.rating || 0).toFixed(1)}</span>
                              <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>({p.reviews || 0} avis)</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            {p.price && <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.05rem" }}>{p.price}€/h</span>}
                            <span className="dash-badge" style={{ background: p.available ? "#D1FAE5" : "#FEE2E2", color: p.available ? "#065f46" : "#991b1b" }}>
                              {p.available ? "Disponible" : "Indisponible"}
                            </span>
                            <button
                              className="btn-primary"
                              style={{ padding: "7px 16px", fontSize: "0.88rem" }}
                              onClick={() => navigate(`/reservation?provider=${p.id}`)}
                              disabled={!p.available}
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── MES DEVIS ── */}
          {tab === "devis" && (
            <div className="dash-section">
              <h2>📋 Mes demandes de devis <span className="dash-count">{mesDev.length}</span></h2>
              {devLoad ? <p style={{ color: "var(--gray-400)" }}>Chargement…</p> :
               mesDev.length === 0 ? (
                <div className="dash-empty">
                  <p>Aucune demande de devis envoyée.</p>
                  <button className="btn-primary" onClick={() => navigate("/prestataires")} style={{ marginTop: 12 }}>Trouver un prestataire →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {mesDev.map(d => (
                    <div key={d.id} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <p style={{ margin: "0 0 4px", fontWeight: 800 }}>{d.provider_prenom} {d.provider_nom}</p>
                          <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "0.88rem" }}>{d.service} · {d.provider_city}</p>
                        </div>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
                          background: d.status === "en_attente" ? "#FEF3C7" : d.status === "envoye" ? "#EEF2FF" : d.status === "accepte" ? "#D1FAE5" : "#FEE2E2",
                          color: d.status === "en_attente" ? "#92400E" : d.status === "envoye" ? "#4338CA" : d.status === "accepte" ? "#065F46" : "#991B1B"
                        }}>
                          {d.status === "en_attente" ? "⏳ En attente" : d.status === "envoye" ? "📩 Devis reçu" : d.status === "accepte" ? "✅ Accepté" : "❌ Refusé"}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>{d.description}</p>
                      {d.montant && (
                        <div style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
                          <p style={{ margin: "0 0 4px", fontWeight: 800, color: "#4F46E5" }}>Devis proposé : {d.montant}€</p>
                          {d.message_provider && <p style={{ margin: 0, fontSize: "0.85rem", color: "#374151" }}>{d.message_provider}</p>}
                        </div>
                      )}
                      {d.status === "envoye" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button onClick={() => acceptDevis(d.id)} className="btn-primary" style={{ padding: "9px 20px", justifyContent: "center" }}>✅ Accepter</button>
                          <button onClick={() => refuseDevis(d.id)} style={{ padding: "9px 20px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>❌ Refuser</button>
                        </div>
                      )}
                      {d.status === "accepte" && (
                        <button className="btn-primary" style={{ marginTop: 8, justifyContent: "center" }}
                          onClick={() => navigate(`/reservation?provider=${d.provider_id}&service=${encodeURIComponent(d.service)}`)}>
                          Réserver maintenant →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FAVORIS ── */}
          {tab === "favoris" && (
            <div className="dash-section">
              <h2>❤️ Mes prestataires favoris <span className="dash-count">{favoris.length}</span></h2>
              {favLoad ? <p style={{ color: "var(--gray-400)" }}>Chargement…</p> :
               favoris.length === 0 ? (
                <div className="dash-empty">
                  <p>Aucun favori sauvegardé.</p>
                  <button className="btn-primary" onClick={() => navigate("/prestataires")} style={{ marginTop: 12 }}>Explorer les prestataires →</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                  {favoris.map(p => (
                    <div key={p.id} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "18px", position: "relative" }}>
                      <button onClick={() => removeFavori(p.id)}
                        style={{ position: "absolute", top: 12, right: 12, background: "#FEE2E2", border: "none", color: "#DC2626", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: "0.85rem" }}>✕</button>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>
                          {p.prenom?.[0]}{p.nom?.[0]}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800 }}>{p.prenom} {p.nom}</p>
                          <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "0.82rem" }}>{p.service} · {p.city}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                        <span style={{ color: "#F59E0B" }}>{"★".repeat(Math.round(parseFloat(p.rating||0)))}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{parseFloat(p.rating||0).toFixed(1)}</span>
                      </div>
                      <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "9px" }}
                        onClick={() => navigate(`/prestataires/${p.id}`)}>
                        Voir le profil →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PARRAINAGE ── */}
          {tab === "parrainage" && (
            <div className="dash-section">
              <h2>🎁 Programme de parrainage</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>
                <div style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", borderRadius: 16, padding: "24px", color: "#fff", textAlign: "center" }}>
                  <p style={{ margin: "0 0 8px", opacity: 0.85, fontSize: "0.9rem" }}>Mon code parrainage</p>
                  <p style={{ margin: "0 0 16px", fontSize: "2rem", fontWeight: 900, letterSpacing: "0.15em" }}>{referralCode || "…"}</p>
                  <button onClick={() => { navigator.clipboard.writeText(referralCode); }}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>
                    📋 Copier
                  </button>
                </div>
                <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 16, padding: "24px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 8px", color: "#065F46", fontSize: "0.9rem", fontWeight: 600 }}>Crédit disponible</p>
                  <p style={{ margin: 0, fontSize: "2.4rem", fontWeight: 900, color: "#059669" }}>{credit.toFixed(2)}€</p>
                </div>
              </div>

              <div style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "20px", marginBottom: 24 }}>
                <p style={{ fontWeight: 800, marginBottom: 12 }}>Vous avez un code parrainage ?</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Ex: AB3C9EF1" maxLength={12}
                    style={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em" }}
                  />
                  <button onClick={appliquerCode} className="btn-primary" style={{ padding: "10px 22px", justifyContent: "center" }}>Appliquer</button>
                </div>
                {codeMsg && <p style={{ marginTop: 8, fontWeight: 700, color: codeMsg.ok ? "#059669" : "#DC2626" }}>{codeMsg.text}</p>}
              </div>

              <h3 style={{ marginBottom: 14 }}>Mes parrainages ({rewards.length})</h3>
              {rewards.length === 0 ? (
                <div className="dash-empty"><p>Partagez votre code pour gagner 10€ par filleul !</p></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {rewards.map(r => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 10 }}>
                      <span style={{ fontWeight: 700 }}>{r.prenom} {r.nom}</span>
                      <span style={{ fontWeight: 800, color: "#059669" }}>+{r.credit}€</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RÉSERVATIONS ── */}
          {tab === "reservations" && (
            <div className="dash-section">
              <h2>Mes réservations <span className="dash-count">{filtered.length}</span></h2>
              <div className="dash-filter-tabs">
                {[
                  { key: "tous",       label: "Toutes" },
                  { key: "en_attente", label: "En attente" },
                  { key: "propose",    label: "Proposées" },
                  { key: "accepte",    label: "À confirmer" },
                  { key: "confirme",   label: "Confirmées" },
                  { key: "termine",    label: "Terminées" },
                  { key: "annule",     label: "Annulées" },
                ].map(f => (
                  <button key={f.key} className={`dash-filter-tab ${filterStatus === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="dash-empty"><p>Aucune réservation dans cette catégorie.</p></div>
              ) : (
                <div className="dash-booking-list">
                  {filtered.map(b => (
                    <div key={b.id} className="dash-booking-row">
                      <div className="dash-booking-row-date">
                        <span>{new Date(b.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{b.slot || "—"}</span>
                      </div>
                      <div className="dash-booking-row-body">
                        <p className="dash-booking-service">{b.service}</p>
                        <p className="dash-booking-meta">{b.provider_name || "Prestataire non assigné"}</p>
                        {b.status === "propose" && b.propose_date && (
                          <p style={{ fontSize: "0.8rem", color: "#EA580C", margin: "4px 0 0" }}>
                            Nouveau créneau proposé : {new Date(b.propose_date).toLocaleDateString("fr-FR")} · {b.propose_slot}
                          </p>
                        )}
                      </div>
                      <span className="dash-badge" style={{ background: STATUS_BG[b.status], color: STATUS_COLOR[b.status] }}>
                        {STATUS_LABEL[b.status]}
                      </span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {b.status === "en_attente" && (
                          <button className="dash-btn-cancel" onClick={() => cancelBooking(b.id)}>Annuler</button>
                        )}
                        {b.status === "propose" && (
                          <>
                            <button className="dash-btn-action green" disabled={bookingActionId === b.id} onClick={() => repondreProposition(b.id, true)}>✅ Accepter</button>
                            <button className="dash-btn-cancel" disabled={bookingActionId === b.id} onClick={() => repondreProposition(b.id, false)}>✕ Refuser</button>
                          </>
                        )}
                        {b.status === "accepte" && parseFloat(b.montant_ht) > 0 && (
                          <button className="dash-btn-action green" disabled={bookingActionId === b.id} onClick={() => payerEtConfirmer(b.id)}>
                            {bookingActionId === b.id ? "…" : `💳 Payer ${parseFloat(b.montant_ht).toFixed(2)}€ et confirmer`}
                          </button>
                        )}
                        {b.status === "accepte" && !(parseFloat(b.montant_ht) > 0) && (
                          <button className="dash-btn-action green" disabled={bookingActionId === b.id} onClick={() => confirmerPrestation(b.id)}>✅ Confirmer la prestation</button>
                        )}
                        {b.status === "termine" && !avisSent[b.id] && (
                          <button className="dash-btn-action green" onClick={() => setAvisModal(b)}>⭐ Avis</button>
                        )}
                        {b.status === "termine" && avisSent[b.id] && (
                          <span style={{ color: "var(--green)", fontWeight: 700, fontSize: "0.85rem" }}>✓ Publié</span>
                        )}
                        {(b.status === "termine" || b.status === "confirme") && (
                          <a
                            href={`/api/factures/${b.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="dash-btn-action"
                            style={{ textDecoration: "none", background: "#EDE9FE", color: "#7C3AED" }}
                            onClick={e => {
                              const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
                              if (!token) { e.preventDefault(); return; }
                              e.preventDefault();
                              fetch(`${API_ORIGIN}/api/factures/${b.id}`, { headers: { Authorization: `Bearer ${token}` } })
                                .then(r => r.blob())
                                .then(blob => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `facture_${b.id.slice(0,8).toUpperCase()}.pdf`; a.click(); })
                                .catch(() => alert("Erreur génération facture"));
                            }}
                          >📄 Facture</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {tab === "messages" && (
            <div className="dash-section">
              <h2>Messages {unread > 0 && <span className="dash-count" style={{ background: "#DC2626" }}>{unread} non lus</span>}</h2>
              {convs.length === 0 ? (
                <div className="dash-empty"><p>Aucun message. Réservez un prestataire pour démarrer une conversation.</p></div>
              ) : (
                <div className="dash-conv-list">
                  {convs.map(c => (
                    <div key={c._id} className="dash-conv-item" onClick={() => navigate(`/chat/${c._id}`)}>
                      <div className="dash-conv-avatar" style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", overflow: "hidden" }}>
                        {c.other_photo
                          ? <img src={`${API_ORIGIN}${c.other_photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (c.other_name?.[0] || "P")}
                      </div>
                      <div className="dash-conv-info">
                        <p className="dash-conv-name">{c.other_name || "Prestataire"}</p>
                        <p className="dash-conv-last">{c.lastMessage || "Nouvelle conversation"}</p>
                      </div>
                      {(c.unread || 0) > 0 && <span className="dash-conv-unread">{c.unread}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFIL ── */}
          {tab === "profil" && (
            <div className="dash-section">
              <h2>Mon profil</h2>
              <div className="dash-profil-hero">
                <div className="dash-photo-wrap" onClick={() => photoInputRef.current?.click()} title="Cliquez pour changer la photo">
                  <div className="dash-profil-avatar-lg" style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", overflow: "hidden", cursor: "pointer", position: "relative" }}>
                    {photoUrl
                      ? <img src={`${API_ORIGIN}${photoUrl}`} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                      : <span style={{ fontSize: "1.6rem" }}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>
                    }
                    <div className="dash-photo-overlay">📷</div>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: "var(--gray-400)", textAlign: "center" }}>Cliquez pour changer</p>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{user?.prenom} {user?.nom}</h3>
                  <span className="dash-badge" style={{ background: "#EEF2FF", color: "#4F46E5" }}>Client</span>
                  {photoMsg && <p style={{ margin: "8px 0 0", fontWeight: 700, fontSize: "0.88rem", color: photoMsg.ok ? "#059669" : "#DC2626" }}>{photoMsg.text}</p>}
                  {photoLoad && <p style={{ margin: "8px 0 0", color: "var(--gray-400)", fontSize: "0.88rem" }}>Upload en cours…</p>}
                </div>
              </div>
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={uploadPhoto} />
              <div className="dash-profil-grid">
                {[
                  ["Prénom",       user?.prenom],
                  ["Nom",          user?.nom],
                  ["Email",        user?.email],
                  ["Réservations", `${bookings.length} au total`],
                  ["Terminées",    `${bookings.filter(b => b.status === "termine").length} prestations`],
                ].map(([label, val]) => (
                  <div key={label} className="dash-profil-field">
                    <span className="dash-profil-field-label">{label}</span>
                    <span className="dash-profil-field-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
