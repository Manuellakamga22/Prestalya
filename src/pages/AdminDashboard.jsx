import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ORIGIN } from "../api";
import SEO from "../components/SEO";
import "../styles/dashboard.css";

const statusColor = { en_attente: "#F59E0B", confirme: "#059669", annule: "#DC2626", termine: "#7C3AED" };
const statusLabel = { en_attente: "En attente", confirme: "Confirmé", annule: "Annulé", termine: "Terminé" };
const roleColor   = { client: "#3B82F6", prestataire: "#059669", admin: "#7C3AED" };
const niveauColor = { debutant: "#F59E0B", intermediaire: "#3B82F6", avance: "#059669", expert: "#7C3AED" };
const niveauLabel = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé", expert: "Expert" };
const NIVEAUX     = ["debutant", "intermediaire", "avance", "expert"];
const TAUX_DEF    = { debutant: 15, intermediaire: 12, avance: 7, expert: 3 };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [providers, setProviders] = useState([]);
  const [revenus, setRevenus]     = useState([]);
  const [docs, setDocs]           = useState([]);
  const [tab, setTab]             = useState("stats");
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [aiInsights, setAiInsights]     = useState([]);
  const [aiLoading, setAiLoading]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [taux, setTaux]           = useState({ ...TAUX_DEF });
  const [tauxSaved, setTauxSaved] = useState(false);
  const [searchUser, setSearchUser]   = useState("");
  const [searchBook, setSearchBook]   = useState("");
  const [inactifs, setInactifs]       = useState([]);
  const [inactifsLoading, setInactifsLoading] = useState(false);
  const [relanceLoading, setRelanceLoading]   = useState(null);
  const [relanceSent, setRelanceSent]         = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/connexion"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin") { navigate("/dashboard"); return; }
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [s, u, b, p, r, d] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/bookings"),
        api.get("/admin/providers"),
        api.get("/admin/revenus"),
        api.get("/documents"),
      ]);
      setStats(s);
      setUsers(u);
      setBookings(b);
      setProviders(p);
      setRevenus(r);
      setDocs(d);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id, name) {
    if (!confirm(`Supprimer ${name} ?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) { alert(e.message); }
  }

  async function saveTaux() {
    try {
      await Promise.all(
        NIVEAUX.map((n) => api.patch(`/admin/commissions/${n}`, { taux: taux[n] }))
      );
      setTauxSaved(true);
      setTimeout(() => setTauxSaved(false), 3000);
    } catch (e) { alert(e.message); }
  }

  const totalRevenu = revenus.reduce((s, r) => s + parseFloat(r.commission), 0).toFixed(2);
  const totalVolume = revenus.reduce((s, r) => s + parseFloat(r.volume), 0).toFixed(2);

  const filteredUsers = users.filter((u) => {
    const q = searchUser.toLowerCase();
    return !q || u.prenom.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });
  const filteredBooks = bookings.filter((b) => {
    const q = searchBook.toLowerCase();
    return !q || (b.client_name || "").toLowerCase().includes(q) || (b.service || "").toLowerCase().includes(q);
  });

  async function loadAiInsights() {
    if (!stats) return;
    setAiLoading(true);
    try {
      const insights = await api.post("/ai/insights", stats);
      setAiInsights(Array.isArray(insights) ? insights : []);
    } catch { setAiInsights([]); }
    finally { setAiLoading(false); }
  }

  async function reviewDoc(id, status, reason = null) {
    try {
      const updated = await api.patch(`/documents/${id}/status`, { status, reject_reason: reason });
      setDocs(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
      setRejectModal(null);
      setRejectReason("");
    } catch (e) { alert(e.message); }
  }

  async function loadInactifs() {
    setInactifsLoading(true);
    try {
      setInactifs(await api.get("/admin/inactive-clients?days=30"));
    } catch {} finally { setInactifsLoading(false); }
  }

  async function relancer(userId) {
    setRelanceLoading(userId);
    try {
      await api.post(`/admin/relance/${userId}`, {});
      setRelanceSent(prev => ({ ...prev, [userId]: true }));
    } catch (e) { alert(e.message); }
    finally { setRelanceLoading(null); }
  }

  const pendingDocs = docs.filter(d => d.status === "en_attente").length;

  const navItems = [
    { key: "stats",       label: "📊 Statistiques" },
    { key: "revenus",     label: "💰 Revenus" },
    { key: "providers",   label: "🛠️ Prestataires" },
    { key: "users",       label: "👥 Utilisateurs" },
    { key: "bookings",    label: "📋 Réservations" },
    { key: "verifications", label: "🔐 Vérifications", badge: pendingDocs },
    { key: "alertes",     label: "🚨 Alertes" },
    { key: "inactifs",    label: "📣 Clients inactifs" },
    { key: "parametres",  label: "⚙️ Paramètres" },
  ];

  if (loading) return <div className="dash-loading">Chargement…</div>;

  return (
    <main className="dash-page">
      <SEO title="Administration" description="Tableau de bord administrateur Prestalya." path="/admin" />

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-avatar" style={{ background: "#7C3AED" }}>A</div>
          <p className="dash-name">Administration</p>
          <span className="dash-badge" style={{ background: "#ede9fe", color: "#7C3AED", marginBottom: 8 }}>Admin</span>
          <nav className="dash-nav">
            {navItems.map((n) => (
              <button key={n.key} className={tab === n.key ? "active" : ""} onClick={() => setTab(n.key)}
                style={{ position: "relative" }}>
                {n.label}
                {n.badge > 0 && (
                  <span style={{
                    marginLeft: 6, background: "#DC2626", color: "#fff",
                    fontSize: "0.7rem", fontWeight: 800, padding: "1px 6px",
                    borderRadius: 20, verticalAlign: "middle"
                  }}>{n.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <button className="dash-logout" onClick={() => { localStorage.removeItem("user"); navigate("/"); }}>
            Se déconnecter
          </button>
        </aside>

        <div className="dash-content">

          {/* ── STATISTIQUES ── */}
          {tab === "stats" && stats && (
            <div className="dash-section">
              <h2>Vue d'ensemble</h2>
              <div className="dash-stats">
                {[
                  { icon: "👤", val: stats.clients,    label: "Clients" },
                  { icon: "🛠️", val: stats.providers,  label: "Prestataires" },
                  { icon: "📋", val: stats.bookings,   label: "Réservations" },
                  { icon: "⏳", val: stats.pending,    label: "En attente" },
                  { icon: "✅", val: stats.termine,    label: "Terminées" },
                  { icon: "💰", val: `${stats.commissions}€`, label: "Commissions totales" },
                  { icon: "📅", val: `${stats.revenuMois}€`,  label: "Ce mois-ci" },
                  { icon: "⭐", val: stats.niveaux?.length || 0, label: "Niveaux actifs" },
                ].map((s) => (
                  <div key={s.label} className="dash-stat-card">
                    <span className="dash-stat-icon">{s.icon}</span>
                    <span className="dash-stat-value">{s.val}</span>
                    <span className="dash-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="dash-admin-summary">
                <div className="dash-summary-card">
                  <h3>Dernières réservations</h3>
                  {bookings.slice(0, 6).map((b) => (
                    <div key={b.id} className="dash-summary-row">
                      <span>{b.client_name}</span>
                      <span style={{ color: "var(--gray-500)", fontSize: "0.88rem" }}>{b.service}</span>
                      <span className="dash-badge" style={{ background: statusColor[b.status] + "20", color: statusColor[b.status] }}>
                        {statusLabel[b.status]}
                      </span>
                    </div>
                  ))}
                  {bookings.length === 0 && <p style={{ color: "var(--gray-400)", fontSize: "0.9rem" }}>Aucune réservation.</p>}
                </div>

                <div className="dash-summary-card">
                  <h3>Répartition prestataires</h3>
                  {NIVEAUX.map((n) => {
                    const found = stats.niveaux?.find((x) => x.niveau === n);
                    return (
                      <div key={n} className="dash-summary-row">
                        <span className="dash-badge" style={{ background: niveauColor[n] + "20", color: niveauColor[n] }}>
                          {niveauLabel[n]}
                        </span>
                        <span style={{ fontWeight: 700 }}>{found ? found.total : 0} prestataires</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── REVENUS ── */}
          {tab === "revenus" && (
            <div className="dash-section">
              <h2>Revenus plateforme</h2>
              <div className="dash-stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                <div className="dash-stat-card">
                  <span className="dash-stat-icon">💰</span>
                  <span className="dash-stat-value">{totalRevenu}€</span>
                  <span className="dash-stat-label">Commissions totales</span>
                </div>
                <div className="dash-stat-card">
                  <span className="dash-stat-icon">📦</span>
                  <span className="dash-stat-value">{totalVolume}€</span>
                  <span className="dash-stat-label">Volume total HT</span>
                </div>
                <div className="dash-stat-card">
                  <span className="dash-stat-icon">📅</span>
                  <span className="dash-stat-value">{stats?.revenuMois}€</span>
                  <span className="dash-stat-label">Ce mois-ci</span>
                </div>
              </div>

              {revenus.length === 0 ? (
                <div className="dash-empty"><p>Aucune donnée de revenus disponible.</p></div>
              ) : (
                <div className="dash-table-wrap" style={{ marginTop: 24 }}>
                  <table className="dash-table">
                    <thead>
                      <tr><th>Mois</th><th>Volume HT</th><th>Commissions perçues</th><th>Taux moyen</th></tr>
                    </thead>
                    <tbody>
                      {revenus.map((r) => (
                        <tr key={r.mois}>
                          <td>{r.mois}</td>
                          <td>{parseFloat(r.volume).toFixed(2)}€</td>
                          <td><strong style={{ color: "var(--green)" }}>{parseFloat(r.commission).toFixed(2)}€</strong></td>
                          <td>{r.volume > 0 ? ((r.commission / r.volume) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PRESTATAIRES ── */}
          {tab === "providers" && (
            <div className="dash-section">
              <h2>Prestataires <span className="dash-count">{providers.length}</span></h2>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Nom</th><th>Service</th><th>Ville</th><th>Niveau</th><th>Note</th><th>Dispo</th></tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.service}</td>
                        <td>{p.city}</td>
                        <td>
                          <span className="dash-badge" style={{ background: niveauColor[p.niveau] + "20", color: niveauColor[p.niveau] }}>
                            {niveauLabel[p.niveau] || "Débutant"}
                          </span>
                        </td>
                        <td>{"★".repeat(Math.round(parseFloat(p.rating || 0)))} {parseFloat(p.rating || 0).toFixed(1)}</td>
                        <td>
                          <span className="dash-badge" style={{ background: p.available ? "#d1fae520" : "#fee2e220", color: p.available ? "#065f46" : "#991b1b" }}>
                            {p.available ? "Disponible" : "Indisponible"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── UTILISATEURS ── */}
          {tab === "users" && (
            <div className="dash-section">
              <h2>Utilisateurs <span className="dash-count">{filteredUsers.length}</span></h2>
              <input
                className="dash-search"
                placeholder="Rechercher par nom ou email…"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscription</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.prenom} {u.nom}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="dash-badge" style={{ background: roleColor[u.role] + "20", color: roleColor[u.role] }}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                        <td>
                          {u.role !== "admin" && (
                            <button className="dash-btn-cancel" onClick={() => deleteUser(u.id, `${u.prenom} ${u.nom}`)}>
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── RESERVATIONS ── */}
          {tab === "bookings" && (
            <div className="dash-section">
              <h2>Réservations <span className="dash-count">{filteredBooks.length}</span></h2>
              <input
                className="dash-search"
                placeholder="Rechercher par client ou service…"
                value={searchBook}
                onChange={(e) => setSearchBook(e.target.value)}
              />
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Client</th><th>Prestataire</th><th>Service</th><th>Date</th><th>Montant HT</th><th>Commission</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((b) => (
                      <tr key={b.id}>
                        <td>{b.client_name}</td>
                        <td>{b.provider_name || "—"}</td>
                        <td>{b.service}</td>
                        <td>{new Date(b.date).toLocaleDateString("fr-FR")}</td>
                        <td>{b.montant_ht ? `${b.montant_ht}€` : "—"}</td>
                        <td>{b.montant_commission ? <span style={{ color: "var(--green)", fontWeight: 700 }}>{b.montant_commission}€</span> : "—"}</td>
                        <td>
                          <span className="dash-badge" style={{ background: statusColor[b.status] + "20", color: statusColor[b.status] }}>
                            {statusLabel[b.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ALERTES ── */}
          {tab === "alertes" && stats && (
            <div className="dash-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Alertes et surveillance</h2>
                <button
                  onClick={loadAiInsights}
                  disabled={aiLoading}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg,#6366F1,#7C3AED)", color: "#fff",
                    border: "none", borderRadius: 10, padding: "10px 20px",
                    fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", opacity: aiLoading ? 0.7 : 1
                  }}
                >
                  {aiLoading ? "Analyse en cours…" : "Analyser"}
                </button>
              </div>

              {/* AI Insights */}
              {aiInsights.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontWeight: 800, marginBottom: 12, color: "#4F46E5", fontSize: "0.95rem" }}>
                    Résultat de l'analyse
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {aiInsights.map((ins, i) => {
                      const colors = {
                        warning: { bg: "#FEF3C7", border: "#F59E0B", color: "#92400E", icon: "⚠️" },
                        danger:  { bg: "#FEE2E2", border: "#DC2626", color: "#991B1B", icon: "🚨" },
                        success: { bg: "#D1FAE5", border: "#059669", color: "#065f46", icon: "✅" },
                        info:    { bg: "#EEF2FF", border: "#6366F1", color: "#3730A3", icon: "💡" },
                      };
                      const c = colors[ins.type] || colors.info;
                      return (
                        <div key={i} style={{
                          background: c.bg, border: `1.5px solid ${c.border}`,
                          borderRadius: 12, padding: "14px 18px",
                          display: "flex", gap: 12, alignItems: "flex-start"
                        }}>
                          <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                          <div>
                            <p style={{ margin: "0 0 4px", fontWeight: 800, color: c.color }}>{ins.titre}</p>
                            <p style={{ margin: 0, color: c.color, fontSize: "0.88rem", opacity: 0.9 }}>{ins.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="dash-alerte-grid">
                <div className="dash-alerte-card warning">
                  <div className="dash-alerte-header">
                    <span>⚠️</span>
                    <h3>Prestataires mal notés</h3>
                    <span className="dash-badge" style={{ background: "#FEF3C7", color: "#92400E" }}>
                      {stats.alertes?.length || 0}
                    </span>
                  </div>
                  {stats.alertes?.length === 0 ? (
                    <p className="dash-alerte-empty">Aucun prestataire en dessous de 3/5.</p>
                  ) : (
                    stats.alertes.map((a, i) => (
                      <div key={i} className="dash-alerte-row">
                        <span>{a.name}</span>
                        <span style={{ color: "#DC2626", fontWeight: 700 }}>⭐ {parseFloat(a.rating).toFixed(1)} ({a.reviews} avis)</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="dash-alerte-card info">
                  <div className="dash-alerte-header">
                    <span>🔴</span>
                    <h3>Prestataires indisponibles</h3>
                    <span className="dash-badge" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                      {stats.inactifs?.length || 0}
                    </span>
                  </div>
                  {stats.inactifs?.length === 0 ? (
                    <p className="dash-alerte-empty">Tous les prestataires sont disponibles.</p>
                  ) : (
                    stats.inactifs.map((a, i) => (
                      <div key={i} className="dash-alerte-row">
                        <span>{a.name}</span>
                        <span style={{ color: "#DC2626" }}>Indisponible</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="dash-alerte-card success">
                  <div className="dash-alerte-header">
                    <span>📈</span>
                    <h3>Santé de la plateforme</h3>
                  </div>
                  <div className="dash-alerte-row">
                    <span>Taux de complétion</span>
                    <strong style={{ color: "var(--green)" }}>
                      {stats.bookings > 0 ? Math.round((stats.termine / stats.bookings) * 100) : 0}%
                    </strong>
                  </div>
                  <div className="dash-alerte-row">
                    <span>Réservations en attente</span>
                    <strong style={{ color: "#F59E0B" }}>{stats.pending}</strong>
                  </div>
                  <div className="dash-alerte-row">
                    <span>Prestataires actifs</span>
                    <strong style={{ color: "var(--green)" }}>{providers.filter((p) => p.available).length}</strong>
                  </div>
                  <div className="dash-alerte-row">
                    <span>Revenus ce mois</span>
                    <strong style={{ color: "var(--primary)" }}>{stats.revenuMois}€</strong>
                  </div>
                </div>

                <div className="dash-alerte-card neutral">
                  <div className="dash-alerte-header">
                    <span>💡</span>
                    <h3>Suggestions</h3>
                  </div>
                  {stats.pending > 5 && (
                    <div className="dash-alerte-row">
                      <span style={{ color: "#92400E" }}>⚠️ {stats.pending} réservations en attente — relancer les prestataires.</span>
                    </div>
                  )}
                  {stats.alertes?.length > 0 && (
                    <div className="dash-alerte-row">
                      <span style={{ color: "#DC2626" }}>🔴 {stats.alertes.length} prestataire(s) avec mauvaise note — envisager un avertissement.</span>
                    </div>
                  )}
                  {stats.providers < 10 && (
                    <div className="dash-alerte-row">
                      <span style={{ color: "#1D4ED8" }}>📢 Peu de prestataires inscrits — intensifier le recrutement.</span>
                    </div>
                  )}
                  {stats.clients > stats.providers * 5 && (
                    <div className="dash-alerte-row">
                      <span style={{ color: "#1D4ED8" }}>👥 Ratio clients/prestataires élevé — recruter plus de prestataires.</span>
                    </div>
                  )}
                  {stats.pending === 0 && stats.alertes?.length === 0 && (
                    <p className="dash-alerte-empty">Tout fonctionne bien. Aucune action requise.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── VÉRIFICATIONS ── */}
          {tab === "verifications" && (
            <div className="dash-section">
              {rejectModal && (
                <div className="dash-modal-overlay" onClick={() => setRejectModal(null)}>
                  <div className="dash-modal" onClick={e => e.stopPropagation()}>
                    <h3 style={{ margin: "0 0 14px" }}>Motif de refus</h3>
                    <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="Expliquez pourquoi ce document est refusé…"
                      style={{ width: "100%", borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "10px 14px", fontSize: "0.95rem", resize: "vertical" }} />
                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <button className="btn-primary" style={{ flex: 1, justifyContent: "center", background: "#DC2626", borderColor: "#DC2626" }}
                        onClick={() => reviewDoc(rejectModal, "rejete", rejectReason)}>
                        ❌ Confirmer le refus
                      </button>
                      <button onClick={() => setRejectModal(null)}
                        style={{ flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "none", fontWeight: 600, cursor: "pointer" }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <h2>Vérifications prestataires
                {pendingDocs > 0 && <span className="dash-count" style={{ background: "#DC2626", marginLeft: 10 }}>{pendingDocs} en attente</span>}
              </h2>

              <div className="dash-filter-tabs" style={{ marginBottom: 20 }}>
                {[["tous","Tous"],["en_attente","En attente"],["valide","Validés"],["rejete","Refusés"]].map(([k,l]) => (
                  <button key={k} className={`dash-filter-tab`}
                    onClick={() => {}} style={{ opacity: 1 }}>
                    {l} ({k === "tous" ? docs.length : docs.filter(d => d.status === k).length})
                  </button>
                ))}
              </div>

              {docs.length === 0 ? (
                <div className="dash-empty"><p>Aucun document soumis pour le moment.</p></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {docs.map(doc => (
                    <div key={doc.id} style={{
                      background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16,
                      padding: "18px 22px", display: "flex", alignItems: "center", gap: 16
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.97rem" }}>{doc.label}</span>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
                            background: doc.status === "valide" ? "#D1FAE5" : doc.status === "rejete" ? "#FEE2E2" : "#FEF3C7",
                            color:      doc.status === "valide" ? "#065f46" : doc.status === "rejete" ? "#991B1B" : "#92400E",
                          }}>
                            {doc.status === "valide" ? "✅ Validé" : doc.status === "rejete" ? "❌ Refusé" : "⏳ En attente"}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 3px", fontSize: "0.85rem", color: "#6B7280" }}>
                          👤 {doc.prenom} {doc.nom} · {doc.email}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#9CA3AF" }}>
                          📄 {doc.original_name} · Déposé le {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
                        </p>
                        {doc.reject_reason && (
                          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#DC2626", fontWeight: 600 }}>
                            Motif : {doc.reject_reason}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <a
                          href={`/api/documents/file/${doc.filename}`}
                          target="_blank" rel="noreferrer"
                          style={{ padding: "7px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", color: "#374151" }}
                          onClick={e => {
                            e.preventDefault();
                            const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
                            fetch(`${API_ORIGIN}/api/documents/file/${doc.filename}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                              .then(r => r.blob())
                              .then(blob => window.open(URL.createObjectURL(blob), "_blank"))
                              .catch(() => alert("Erreur lors de l'ouverture du document"));
                          }}
                        >
                          👁 Voir
                        </a>
                        {doc.status !== "valide" && (
                          <button
                            style={{ padding: "7px 14px", background: "#D1FAE5", color: "#065f46", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
                            onClick={() => reviewDoc(doc.id, "valide")}
                          >✅ Valider</button>
                        )}
                        {doc.status !== "rejete" && (
                          <button
                            style={{ padding: "7px 14px", background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
                            onClick={() => { setRejectModal(doc.id); setRejectReason(""); }}
                          >❌ Refuser</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CLIENTS INACTIFS ── */}
          {tab === "inactifs" && (
            <div className="dash-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Clients inactifs (+30 jours)</h2>
                <button
                  onClick={loadInactifs}
                  disabled={inactifsLoading}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg,#6366F1,#7C3AED)", color: "#fff",
                    border: "none", borderRadius: 10, padding: "10px 20px",
                    fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", opacity: inactifsLoading ? 0.7 : 1
                  }}
                >
                  {inactifsLoading ? "Chargement…" : "🔄 Charger la liste"}
                </button>
              </div>

              {inactifs.length === 0 ? (
                <div className="dash-empty"><p>Cliquez sur "Charger la liste" pour voir les clients inactifs.</p></div>
              ) : (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Dernier service</th>
                        <th>Dernière réservation</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactifs.map(c => (
                        <tr key={c.id}>
                          <td>{c.prenom} {c.nom}</td>
                          <td>{c.email}</td>
                          <td>{c.last_service || "Jamais réservé"}</td>
                          <td>{c.last_booking_at ? new Date(c.last_booking_at).toLocaleDateString("fr-FR") : "—"}</td>
                          <td>
                            <button
                              onClick={() => relancer(c.id)}
                              disabled={relanceLoading === c.id || relanceSent[c.id]}
                              style={{
                                padding: "7px 14px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer",
                                background: relanceSent[c.id] ? "#D1FAE5" : "linear-gradient(135deg,#6366F1,#7C3AED)",
                                color: relanceSent[c.id] ? "#065f46" : "#fff",
                                opacity: relanceLoading === c.id ? 0.7 : 1,
                              }}
                            >
                              {relanceSent[c.id] ? "✅ Envoyée" : relanceLoading === c.id ? "Envoi…" : "Relancer le client"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PARAMÈTRES ── */}
          {tab === "parametres" && (
            <div className="dash-section">
              <h2>Paramètres</h2>

              <div className="dash-param-card">
                <h3>Taux de commission par niveau</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: 20, fontSize: "0.95rem" }}>
                  Les taux s'appliquent automatiquement lors de la finalisation d'une réservation.
                </p>
                <div className="dash-param-grid">
                  {NIVEAUX.map((n) => (
                    <div key={n} className="dash-param-row">
                      <div>
                        <span className="dash-badge" style={{ background: niveauColor[n] + "20", color: niveauColor[n], marginBottom: 4, display: "inline-block" }}>
                          {niveauLabel[n]}
                        </span>
                        <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", margin: 0 }}>
                          {n === "debutant" ? "0–9 prestations" : n === "intermediaire" ? "10–49 prestations" : n === "avance" ? "50–149 prestations" : "150+ prestations"}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          value={taux[n]}
                          onChange={(e) => setTaux({ ...taux, [n]: parseFloat(e.target.value) })}
                          className="dash-param-input"
                        />
                        <span style={{ fontWeight: 700, color: "var(--gray-500)" }}>%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
                  <button className="btn-primary" onClick={saveTaux}>Enregistrer les taux</button>
                  {tauxSaved && <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ Sauvegardé</span>}
                </div>
              </div>

              <div className="dash-param-card" style={{ marginTop: 20 }}>
                <h3>Informations plateforme</h3>
                <div className="dash-param-grid">
                  {[
                    ["Nom", "Prestalya"],
                    ["Email contact", "manuellakamga20@gmail.com"],
                    ["Version", "1.0.0"],
                    ["Environnement", "Production"],
                  ].map(([label, val]) => (
                    <div key={label} className="dash-param-row">
                      <span style={{ color: "var(--gray-500)", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontWeight: 700 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
