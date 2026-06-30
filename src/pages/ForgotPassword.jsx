import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import SEO from "../components/SEO";
import "../styles/pages.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-login">
      <SEO title="Mot de passe oublié" description="Réinitialisez votre mot de passe Prestalya." path="/mot-de-passe-oublie" />
      <div className="login-box">
        <div className="login-logo">🏠</div>
        <h1 className="login-title">Mot de passe oublié</h1>

        {sent ? (
          <div className="login-success">
            <p>Un email de réinitialisation vous a été envoyé à <strong>{email}</strong>.</p>
            <p style={{ marginTop: 8, fontSize: "0.9rem", color: "var(--gray-400)" }}>
              Vérifiez votre boîte mail (et les spams). Le lien expire dans 1 heure.
            </p>
            <Link to="/connexion" className="btn-primary" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <p style={{ color: "var(--gray-500)", marginBottom: 16, fontSize: "0.95rem" }}>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
            </div>
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? "Envoi en cours…" : "Envoyer le lien"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Link to="/connexion" style={{ color: "var(--primary)", fontSize: "0.9rem" }}>
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
