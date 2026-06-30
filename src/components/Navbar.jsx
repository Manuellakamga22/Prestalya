import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api, API_ORIGIN } from "../api";
import "../styles/Navbar.css";

const SOCKET_URL = API_ORIGIN;
const ICONS = {
  new_booking:        "📋",
  booking_confirmed:  "✅",
  booking_cancelled:  "❌",
  booking_terminated: "🎉",
  new_message:        "💬",
  new_review:         "⭐",
};

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [user, setUser]         = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs]     = useState([]);
  const [unread, setUnread]     = useState(0);
  const [toast, setToast]       = useState(null);
  const dropRef   = useRef(null);
  const notifRef  = useRef(null);
  const socketRef = useRef(null);
  const toastTimer = useRef(null);
  const navigate  = useNavigate();

  const loadUser = () => {
    const u = localStorage.getItem("user");
    setUser(u ? JSON.parse(u) : null);
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("auth-change", loadUser);
    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  // load notifications when user is known
  useEffect(() => {
    if (!user) { setNotifs([]); setUnread(0); return; }
    api.get("/notifications").then(d => { setNotifs(d.notifs || []); setUnread(d.unread || 0); }).catch(() => {});
  }, [user]);

  // socket for real-time notifications
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }
    const token = user.token;
    if (!token) return;
    try {
      const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket"] });
      socketRef.current = socket;
      socket.on("new_notification", (notif) => {
        setNotifs(prev => [notif, ...prev].slice(0, 30));
        setUnread(prev => prev + 1);
        showToast(notif);
      });
      return () => { socket.disconnect(); socketRef.current = null; };
    } catch (e) {
      console.error("Socket.io init error:", e);
    }
  }, [user]);

  function showToast(notif) {
    clearTimeout(toastTimer.current);
    setToast(notif);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target))  setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleMarkRead(id) {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  }

  async function handleMarkAllRead() {
    await api.patch("/notifications/read-all").catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    await api.delete(`/notifications/${id}`).catch(() => {});
    setNotifs(prev => {
      const n = prev.find(x => x._id === id);
      if (n && !n.read) setUnread(u => Math.max(0, u - 1));
      return prev.filter(x => x._id !== id);
    });
  }

  function handleNotifClick(notif) {
    if (!notif.read) handleMarkRead(notif._id);
    setNotifOpen(false);
    if (notif.link) navigate(notif.link);
  }

  const logout = () => {
    socketRef.current?.disconnect();
    localStorage.removeItem("user");
    setUser(null);
    setDropdown(false);
    setNotifs([]);
    setUnread(0);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
    { to: "/prestataires", label: "Prestataires" },
    { to: "/devenir-prestataire", label: "Devenir prestataire" },
    { to: "/a-propos", label: "À propos" },
    { to: "/contact", label: "Contact" },
  ];

  const dashLink = user?.role === "admin" ? "/admin" : user?.role === "prestataire" ? "/prestataire" : "/dashboard";

  function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    return `il y a ${Math.floor(h / 24)}j`;
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="notif-toast" onClick={() => { handleNotifClick(toast); setToast(null); }}>
          <span className="notif-toast-icon">{ICONS[toast.type] || "🔔"}</span>
          <div>
            <p className="notif-toast-title">{toast.title}</p>
            <p className="notif-toast-body">{toast.body}</p>
          </div>
          <button className="notif-toast-close" onClick={e => { e.stopPropagation(); setToast(null); }}>×</button>
        </div>
      )}

      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">🏠</div>
              <span>Prestalya</span>
            </Link>

            <ul className="navbar-links">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => isActive ? "active" : ""}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="navbar-cta" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {user ? (
                <>
                  {/* ── Bell ── */}
                  <div ref={notifRef} style={{ position: "relative" }}>
                    <button className="notif-bell-btn" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
                      🔔
                      {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
                    </button>

                    {notifOpen && (
                      <div className="notif-dropdown">
                        <div className="notif-dropdown-header">
                          <span style={{ fontWeight: 800 }}>Notifications</span>
                          {unread > 0 && (
                            <button className="notif-mark-all" onClick={handleMarkAllRead}>Tout lire</button>
                          )}
                        </div>

                        {notifs.length === 0 ? (
                          <div className="notif-empty">
                            <span style={{ fontSize: "2rem" }}>🔔</span>
                            <p>Aucune notification</p>
                          </div>
                        ) : (
                          <div className="notif-list">
                            {notifs.map(n => (
                              <div
                                key={n._id}
                                className={`notif-item ${!n.read ? "unread" : ""}`}
                                onClick={() => handleNotifClick(n)}
                              >
                                <span className="notif-item-icon">{ICONS[n.type] || "🔔"}</span>
                                <div className="notif-item-body">
                                  <p className="notif-item-title">{n.title}</p>
                                  <p className="notif-item-text">{n.body}</p>
                                  <p className="notif-item-time">{timeAgo(n.createdAt)}</p>
                                </div>
                                {!n.read && <span className="notif-dot" />}
                                <button className="notif-delete" onClick={e => handleDelete(n._id, e)}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── User dropdown ── */}
                  <div ref={dropRef} style={{ position: "relative" }}>
                    <button className="navbar-user-btn" onClick={() => setDropdown(!dropdown)}>
                      <div className="navbar-avatar">{user.prenom?.[0]?.toUpperCase() || "U"}</div>
                      <span>{user.prenom}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: dropdown ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {dropdown && (
                      <div className="navbar-dropdown">
                        <div className="dropdown-header">
                          <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.97rem" }}>{user.prenom} {user.nom || ""}</div>
                          <div style={{ color: "var(--gray-400)", fontSize: "0.84rem" }}>{user.email}</div>
                        </div>
                        <Link to={dashLink} className="dropdown-item" onClick={() => setDropdown(false)}>🏠 Mon tableau de bord</Link>
                        <Link to="/reservation" className="dropdown-item" onClick={() => setDropdown(false)}>📅 Réserver une prestation</Link>
                        <div className="dropdown-sep" />
                        <button className="dropdown-item dropdown-logout" onClick={logout}>🚪 Se déconnecter</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="btn-outline" style={{ padding: "9px 18px" }}>Se connecter</Link>
                  <Link to="/connexion?tab=inscription" className="btn-primary" style={{ padding: "9px 18px" }}>S'inscrire</Link>
                </>
              )}
            </div>

            <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>

          <div className={`navbar-mobile ${open ? "open" : ""}`}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)}
                className={({ isActive }) => isActive ? "active" : ""}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to={dashLink} className="btn-primary" onClick={() => setOpen(false)}
                  style={{ marginTop: 10, textAlign: "center" }}>
                  Mon tableau de bord
                </Link>
                <button className="btn-outline" style={{ marginTop: 8, width: "100%" }}
                  onClick={() => { logout(); setOpen(false); }}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="btn-outline" onClick={() => setOpen(false)}
                  style={{ marginTop: 10, textAlign: "center" }}>Se connecter</Link>
                <Link to="/connexion?tab=inscription" className="btn-primary" onClick={() => setOpen(false)}
                  style={{ marginTop: 8, textAlign: "center" }}>S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
