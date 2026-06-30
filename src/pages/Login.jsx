import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import "../styles/pages.css";

function redirectAfterAuth(user, navigate, redirectTo) {
  window.dispatchEvent(new Event("auth-change"));
  if (redirectTo) { navigate(redirectTo); return; }
  if (user.role === "admin") navigate("/admin");
  else if (user.role === "prestataire") navigate("/prestataire");
  else navigate("/dashboard");
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const [tab, setTab] = useState(searchParams.get("tab") === "inscription" ? "inscription" : "connexion");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [register, setRegister] = useState({ prenom: "", nom: "", email: "", password: "", confirm: "", role: "client" });
  const [rgpd, setRgpd] = useState({ cgu: false, confidentialite: false, age: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!login.email || !login.password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      const data = await api.post("/auth/login", { email: login.email, password: login.password });
      localStorage.setItem("user", JSON.stringify({ ...data.user, token: data.token }));
      redirectAfterAuth(data.user, navigate, redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!register.prenom || !register.nom || !register.email || !register.password) {
      setError("Veuillez remplir tous les champs obligatoires."); return;
    }
    if (register.password !== register.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    const pwdOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/.test(register.password);
    if (!pwdOk) { setError("Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (CNIL)."); return; }
    if (!rgpd.cgu || !rgpd.confidentialite || !rgpd.age) { setError("Vous devez accepter toutes les conditions obligatoires."); return; }
    setLoading(true);
    try {
      const data = await api.post("/auth/register", {
        prenom: register.prenom, nom: register.nom,
        email: register.email, password: register.password, role: register.role,
      });
      localStorage.setItem("user", JSON.stringify({ ...data.user, token: data.token }));
      redirectAfterAuth(data.user, navigate, redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--grad-hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div className="logo-icon" style={{ width: 48, height: 48, background: "var(--grad-primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", boxShadow: "var(--shadow-purple)" }}>🏠</div>
            <span style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text)" }}>Prestalya</span>
          </Link>
          <p style={{ color: "var(--gray-500)", marginTop: 10, fontSize: "1.05rem" }}>
            {tab === "connexion" ? "Bon retour parmi nous !" : "Créez votre compte gratuitement"}
          </p>
        </div>

        <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "2px solid var(--gray-200)" }}>
            {["connexion", "inscription"].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{ flex: 1, padding: "18px", border: "none", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "1.05rem",
                  color: tab === t ? "var(--primary)" : "var(--gray-500)",
                  borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
                  marginBottom: -2, transition: "color 0.15s" }}>
                {t === "connexion" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <div style={{ padding: "32px 32px 28px" }}>
            {error && (
              <div style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: "0.97rem", fontWeight: 600 }}>
                {error}
              </div>
            )}

            {tab === "connexion" ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Adresse email *</label>
                  <input type="email" placeholder="votre@email.fr" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input type="password" placeholder="••••••••" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required />
                </div>
                <div style={{ textAlign: "right", marginBottom: 20, marginTop: -10 }}>
                  <Link to="/mot-de-passe-oublie" style={{ color: "var(--primary)", fontSize: "0.93rem", fontWeight: 600, textDecoration: "none" }}>Mot de passe oublié ?</Link>
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? "Connexion…" : "Se connecter"}
                </button>
                <p style={{ textAlign: "center", marginTop: 20, color: "var(--gray-500)", fontSize: "0.97rem" }}>
                  Pas encore de compte ?{" "}
                  <span style={{ color: "var(--primary)", fontWeight: 700, cursor: "pointer" }} onClick={() => setTab("inscription")}>
                    Créer un compte
                  </span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input type="text" placeholder="Prénom" value={register.prenom} onChange={(e) => setRegister({ ...register, prenom: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input type="text" placeholder="Nom" value={register.nom} onChange={(e) => setRegister({ ...register, nom: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Adresse email *</label>
                  <input type="email" placeholder="votre@email.fr" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Je suis *</label>
                  <select value={register.role} onChange={(e) => setRegister({ ...register, role: e.target.value })}>
                    <option value="client">Un client (je cherche un prestataire)</option>
                    <option value="prestataire">Un prestataire (je propose mes services)</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mot de passe *</label>
                    <input type="password" placeholder="Min. 12 caractères" value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Confirmer *</label>
                    <input type="password" placeholder="Répéter" value={register.confirm} onChange={(e) => setRegister({ ...register, confirm: e.target.value })} required />
                  </div>
                </div>
                {/* ── Consentements RGPD ── */}
                <div style={{ background: "var(--gray-100)", borderRadius: 12, padding: "18px 16px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>
                    Consentements obligatoires (RGPD)
                  </div>

                  {[
                    { key: "cgu", label: <>J'ai lu et j'accepte les <Link to="/cgu" target="_blank" style={{ color: "var(--primary)", fontWeight: 700 }}>Conditions Générales d'Utilisation</Link> *</> },
                    { key: "confidentialite", label: <>J'accepte la <Link to="/confidentialite" target="_blank" style={{ color: "var(--primary)", fontWeight: 700 }}>politique de confidentialité</Link> et le traitement de mes données personnelles *</> },
                    { key: "age", label: "Je confirme avoir au moins 18 ans *" },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: "0.93rem", color: "var(--gray-700)", lineHeight: 1.5 }}>
                      <input
                        type="checkbox"
                        checked={rgpd[key]}
                        onChange={(e) => setRgpd({ ...rgpd, [key]: e.target.checked })}
                        style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--primary)", cursor: "pointer", flexShrink: 0 }}
                      />
                      {label}
                    </label>
                  ))}

                  <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 12, marginTop: 2 }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: "0.93rem", color: "var(--gray-500)", lineHeight: 1.5 }}>
                      <input
                        type="checkbox"
                        style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--primary)", cursor: "pointer", flexShrink: 0 }}
                      />
                      J'accepte de recevoir des offres et actualités de Prestalya par email (optionnel)
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: (loading || !rgpd.cgu || !rgpd.confidentialite || !rgpd.age) ? 0.6 : 1 }} disabled={loading || !rgpd.cgu || !rgpd.confidentialite || !rgpd.age}>
                  {loading ? "Création…" : "Créer mon compte"}
                </button>
                <p style={{ textAlign: "center", marginTop: 14, color: "var(--gray-400)", fontSize: "0.87rem", lineHeight: 1.6 }}>
                  Vos données sont protégées et ne seront jamais revendues. <Link to="/confidentialite" style={{ color: "var(--primary)" }}>En savoir plus</Link>
                </p>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, color: "var(--gray-400)", fontSize: "0.93rem" }}>
          <Link to="/" style={{ color: "var(--gray-500)", fontWeight: 600 }}>← Retour à l'accueil</Link>
        </p>
      </div>
    </main>
  );
}
