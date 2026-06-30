import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import SEO from "../components/SEO";
import "../styles/pages.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/connexion?reset=ok");
    } catch (err) {
      setError(err.message || "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="page-login">
        <div className="login-box">
          <p style={{ color: "#DC2626", textAlign: "center" }}>Lien invalide.</p>
          <Link to="/connexion" className="btn-primary" style={{ display: "block", textAlign: "center", marginTop: 16 }}>Connexion</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-login">
      <SEO title="Nouveau mot de passe" description="Choisissez un nouveau mot de passe Prestalya." path="/reinitialiser-mot-de-passe" />
      <div className="login-box">
        <div className="login-logo">🏠</div>
        <h1 className="login-title">Nouveau mot de passe</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Au moins 8 caractères"
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Répétez le mot de passe"
            />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>
      </div>
    </main>
  );
}
