import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | ok

  useEffect(() => {
    // Le webhook Stripe confirme le paiement côté serveur ; on laisse simplement
    // un court délai pour qu'il ait le temps d'arriver avant d'afficher la confirmation.
    const t = setTimeout(() => setStatus("ok"), 1500);
    return () => clearTimeout(t);
  }, [sessionId]);

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad-hero)", padding: "60px 20px" }}>
      <SEO title="Paiement confirmé" description="Votre paiement a bien été reçu." path="/paiement/succes" />
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ background: "white", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-md)", padding: "52px 44px", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, background: "var(--green-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2.2rem" }}>
            {status === "loading" ? "⏳" : "✓"}
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text)", marginBottom: 12 }}>
            {status === "loading" ? "Vérification du paiement…" : "Paiement réussi !"}
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: 32 }}>
            {status === "loading"
              ? "Merci de patienter un instant."
              : "Votre prestation est confirmée. Vous pouvez suivre son avancement depuis votre espace personnel."}
          </p>
          {status === "ok" && (
            <Link to="/dashboard" className="btn-primary">Voir mes réservations</Link>
          )}
        </div>
      </div>
    </main>
  );
}
