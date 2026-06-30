import { Link, useLocation } from "react-router-dom";
import SEO from "../components/SEO";

export default function BookingConfirmation() {
  const { state } = useLocation();
  const ref = Math.random().toString(36).slice(2, 10).toUpperCase();

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad-hero)", padding: "60px 20px" }}>
      <SEO title="Réservation confirmée" description="Votre prestation Prestalya a bien été réservée. Retrouvez le récapitulatif et votre numéro de référence." path="/reservation/confirmation" />
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ background: "white", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-md)", padding: "52px 44px", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, background: "var(--green-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2.2rem" }}>
            ✓
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text)", marginBottom: 12 }}>Réservation confirmée !</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: 32 }}>
            Votre demande a bien été envoyée. Le prestataire vous contactera pour confirmer les détails.
          </p>

          <div style={{ background: "var(--gray-100)", borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 32, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--gray-200)" }}>
              <span style={{ color: "var(--gray-500)", fontSize: "0.97rem" }}>Référence</span>
              <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "0.97rem" }}>#{ref}</span>
            </div>
            {state?.service && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--gray-200)" }}>
                <span style={{ color: "var(--gray-500)", fontSize: "0.97rem" }}>Service</span>
                <span style={{ fontWeight: 600, fontSize: "0.97rem" }}>{state.service}</span>
              </div>
            )}
            {state?.date && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--gray-200)" }}>
                <span style={{ color: "var(--gray-500)", fontSize: "0.97rem" }}>Date</span>
                <span style={{ fontWeight: 600, fontSize: "0.97rem" }}>{state.date}</span>
              </div>
            )}
            {state?.provider && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                <span style={{ color: "var(--gray-500)", fontSize: "0.97rem" }}>Prestataire</span>
                <span style={{ fontWeight: 600, fontSize: "0.97rem" }}>{state.provider}</span>
              </div>
            )}
          </div>

          <div style={{ background: "var(--green-light)", borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: 32, display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left" }}>
            <span style={{ fontSize: "1.1rem" }}>📧</span>
            <p style={{ color: "var(--green)", fontSize: "0.93rem", fontWeight: 600, lineHeight: 1.6 }}>
              Un email de confirmation vous a été envoyé avec tous les détails de votre réservation.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" className="btn-primary">Retour à l'accueil</Link>
            <Link to="/prestataires" className="btn-outline">Réserver un autre service</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
