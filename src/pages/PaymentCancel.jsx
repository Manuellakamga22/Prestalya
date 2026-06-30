import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function PaymentCancel() {
  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad-hero)", padding: "60px 20px" }}>
      <SEO title="Paiement annulé" description="Le paiement a été annulé." path="/paiement/annule" />
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ background: "white", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-md)", padding: "52px 44px", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, background: "#FEF3C7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2.2rem" }}>
            ✕
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text)", marginBottom: 12 }}>Paiement annulé</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: 32 }}>
            Votre paiement n'a pas abouti. Votre réservation est toujours en attente — vous pouvez réessayer à tout moment depuis votre espace personnel.
          </p>
          <Link to="/dashboard" className="btn-primary">Retour à mes réservations</Link>
        </div>
      </div>
    </main>
  );
}
