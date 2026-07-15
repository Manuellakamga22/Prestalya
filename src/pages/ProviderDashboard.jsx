import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { services as ALL_SERVICES } from "../data";
import { api, API_ORIGIN } from "../api";
import SEO from "../components/SEO";
import "../styles/dashboard.css";

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

const ALL_SLOTS = ["08h00","09h00","10h00","11h00","12h00","13h00","14h00","15h00","16h00","17h00","18h00","19h00"];

// Statuts de créneau : disponible (absent) | indisponible (bloqué manuellement) | en_attente (demande reçue) | reserve (confirmé)
const SLOT_STATUS_STYLE = {
  absent:       { bg: "#F9FAFB", border: "#E5E7EB", color: "#9CA3AF", label: "Non défini" },
  disponible:   { bg: "#F0FDF4", border: "#D1FAE5", color: "#065F46", label: "Disponible" },
  en_attente:   { bg: "#FEF3C7", border: "#D97706", color: "#D97706", label: "En attente" },
  reserve:      { bg: "#DBEAFE", border: "#2563EB", color: "#2563EB", label: "Réservé" },
};

function ProviderCalendar({ year, month, blockedDates, onToggleSlot, onPrev, onNext, loading }) {
  const today = new Date().toISOString().slice(0,10);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const [popup, setPopup] = useState(null); // iso date sélectionnée

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const slotsForDay = (iso) => (blockedDates && blockedDates[iso]) ? blockedDates[iso] : {};
  const slotStatus = (iso, slot) => slotsForDay(iso)[slot] || "absent";

  const dayStatus = (iso) => {
    const slots = slotsForDay(iso);
    const disponibles = Object.values(slots).filter(s => s === "disponible").length;
    const reserves = Object.values(slots).filter(s => s === "en_attente" || s === "reserve").length;
    if (disponibles === 0 && reserves === 0) return "vide";
    if (disponibles + reserves >= ALL_SLOTS.length) return "plein";
    return "partiel";
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <div className="mini-cal" style={{ maxWidth: 420 }}>
        <div className="mini-cal-nav">
          <button onClick={onPrev}>‹</button>
          <span style={{ fontWeight: 800 }}>{MONTHS_FR[month]} {year}</span>
          <button onClick={onNext}>›</button>
        </div>
        <div className="mini-cal-grid">
          {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d => <div key={d} className="mini-cal-dow">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const iso = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const isPast = iso < today;
            const status = dayStatus(iso);
            const bg = isPast ? "#F3F4F6" : status === "vide" ? "#F9FAFB" : status === "plein" ? "#DBEAFE" : "#D1FAE5";
            const color = isPast ? "#9CA3AF" : status === "vide" ? "#9CA3AF" : status === "plein" ? "#2563EB" : "#065F46";
            return (
              <div key={i}
                style={{ background: bg, color, fontWeight: 700, borderRadius: 8, padding: "6px 2px", textAlign: "center",
                  cursor: isPast ? "default" : "pointer", fontSize: "0.9rem",
                  border: popup === iso ? "2px solid #7C3AED" : "2px solid transparent", transition: "all 0.15s" }}
                onClick={() => !isPast && setPopup(popup === iso ? null : iso)}
                title={isPast ? "" : "Cliquer pour gérer les créneaux"}
              >
                {d}
                {status === "partiel" && <div style={{ fontSize: "0.55rem", lineHeight: 1 }}>dispo</div>}
                {status === "plein" && <div style={{ fontSize: "0.55rem", lineHeight: 1 }}>complet</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: "0.85rem", flexWrap: "wrap" }}>
        {Object.values(SLOT_STATUS_STYLE).map(s => (
          <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 4, display: "inline-block" }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Popup créneaux */}
      {popup && (
        <div style={{ marginTop: 20, background: "#fff", border: "2px solid #7C3AED", borderRadius: 16, padding: "20px 24px", boxShadow: "0 4px 24px rgba(124,58,237,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontWeight: 800, color: "var(--text)" }}>
              {new Date(popup + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <button onClick={() => setPopup(null)} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "var(--gray-400)" }}>✕</button>
          </div>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: 16 }}>
            Cliquez un créneau pour l'<strong>ajouter</strong> à vos disponibilités (vert). Cliquez à nouveau pour le retirer. Les créneaux en attente ou réservés sont gérés automatiquement.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
            {ALL_SLOTS.map(slot => {
              const status = slotStatus(popup, slot);
              const st = SLOT_STATUS_STYLE[status];
              const editable = status === "disponible" || status === "absent";
              return (
                <button key={slot}
                  disabled={loading || !editable}
                  onClick={() => editable && onToggleSlot(popup, slot)}
                  title={editable ? "" : "Géré automatiquement par une réservation"}
                  style={{
                    padding: "10px 6px", borderRadius: 10, border: "2px solid",
                    borderColor: st.border, background: st.bg, color: st.color,
                    fontWeight: 700, cursor: editable ? "pointer" : "not-allowed", fontSize: "0.9rem",
                    opacity: editable ? 1 : 0.85, transition: "all 0.15s"
                  }}>
                  {slot}
                  <div style={{ fontSize: "0.65rem", marginTop: 2 }}>{st.label}</div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              ALL_SLOTS.forEach(slot => {
                if (slotStatus(popup, slot) === "disponible") onToggleSlot(popup, slot);
              });
            }}
            style={{ marginTop: 14, width: "100%", padding: "10px", background: "#FEE2E2", color: "#DC2626", border: "2px solid #DC2626", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
            Bloquer toute la journée
          </button>
        </div>
      )}
    </div>
  );
}

const NIVEAU_TAUX   = { debutant: 15, intermediaire: 12, avance: 7, expert: 3 };
const NIVEAU_SEUIL  = { debutant: 10, intermediaire: 50, avance: 150, expert: null };
const NIVEAU_LABEL  = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé", expert: "Expert" };
const NIVEAU_COLOR  = { debutant: "#6B7280", intermediaire: "#2563EB", avance: "#7C3AED", expert: "#D97706" };
const STATUS_LABEL  = { en_attente: "En attente", propose: "Créneau proposé", accepte: "Accepté", refuse: "Refusé", confirme: "Confirmé", annule: "Annulé", termine: "Terminé" };
const STATUS_BG     = { en_attente: "#FEF3C7", propose: "#FFEDD5", accepte: "#DBEAFE", refuse: "#FEE2E2", confirme: "#D1FAE5", annule: "#FEE2E2", termine: "#EDE9FE" };
const STATUS_COLOR  = { en_attente: "#F59E0B", propose: "#EA580C", accepte: "#2563EB", refuse: "#DC2626", confirme: "#059669", annule: "#DC2626", termine: "#7C3AED" };

function AvisListe({ providerId }) {
  const [avis, setAvis]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!providerId) return;
    api.get(`/reviews/provider/${providerId}`)
      .then(setAvis).catch(() => {}).finally(() => setLoading(false));
  }, [providerId]);
  if (loading) return <p style={{ color: "var(--gray-400)", padding: "20px 0" }}>Chargement des avis…</p>;
  if (!avis.length) return <div className="dash-empty"><p>Aucun avis reçu pour le moment.</p></div>;
  return (
    <div className="dash-avis-list">
      {avis.map((a, i) => (
        <div key={i} className="dash-avis-card">
          <div className="dash-avis-header">
            <div className="dash-avis-avatar">{a.client_prenom?.[0] || "C"}</div>
            <div>
              <p className="dash-avis-name">{a.client_prenom} {a.client_nom}</p>
              <div className="dash-stars-row">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`dash-star ${n <= a.note ? "on" : ""}`} style={{ cursor: "default" }}>★</span>
                ))}
                <span style={{ fontWeight: 800, color: "#F59E0B", marginLeft: 6 }}>{a.note}/5</span>
              </div>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--gray-400)", fontSize: "0.82rem" }}>
              {a.created_at ? new Date(a.created_at).toLocaleDateString("fr-FR") : ""}
            </span>
          </div>
          {a.commentaire && <p className="dash-avis-comment">"{a.commentaire}"</p>}
        </div>
      ))}
    </div>
  );
}

const SERVICES = ALL_SERVICES.map(s => s.title).sort();
const CITIES = [
  "Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Montpellier",
  "Bordeaux","Lille","Rennes","Reims","Le Havre","Saint-Étienne","Toulon","Grenoble",
  "Dijon","Angers","Nîmes","Villeurbanne","Saint-Denis","Le Mans","Aix-en-Provence","Autre"
];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileRef  = useRef(null);

  const [user, setUser]           = useState(null);
  const [stats, setStats]         = useState({});
  const [bookings, setBookings]   = useState([]);
  const [convs, setConvs]         = useState([]);
  const [tab, setTab]             = useState(searchParams.get("tab") || "apercu");
  const [loading, setLoading]     = useState(true);
  const [dispo, setDispo]         = useState(true);
  const [dispoLoad, setDispoLoad] = useState(false);
  const [filterStatus, setFilter] = useState("tous");

  // fiche prestataire
  const [serviceProf, setServiceProf]       = useState(null);
  const [serviceProfLoad, setServiceProfLoad] = useState(false);
  const [serviceForm, setServiceForm]       = useState({
    service: "", city: "", bio: "", price: "", siret: "", experience: "", disponibilite: "",
  });
  const [serviceMsg, setServiceMsg]         = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [bioGenLoading, setBioGenLoading]   = useState(false);

  // photo
  const [photoUrl, setPhotoUrl]   = useState(null);
  const [photoLoad, setPhotoLoad] = useState(false);
  const [photoMsg, setPhotoMsg]   = useState(null);

  const [updatingId, setUpdatingId] = useState(null);
  const [verified, setVerified]     = useState(false);
  const [docsSubmitted, setDocsSubmitted] = useState(false);

  // devis
  const [devisRecus, setDevisRecus]       = useState([]);
  const [devisLoad, setDevisLoad]         = useState(false);
  const [devisRepondId, setDevisRepondId] = useState(null);
  const [devisReponse, setDevisReponse]   = useState({ montant: "", message_provider: "" });

  // calendrier disponibilités
  const [blockedDates, setBlockedDates]   = useState({});
  const [calYear, setCalYear]             = useState(new Date().getFullYear());
  const [calMonth, setCalMonth]           = useState(new Date().getMonth());
  const [calLoad, setCalLoad]             = useState(false);

  // rapport mensuel
  const [rapport, setRapport]             = useState("");
  const [rapportLoad, setRapportLoad]     = useState(false);

  // demandes disponibles (au choix de Prestalya)
  const [openBookings, setOpenBookings]   = useState([]);
  const [openBookLoad, setOpenBookLoad]   = useState(false);
  const [acceptingId, setAcceptingId]     = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/connexion"); return; }
    const u = JSON.parse(stored);
    if (u.role === "client") { navigate("/dashboard"); return; }
    if (u.role === "admin")  { navigate("/admin"); return; }
    setUser(u);
    setPhotoUrl(u.photo_url || null);
    Promise.all([
      api.get("/provider-dash/stats").catch(() => ({})),
      api.get("/provider-dash/bookings").catch(() => []),
      api.get("/chat").catch(() => []),
      api.get("/documents/me").catch(() => []),
      api.get("/bookings/open").catch(() => []),
    ]).then(([s, b, c, docs, open]) => {
      setStats(s);
      setDispo(s.available !== 0);
      setBookings(b);
      setConvs(c);
      setVerified(u.verified || false);
      setDocsSubmitted(docs.length > 0);
      setOpenBookings(open);
      if (s.photo_url) setPhotoUrl(s.photo_url);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "devis") return;
    setDevisLoad(true);
    api.get("/devis/recus").then(setDevisRecus).catch(() => {}).finally(() => setDevisLoad(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== "demandes") return;
    setOpenBookLoad(true);
    api.get("/bookings/open").then(setOpenBookings).catch(() => {}).finally(() => setOpenBookLoad(false));
  }, [tab]);

  async function accepterDemande(bookingId) {
    setAcceptingId(bookingId);
    try {
      const result = await api.post(`/bookings/${bookingId}/accepter`, {});
      setOpenBookings(prev => prev.filter(b => b.id !== bookingId));
      const b = await api.get("/provider-dash/bookings").catch(() => []);
      setBookings(b);
      // Ouvrir directement le chat avec le client
      if (result.conv_id) {
        navigate(`/chat/${result.conv_id}`);
      } else {
        setTab("messages");
      }
    } catch (err) { alert(err.message); }
    finally { setAcceptingId(null); }
  }

  useEffect(() => {
    if (tab !== "calendrier") return;
    api.get("/provider-dash/stats").then(s => {
      if (s.provider_id) api.get(`/disponibilites/${s.provider_id}`).then(setBlockedDates).catch(() => {});
    }).catch(() => {});
  }, [tab]);

  async function toggleSlot(iso, slot) {
    setCalLoad(true);
    try {
      const res = await api.post("/disponibilites/toggle", { date_off: iso, slot });
      setBlockedDates(prev => {
        const day = prev[iso] ? { ...prev[iso] } : {};
        if (res.added) {
          day[slot] = "disponible";
        } else {
          delete day[slot];
        }
        const next = { ...prev };
        if (Object.keys(day).length === 0) delete next[iso]; else next[iso] = day;
        return next;
      });
    } catch (err) { alert(err.message || "Erreur"); } finally { setCalLoad(false); }
  }

  // ── Demandes adressées directement à moi (provider_id = moi, en_attente) ──
  const [pendingActionId, setPendingActionId] = useState(null);
  const [proposeModal, setProposeModal] = useState(null); // booking_id
  const [proposeForm, setProposeForm] = useState({ date: "", slot: "" });

  async function accepterDemandeDirecte(bookingId) {
    setPendingActionId(bookingId);
    try {
      const result = await api.post(`/bookings/${bookingId}/accepter-demande`, {});
      const b = await api.get("/provider-dash/bookings").catch(() => []);
      setBookings(b);
      if (result.conv_id) navigate(`/chat/${result.conv_id}`);
      else setTab("messages");
    } catch (err) { alert(err.message); }
    finally { setPendingActionId(null); }
  }

  async function refuserDemandeDirecte(bookingId) {
    if (!confirm("Refuser cette demande ?")) return;
    setPendingActionId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/refuser`, {});
      const b = await api.get("/provider-dash/bookings").catch(() => []);
      setBookings(b);
    } catch (err) { alert(err.message); }
    finally { setPendingActionId(null); }
  }

  async function envoyerProposition(e) {
    e.preventDefault();
    if (!proposeForm.date || !proposeForm.slot) return;
    setPendingActionId(proposeModal);
    try {
      await api.post(`/bookings/${proposeModal}/proposer`, proposeForm);
      const b = await api.get("/provider-dash/bookings").catch(() => []);
      setBookings(b);
      setProposeModal(null);
      setProposeForm({ date: "", slot: "" });
    } catch (err) { alert(err.message); }
    finally { setPendingActionId(null); }
  }

  async function respondDevis(e) {
    e.preventDefault();
    try {
      const updated = await api.patch(`/devis/${devisRepondId}/repondre`, devisReponse);
      setDevisRecus(prev => prev.map(d => d.id === devisRepondId ? updated : d));
      setDevisRepondId(null);
    } catch (err) { alert(err.message); }
  }

  const niveau = stats.niveau || "debutant";

  async function loadRapport() {
    setRapportLoad(true);
    try {
      const gainsMois = bookings.filter(b => {
        const d = new Date(b.created_at);
        return b.status === "termine" && d.getMonth() === new Date().getMonth();
      }).reduce((s, b) => s + parseFloat(b.montant_net || 0), 0);
      const res = await api.post("/ai/rapport-mensuel", {
        prenom: user?.prenom, service: stats.service || "Service",
        bookings_total: bookings.length,
        bookings_mois: bookings.filter(b => { const d = new Date(b.created_at); return d.getMonth() === new Date().getMonth(); }).length,
        rating: stats.rating || 0,
        revenus_mois: gainsMois.toFixed(2),
        taux_commission: NIVEAU_TAUX[niveau] || 15,
      });
      setRapport(res.rapport || "");
    } catch {} finally { setRapportLoad(false); }
  }

  useEffect(() => {
    if (tab !== "service") return;
    setServiceProfLoad(true);
    api.get("/provider-dash/profile")
      .then(p => {
        setServiceProf(p);
        if (p) setServiceForm({
          service:       p.service || "",
          city:          p.city || "",
          bio:           p.bio || "",
          price:    p.price || "",
          siret:         p.siret || "",
          experience:    p.experience || "",
          disponibilite: p.disponibilite || "",
        });
      })
      .catch(() => {})
      .finally(() => setServiceProfLoad(false));
  }, [tab]);

  async function toggleDispo() {
    setDispoLoad(true);
    try {
      await api.patch("/provider-dash/disponibilite", { available: !dispo });
      setDispo(d => !d);
    } catch (e) { alert(e.message); }
    finally { setDispoLoad(false); }
  }

  async function updateStatus(id, status) {
    setUpdatingId(id);
    try {
      await api.patch(`/provider-dash/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (e) { alert(e.message); }
    finally { setUpdatingId(null); }
  }

  async function generateBio() {
    if (!serviceForm.service) { alert("Choisissez d'abord un service."); return; }
    setBioGenLoading(true);
    try {
      const res = await api.post("/ai/generate-bio", {
        service:      serviceForm.service,
        city:         serviceForm.city,
        experience:   serviceForm.experience,
        disponibilite:serviceForm.disponibilite,
        prenom:       user?.prenom,
      });
      setServiceForm(prev => ({ ...prev, bio: res.bio }));
    } catch { alert("Erreur lors de la génération. Vérifiez votre connexion."); }
    finally { setBioGenLoading(false); }
  }

  async function submitServiceForm(e) {
    e.preventDefault();
    setServiceLoading(true);
    setServiceMsg(null);
    try {
      const body = { ...serviceForm, price: parseFloat(serviceForm.price) || null };
      const res = await api.post("/provider-dash/profile", body);
      setServiceProf(res);
      setServiceMsg({ type: "ok", text: "Fiche prestataire enregistrée avec succès !" });
    } catch (e) {
      setServiceMsg({ type: "err", text: e.message });
    } finally { setServiceLoading(false); }
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoad(true);
    setPhotoMsg(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
      const res = await fetch(`${API_ORIGIN}/api/provider-dash/photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
      setPhotoUrl(data.url);
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...u, photo_url: data.url }));
      setPhotoMsg({ type: "ok", text: "Photo mise à jour !" });
    } catch (err) {
      setPhotoMsg({ type: "err", text: err.message || "Erreur upload" });
    } finally { setPhotoLoad(false); }
  }

  const unread   = convs.filter(c => (c.unread || c.unreadProvider || 0) > 0).length;
  const done     = bookings.filter(b => b.status === "termine").length;
  const seuil    = NIVEAU_SEUIL[niveau];
  const progress = seuil ? Math.min(100, (done / seuil) * 100) : 100;
  const gainTotal = bookings.filter(b => b.status === "termine")
    .reduce((s, b) => s + parseFloat(b.montant_net || b.montant_ht || 0), 0);
  const filtered = filterStatus === "tous" ? bookings : bookings.filter(b => b.status === filterStatus);

  if (loading) return <div className="dash-loading">Chargement…</div>;

  return (
    <main className="dash-page">
      <SEO title="Mon espace prestataire" description="Gérez vos missions sur Prestalya." path="/prestataire" />

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-avatar" style={{ background: NIVEAU_COLOR[niveau], overflow: "hidden", position: "relative" }}>
            {photoUrl
              ? <img src={`${API_ORIGIN}${photoUrl}`} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              : <>{user?.prenom?.[0]}{user?.nom?.[0]}</>
            }
          </div>
          <p className="dash-name">{user?.prenom} {user?.nom}</p>
          <span className="dash-badge" style={{ background: `${NIVEAU_COLOR[niveau]}22`, color: NIVEAU_COLOR[niveau], marginBottom: 6 }}>
            ⭐ {NIVEAU_LABEL[niveau]}
          </span>
          <button
            onClick={toggleDispo}
            disabled={dispoLoad}
            style={{
              background: dispo ? "#D1FAE5" : "#FEE2E2",
              color: dispo ? "#065f46" : "#991b1b",
              border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700,
              cursor: "pointer", marginBottom: 10, width: "100%", fontSize: "0.9rem"
            }}
          >
            {dispo ? "🟢 Disponible" : "🔴 Indisponible"}
          </button>
          <nav className="dash-nav">
            {[
              { key: "apercu",       icon: "🏠", label: "Aperçu" },
              { key: "service",      icon: "🔧", label: "Mon service" },
              { key: "calendrier",   icon: "📅", label: "Calendrier" },
              { key: "devis",        icon: "📋", label: "Devis reçus" },
              { key: "demandes",     icon: "📣", label: "Demandes dispo", badge: openBookings.length },
              { key: "reservations", icon: "🗓️", label: "Réservations" },
              { key: "messages",     icon: "💬", label: "Messages", badge: unread },
              { key: "gains",        icon: "💰", label: "Mes gains" },
              { key: "avis",         icon: "⭐", label: "Avis reçus" },
              { key: "profil",       icon: "👤", label: "Mon profil" },
            ].map(n => (
              <button key={n.key} className={tab === n.key ? "active" : ""} onClick={() => setTab(n.key)}>
                {n.icon} {n.label}
                {n.badge > 0 && <span className="dash-conv-unread" style={{ marginLeft: 6 }}>{n.badge}</span>}
              </button>
            ))}
          </nav>
          <button className="dash-logout" onClick={() => { localStorage.removeItem("user"); navigate("/"); }}>Se déconnecter</button>
        </aside>

        <div className="dash-content">

          {/* ── BANNIÈRE VÉRIFICATION ── */}
          {!verified && !docsSubmitted && tab === "apercu" && (
            <div style={{
              background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", border: "1.5px solid #F59E0B",
              borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center",
              gap: 16, marginBottom: 4
            }}>
              <span style={{ fontSize: "2rem" }}>🔐</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px", fontWeight: 800, color: "#92400E" }}>Vérifiez votre identité pour débloquer votre profil</p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#B45309" }}>
                  Déposez vos documents (pièce d'identité, casier judiciaire…) pour obtenir le badge <strong>✓ Vérifié</strong>.
                </p>
              </div>
              <button className="btn-primary" onClick={() => navigate("/completer-profil")}
                style={{ whiteSpace: "nowrap", padding: "10px 20px", background: "#D97706", borderColor: "#D97706" }}>
                Compléter mon profil →
              </button>
            </div>
          )}
          {!verified && docsSubmitted && tab === "apercu" && (
            <div style={{
              background: "#EEF2FF", border: "1.5px solid #C7D2FE", borderRadius: 16,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 4
            }}>
              <span style={{ fontSize: "1.5rem" }}>⏳</span>
              <p style={{ margin: 0, color: "#3730A3", fontSize: "0.9rem" }}>
                <strong>Dossier soumis.</strong> Notre équipe examine vos documents (24–48h). Vous serez notifié à la validation.
              </p>
            </div>
          )}
          {verified && tab === "apercu" && (
            <div style={{
              background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 16,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 4
            }}>
              <span style={{ fontSize: "1.5rem" }}>✅</span>
              <p style={{ margin: 0, color: "#065f46", fontWeight: 700, fontSize: "0.9rem" }}>
                Profil vérifié — votre badge <strong>✓ Vérifié</strong> est visible par les clients.
              </p>
            </div>
          )}

          {/* ── APERÇU ── */}
          {tab === "apercu" && (
            <>
              <div className="dash-welcome" style={{ background: `linear-gradient(135deg,${NIVEAU_COLOR[niveau]},#7C3AED)` }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Bonjour, {user?.prenom} 👋</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>Tableau de bord prestataire</p>
                </div>
                <span className="dash-badge" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                  ⭐ {NIVEAU_LABEL[niveau]}
                </span>
              </div>

              <div className="dash-kpi-grid">
                {[
                  { icon: "📋", val: bookings.length,                                          label: "Total",      color: "#6366F1" },
                  { icon: "⏳", val: bookings.filter(b => b.status === "en_attente").length,   label: "En attente", color: "#F59E0B" },
                  { icon: "✅", val: bookings.filter(b => b.status === "confirme").length,     label: "Confirmées", color: "#059669" },
                  { icon: "💰", val: `${gainTotal.toFixed(0)} €`,                              label: "Gains nets", color: "#7C3AED" },
                ].map(k => (
                  <div key={k.label} className="dash-kpi-card" style={{ borderTop: `3px solid ${k.color}` }}>
                    <span className="dash-kpi-icon" style={{ color: k.color }}>{k.icon}</span>
                    <span className="dash-kpi-val">{k.val}</span>
                    <span className="dash-kpi-label">{k.label}</span>
                  </div>
                ))}
              </div>

              <div className="dash-niveau-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>Progression · {NIVEAU_LABEL[niveau]}</span>
                  {seuil && <span style={{ color: "var(--gray-500)", fontSize: "0.88rem" }}>{done}/{seuil} missions</span>}
                </div>
                <div className="dash-progress-bar">
                  <div className="dash-progress-fill" style={{ width: `${progress}%`, background: NIVEAU_COLOR[niveau] }} />
                </div>
                {seuil
                  ? <p style={{ fontSize: "0.83rem", color: "var(--gray-400)", marginTop: 6 }}>Encore {seuil - done} mission{seuil - done !== 1 ? "s" : ""} pour le prochain niveau</p>
                  : <p style={{ fontSize: "0.83rem", color: "#D97706", marginTop: 6, fontWeight: 700 }}>🏆 Niveau maximum atteint !</p>
                }
              </div>

              {/* Rapport mensuel */}
              <div className="dash-section" style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 className="dash-section-title" style={{ margin: 0 }}>Rapport mensuel</h3>
                  <button onClick={loadRapport} disabled={rapportLoad}
                    style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", opacity: rapportLoad ? 0.7 : 1 }}>
                    {rapportLoad ? "Génération…" : "Générer mon rapport"}
                  </button>
                </div>
                {rapport ? (
                  <div style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 12, padding: "16px 18px", fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#374151" }}>
                    {rapport}
                  </div>
                ) : (
                  <p style={{ color: "var(--gray-400)", fontSize: "0.88rem" }}>Cliquez pour générer une analyse personnalisée de vos performances ce mois-ci.</p>
                )}
              </div>

              <div className="dash-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 className="dash-section-title" style={{ margin: 0 }}>Dernières réservations</h3>
                  <button className="dash-link-btn" onClick={() => setTab("reservations")}>Voir tout →</button>
                </div>
                {bookings.length === 0 ? (
                  <div className="dash-empty">
                    <p>Aucune réservation reçue.</p>
                    <button className="btn-primary" onClick={() => setTab("service")} style={{ marginTop: 12 }}>🔧 Créer ma fiche</button>
                  </div>
                ) : (
                  <div className="dash-booking-cards">
                    {bookings.slice(0, 3).map(b => (
                      <div key={b.id} className="dash-booking-card">
                        <div className="dash-booking-card-left">
                          <span className="dash-booking-icon">🔧</span>
                          <div>
                            <p className="dash-booking-service">{b.service}</p>
                            <p className="dash-booking-meta">{new Date(b.date).toLocaleDateString("fr-FR")}</p>
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

          {/* ── MON SERVICE ── */}
          {tab === "service" && (
            <div className="dash-section">
              <h2>{serviceProf ? "Mon service proposé" : "Proposer un service"}</h2>
              <p style={{ color: "var(--gray-500)", marginBottom: 24 }}>
                {serviceProf ? "Modifiez votre fiche prestataire." : "Remplissez cette fiche pour apparaître dans les recherches."}
              </p>
              {serviceProfLoad ? <p>Chargement…</p> : (
                <form onSubmit={submitServiceForm} className="dash-service-form">
                  <div className="dash-service-grid">
                    <div className="form-group">
                      <label>Service proposé *</label>
                      <select value={serviceForm.service} onChange={e => setServiceForm({ ...serviceForm, service: e.target.value })} required>
                        <option value="">Choisir…</option>
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Ville d'intervention *</label>
                      <input type="text" placeholder="Ex : Paris, Lyon…" value={serviceForm.city}
                        onChange={e => setServiceForm({ ...serviceForm, city: e.target.value })}
                        list="dash-cities-list" required />
                      <datalist id="dash-cities-list">
                        {CITIES.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label>Tarif horaire (€/h) *</label>
                      <input type="number" min="0" step="0.5" placeholder="ex : 25" value={serviceForm.price}
                        onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Années d'expérience</label>
                      <input type="number" min="0" placeholder="ex : 3" value={serviceForm.experience}
                        onChange={e => setServiceForm({ ...serviceForm, experience: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Numéro SIRET (optionnel)</label>
                      <input type="text" placeholder="ex : 123 456 789 00010" value={serviceForm.siret}
                        onChange={e => setServiceForm({ ...serviceForm, siret: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Disponibilités générales</label>
                      <input type="text" placeholder="ex : Lun–Ven 8h–18h" value={serviceForm.disponibilite}
                        onChange={e => setServiceForm({ ...serviceForm, disponibilite: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ margin: 0 }}>Présentation / Bio *</label>
                      <button type="button" onClick={generateBio} disabled={bioGenLoading || !serviceForm.service}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "linear-gradient(135deg,#6366F1,#7C3AED)", color: "#fff",
                          border: "none", borderRadius: 8, padding: "6px 14px",
                          fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", opacity: bioGenLoading ? 0.7 : 1
                        }}>
                        {bioGenLoading ? "Génération…" : "Suggérer une description"}
                      </button>
                    </div>
                    <textarea rows={5} placeholder="Présentez vos compétences, votre expérience, votre approche…"
                      value={serviceForm.bio} onChange={e => setServiceForm({ ...serviceForm, bio: e.target.value })} required />
                  </div>

                  <div className="form-group" style={{ marginTop: 4 }}>
                    <label>Photo de profil</label>
                    <div className="dash-photo-upload-row">
                      <div className="dash-photo-thumb">
                        {photoUrl
                          ? <img src={`${API_ORIGIN}${photoUrl}`} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                          : <span style={{ fontSize: "2rem" }}>📷</span>
                        }
                      </div>
                      <div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadPhoto} />
                        <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={photoLoad}>
                          {photoLoad ? "Envoi en cours…" : "Choisir une photo"}
                        </button>
                        {photoMsg && <p style={{ fontSize: "0.85rem", color: photoMsg.type === "ok" ? "var(--green)" : "var(--red)", marginTop: 6 }}>{photoMsg.text}</p>}
                        <p style={{ color: "var(--gray-400)", fontSize: "0.82rem", marginTop: 6 }}>JPG, PNG · max 5 Mo</p>
                      </div>
                    </div>
                  </div>

                  {serviceMsg && (
                    <div style={{
                      marginTop: 16, padding: "12px 16px", borderRadius: 10,
                      background: serviceMsg.type === "ok" ? "#D1FAE5" : "#FEE2E2",
                      color: serviceMsg.type === "ok" ? "#065f46" : "#991b1b", fontWeight: 600
                    }}>{serviceMsg.text}</div>
                  )}

                  <button type="submit" className="btn-primary" disabled={serviceLoading}
                    style={{ marginTop: 20, width: "100%", justifyContent: "center", padding: "13px" }}>
                    {serviceLoading ? "Enregistrement…" : serviceProf ? "💾 Mettre à jour ma fiche" : "🚀 Publier ma fiche"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── CALENDRIER ── */}
          {tab === "calendrier" && (
            <div className="dash-section">
              <h2>📅 Mon calendrier de disponibilités</h2>
              <p style={{ color: "var(--gray-500)", marginBottom: 20 }}>Cliquez sur un jour pour le bloquer / débloquer. Les clients verront vos indisponibilités sur votre profil.</p>
              <ProviderCalendar
                year={calYear} month={calMonth}
                blockedDates={blockedDates}
                onToggleSlot={toggleSlot}
                onPrev={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); }}
                onNext={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); }}
                loading={calLoad}
              />
              <div className="mini-cal-legend" style={{ marginTop: 16 }}>
                <span className="mini-cal-leg blocked" /> Bloqué (indisponible)
                <span className="mini-cal-leg avail" style={{ marginLeft: 16 }} /> Disponible
              </div>
            </div>
          )}

          {/* ── DEVIS REÇUS ── */}
          {tab === "devis" && (
            <div className="dash-section">
              <h2>📋 Devis reçus <span className="dash-count">{devisRecus.length}</span></h2>
              {devisLoad ? <p style={{ color: "var(--gray-400)" }}>Chargement…</p> :
               devisRecus.length === 0 ? <div className="dash-empty"><p>Aucune demande de devis reçue.</p></div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {devisRecus.map(d => (
                    <div key={d.id} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "1rem" }}>{d.client_prenom} {d.client_nom}</p>
                          <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "0.88rem" }}>{d.service}</p>
                        </div>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
                          background: d.status === "en_attente" ? "#FEF3C7" : d.status === "envoye" ? "#EEF2FF" : d.status === "accepte" ? "#D1FAE5" : "#FEE2E2",
                          color: d.status === "en_attente" ? "#92400E" : d.status === "envoye" ? "#4338CA" : d.status === "accepte" ? "#065F46" : "#991B1B"
                        }}>
                          {d.status === "en_attente" ? "En attente" : d.status === "envoye" ? "Devis envoyé" : d.status === "accepte" ? "Accepté" : "Refusé"}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#374151" }}>{d.description}</p>
                      {d.date_souhaitee && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--gray-500)" }}>📅 Date souhaitée : {new Date(d.date_souhaitee).toLocaleDateString("fr-FR")}</p>}
                      {d.message_client && <p style={{ margin: "0 0 12px", fontSize: "0.85rem", fontStyle: "italic", color: "var(--gray-500)" }}>"{d.message_client}"</p>}
                      {d.montant && <p style={{ margin: "0 0 8px", fontWeight: 800, color: "var(--primary)" }}>Montant proposé : {d.montant}€</p>}
                      {d.status === "en_attente" && (
                        devisRepondId === d.id ? (
                          <form onSubmit={respondDevis} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                            <input type="number" step="0.01" placeholder="Montant (€)" required
                              value={devisReponse.montant} onChange={e => setDevisReponse(r => ({ ...r, montant: e.target.value }))}
                              style={{ border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 12px" }}
                            />
                            <textarea rows={2} placeholder="Message au client (optionnel)"
                              value={devisReponse.message_provider} onChange={e => setDevisReponse(r => ({ ...r, message_provider: e.target.value }))}
                              style={{ border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", resize: "vertical" }}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px" }}>Envoyer le devis</button>
                              <button type="button" onClick={() => setDevisRepondId(null)} style={{ padding: "10px 16px", background: "#F3F4F6", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Annuler</button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => { setDevisRepondId(d.id); setDevisReponse({ montant: "", message_provider: "" }); }}
                            className="btn-primary" style={{ padding: "9px 20px", justifyContent: "center", marginTop: 8 }}>
                            Répondre au devis
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DEMANDES DISPONIBLES ── */}
          {tab === "demandes" && (
            <div className="dash-section">
              <h2>Demandes disponibles <span className="dash-count">{openBookings.length}</span></h2>
              <p style={{ color: "var(--gray-500)", marginBottom: 20, fontSize: "0.95rem" }}>
                Ces clients cherchent un prestataire pour votre service. Le premier à accepter remporte la mission.
              </p>
              {openBookLoad ? (
                <div className="dash-empty"><p>Chargement…</p></div>
              ) : openBookings.length === 0 ? (
                <div className="dash-empty">
                  <p style={{ fontSize: "2rem", marginBottom: 8 }}>🎉</p>
                  <p>Aucune demande ouverte pour le moment.</p>
                  <p style={{ color: "var(--gray-400)", fontSize: "0.9rem" }}>Vous serez notifié dès qu'une nouvelle demande arrive.</p>
                </div>
              ) : (
                <div className="dash-booking-list">
                  {openBookings.map(b => (
                    <div key={b.id} className="dash-booking-row" style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D" }}>
                      <div className="dash-booking-row-date">
                        <span>{new Date(b.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{b.slot || "—"}</span>
                      </div>
                      <div className="dash-booking-row-body" style={{ flex: 1 }}>
                        <p className="dash-booking-service">{b.service}</p>
                        <p className="dash-booking-meta">
                          📍 {b.city || "—"} &nbsp;·&nbsp; Client : {b.client_name || "Anonyme"}
                        </p>
                        {b.comment && <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", margin: "4px 0 0" }}>💬 {b.comment}</p>}
                      </div>
                      <button
                        className="dash-btn-action green"
                        disabled={acceptingId === b.id}
                        onClick={() => accepterDemande(b.id)}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {acceptingId === b.id ? "…" : "✅ Accepter"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RÉSERVATIONS ── */}
          {tab === "reservations" && (
            <div className="dash-section">
              <h2>Réservations reçues <span className="dash-count">{filtered.length}</span></h2>
              <div className="dash-filter-tabs">
                {["tous","en_attente","propose","accepte","confirme","termine","annule"].map(f => (
                  <button key={f} className={`dash-filter-tab ${filterStatus === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                    {{ tous: "Toutes", en_attente: "En attente", propose: "Proposées", accepte: "Acceptées", confirme: "Confirmées", termine: "Terminées", annule: "Annulées" }[f]}
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
                        <p className="dash-booking-meta">{b.client_name || "Client"}</p>
                        {b.status === "propose" && b.propose_date && (
                          <p style={{ fontSize: "0.8rem", color: "#EA580C", margin: "4px 0 0" }}>
                            Créneau proposé : {new Date(b.propose_date).toLocaleDateString("fr-FR")} · {b.propose_slot} — en attente de la réponse du client
                          </p>
                        )}
                      </div>
                      <span className="dash-badge" style={{ background: STATUS_BG[b.status], color: STATUS_COLOR[b.status] }}>
                        {STATUS_LABEL[b.status]}
                      </span>
                      {b.status === "en_attente" && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="dash-btn-action green" disabled={pendingActionId === b.id} onClick={() => accepterDemandeDirecte(b.id)}>✅ Accepter</button>
                          <button className="dash-btn-action" style={{ background: "#FEF3C7", color: "#D97706" }} disabled={pendingActionId === b.id} onClick={() => { setProposeModal(b.id); setProposeForm({ date: "", slot: "" }); }}>📅 Autre créneau</button>
                          <button className="dash-btn-cancel" disabled={pendingActionId === b.id} onClick={() => refuserDemandeDirecte(b.id)}>✕ Refuser</button>
                        </div>
                      )}
                      {b.status === "accepte" && (
                        <span style={{ fontSize: "0.82rem", color: "var(--gray-400)" }}>En attente de confirmation du client</span>
                      )}
                      {b.status === "confirme" && (
                        <button className="dash-btn-action purple" disabled={updatingId === b.id} onClick={() => updateStatus(b.id, "termine")}>✓ Terminer</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Proposer un autre créneau */}
              {proposeModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                  <form onSubmit={envoyerProposition} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, maxWidth: "90vw" }}>
                    <h3 style={{ marginTop: 0 }}>Proposer un autre créneau</h3>
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" required value={proposeForm.date} min={new Date().toISOString().slice(0,10)}
                        onChange={e => setProposeForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Créneau</label>
                      <select required value={proposeForm.slot} onChange={e => setProposeForm(f => ({ ...f, slot: e.target.value }))}>
                        <option value="">Sélectionner</option>
                        {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                      <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setProposeModal(null)}>Annuler</button>
                      <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={pendingActionId === proposeModal}>Envoyer</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {tab === "messages" && (
            <div className="dash-section">
              <h2>Messages {unread > 0 && <span className="dash-count" style={{ background: "#DC2626" }}>{unread} non lus</span>}</h2>
              {convs.length === 0 ? (
                <div className="dash-empty"><p>Aucune conversation pour le moment.</p></div>
              ) : (
                <div className="dash-conv-list">
                  {convs.map(c => (
                    <div key={c._id} className="dash-conv-item" onClick={() => navigate(`/chat/${c._id}`)}>
                      <div className="dash-conv-avatar" style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", overflow: "hidden" }}>
                        {c.other_photo
                          ? <img src={`${API_ORIGIN}${c.other_photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (c.other_name?.[0] || "C")}
                      </div>
                      <div className="dash-conv-info">
                        <p className="dash-conv-name">{c.other_name || "Client"}</p>
                        <p className="dash-conv-last">{c.lastMessage || "Nouvelle conversation"}</p>
                      </div>
                      {(c.unread || 0) > 0 && <span className="dash-conv-unread">{c.unread}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── GAINS ── */}
          {tab === "gains" && (
            <div className="dash-section">
              <h2>Mes gains</h2>
              <div className="dash-kpi-grid">
                {[
                  { icon: "🎯", val: `${bookings.filter(b=>b.status==="termine").reduce((s,b)=>s+parseFloat(b.montant_ht||0),0).toFixed(2)} €`, label: "CA brut HT",          color: "#2563EB" },
                  { icon: "📤", val: `${bookings.filter(b=>b.status==="termine").reduce((s,b)=>s+parseFloat(b.montant_commission||0),0).toFixed(2)} €`, label: "Commission plateforme", color: "#DC2626" },
                  { icon: "💰", val: `${gainTotal.toFixed(2)} €`, label: "Gains nets", color: "#059669" },
                ].map(k => (
                  <div key={k.label} className="dash-kpi-card" style={{ borderTop: `3px solid ${k.color}` }}>
                    <span className="dash-kpi-icon" style={{ color: k.color }}>{k.icon}</span>
                    <span className="dash-kpi-val" style={{ fontSize: "1.3rem" }}>{k.val}</span>
                    <span className="dash-kpi-label">{k.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <h3>Détail des missions terminées</h3>
                {bookings.filter(b => b.status === "termine").length === 0 ? (
                  <div className="dash-empty"><p>Aucune mission terminée.</p></div>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Service</th><th>Montant HT</th>
                        <th>Commission ({NIVEAU_TAUX[niveau]}%)</th><th>Net perçu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.filter(b => b.status === "termine").map(b => {
                        const ht   = parseFloat(b.montant_ht || 0);
                        const comm = parseFloat(b.montant_commission || ht * NIVEAU_TAUX[niveau] / 100);
                        const net  = parseFloat(b.montant_net || ht - comm);
                        return (
                          <tr key={b.id}>
                            <td>{new Date(b.date).toLocaleDateString("fr-FR")}</td>
                            <td>{b.service}</td>
                            <td style={{ fontWeight: 700 }}>{ht.toFixed(2)} €</td>
                            <td style={{ color: "#DC2626" }}>-{comm.toFixed(2)} €</td>
                            <td style={{ color: "#059669", fontWeight: 700 }}>{net.toFixed(2)} €</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── AVIS REÇUS ── */}
          {tab === "avis" && (
            <div className="dash-section">
              <h2>Avis reçus
                {stats.rating && <span style={{ marginLeft: 12, fontWeight: 800, color: "#F59E0B" }}>★ {parseFloat(stats.rating).toFixed(1)}</span>}
              </h2>
              <AvisListe providerId={stats.provider_id} />
            </div>
          )}

          {/* ── MON PROFIL ── */}
          {tab === "profil" && (
            <div className="dash-section">
              <h2>Mon profil</h2>
              <div className="dash-profil-hero">
                <div
                  className="dash-profil-avatar-lg"
                  style={{ background: NIVEAU_COLOR[niveau], cursor: "pointer", overflow: "hidden", position: "relative" }}
                  onClick={() => fileRef.current?.click()}
                >
                  {photoUrl
                    ? <img src={`${API_ORIGIN}${photoUrl}`} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : <>{user?.prenom?.[0]}{user?.nom?.[0]}</>
                  }
                  <div className="dash-photo-overlay">📷 Modifier</div>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{user?.prenom} {user?.nom}</h3>
                  <span className="dash-badge" style={{ background: `${NIVEAU_COLOR[niveau]}22`, color: NIVEAU_COLOR[niveau] }}>
                    ⭐ {NIVEAU_LABEL[niveau]}
                  </span>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadPhoto} />
                  <p style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginTop: 6 }}>Cliquez sur l'avatar pour changer la photo</p>
                  {photoMsg && <p style={{ fontSize: "0.85rem", color: photoMsg.type === "ok" ? "var(--green)" : "var(--red)", marginTop: 4 }}>{photoMsg.text}</p>}
                </div>
              </div>

              <div className="dash-profil-grid">
                {[
                  ["Prénom",              user?.prenom],
                  ["Nom",                 user?.nom],
                  ["Email",               user?.email],
                  ["Note moyenne",        stats.rating ? `${parseFloat(stats.rating).toFixed(1)} / 5` : "—"],
                  ["Avis reçus",          `${stats.reviews || 0}`],
                  ["Missions terminées",  `${done}`],
                  ["Niveau",              NIVEAU_LABEL[niveau]],
                  ["Taux commission",     `${NIVEAU_TAUX[niveau]}%`],
                ].map(([label, val]) => (
                  <div key={label} className="dash-profil-field">
                    <span className="dash-profil-field-label">{label}</span>
                    <span className="dash-profil-field-val">{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <button className="btn-primary" onClick={() => setTab("service")} style={{ padding: "11px 28px" }}>
                  ✏️ Modifier ma fiche prestataire
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
