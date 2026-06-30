import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Page introuvable" description="La page que vous cherchez n'existe pas sur Prestalya." path="/404" />

    <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad-hero)", padding: "60px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <div style={{ fontSize: "6rem", marginBottom: 16, lineHeight: 1 }}>🔍</div>
        <h1 style={{ fontSize: "5rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1, marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>Page introuvable</h2>
        <p style={{ color: "var(--gray-500)", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: 36 }}>
          La page que vous recherchez n'existe pas ou a été déplacée. Pas de panique, vous pouvez retourner à l'accueil.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
          <Link to="/prestataires" className="btn-outline">Voir les prestataires</Link>
        </div>
      </div>
    </main>
    </>
  );
}
