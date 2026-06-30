import SEO from "../components/SEO";
import "../styles/pages.css";

const sections = [
  { title: "1. Responsable du traitement", text: "Prestalya SAS, 12 rue de la Paix, 75002 Paris – manuellakamga20@gmail.com – est responsable du traitement de vos données personnelles collectées via la plateforme prestalya.com." },
  { title: "2. Données collectées", text: "Nous collectons uniquement les données nécessaires au fonctionnement du service : informations d'identification (nom, prénom, email), données de réservation, données de paiement (traitées exclusivement par Stripe – Prestalya ne stocke aucune donnée bancaire), et données de navigation (logs techniques, sans cookies publicitaires)." },
  { title: "3. Finalités du traitement", text: "Vos données sont utilisées pour : gérer votre compte et vos réservations, vous envoyer des confirmations et notifications liées à vos prestations, améliorer nos services et la sécurité de la plateforme, respecter nos obligations légales. Nous n'utilisons pas vos données à des fins publicitaires sans votre consentement." },
  { title: "4. Base légale", text: "Le traitement de vos données repose sur : l'exécution du contrat (gestion de votre compte et réservations), l'intérêt légitime (sécurité, amélioration du service), le consentement (communications marketing optionnelles), et l'obligation légale (comptabilité, lutte contre la fraude)." },
  { title: "5. Partage des données", text: "Vos données peuvent être partagées avec : les prestataires que vous réservez (dans la limite nécessaire à la prestation), nos sous-traitants techniques (hébergement OVH, paiement Stripe), les autorités compétentes si la loi l'exige. Nous ne vendons jamais vos données à des tiers." },
  { title: "6. Conservation des données", text: "Vos données sont conservées pendant la durée de votre compte + 3 ans (obligations légales). Les données de paiement sont conservées 10 ans (obligations comptables). Vous pouvez demander la suppression de votre compte à tout moment." },
  { title: "7. Vos droits (RGPD)", text: "Conformément au RGPD, vous disposez des droits suivants : accès, rectification, effacement (« droit à l'oubli »), portabilité, limitation du traitement, opposition. Pour exercer ces droits, contactez-nous à privacy@prestalya.com. Délai de réponse : 30 jours maximum. En cas de litige, vous pouvez saisir la CNIL (cnil.fr)." },
  { title: "8. Sécurité", text: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement TLS, authentification sécurisée, contrôles d'accès stricts, sauvegardes régulières et audits de sécurité." },
  { title: "9. Cookies", text: "Nous utilisons uniquement des cookies strictement nécessaires (session, authentification). Aucun cookie de pistage ou publicitaire n'est utilisé sans votre consentement. Vous pouvez gérer vos préférences via les paramètres de votre navigateur." },
  { title: "10. Modifications", text: "Cette politique peut être mise à jour. Vous serez informé par email de tout changement substantiel. La date de dernière mise à jour figure en haut de cette page." },
];

export default function Confidentialite() {
  return (
    <main>
      <SEO
        title="Politique de confidentialité"
        description="Prestalya s'engage à protéger vos données personnelles. Découvrez comment nous collectons, utilisons et sécurisons vos informations conformément au RGPD."
        path="/confidentialite"
      />
      <section className="page-hero">
        <div className="container">
          <h1>Politique de confidentialité</h1>
          <p>Dernière mise à jour : janvier 2025 — Conforme au RGPD</p>
        </div>
      </section>

      <section style={{ padding: "64px 0 96px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 48 }}>
            {[
              { icon: "🔒", label: "Données chiffrées" },
              { icon: "🚫", label: "Zéro revente" },
              { icon: "🇪🇺", label: "Conforme RGPD" },
            ].map((b) => (
              <div key={b.label} style={{ background: "var(--primary-light)", borderRadius: "var(--radius)", padding: "20px", textAlign: "center", border: "1px solid var(--primary-mid)" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.97rem" }}>{b.label}</div>
              </div>
            ))}
          </div>

          {sections.map((s) => (
            <div key={s.title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{s.title}</h2>
              <p style={{ color: "var(--gray-500)", lineHeight: 1.85 }}>{s.text}</p>
            </div>
          ))}

          <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius-lg)", padding: "28px 32px", marginTop: 16, border: "1px solid var(--primary-mid)" }}>
            <h3 style={{ fontWeight: 800, color: "var(--primary)", marginBottom: 8, fontSize: "1.05rem" }}>Exercer vos droits</h3>
            <p style={{ color: "var(--gray-500)", fontSize: "0.97rem", lineHeight: 1.75 }}>
              Contactez notre délégué à la protection des données : <a href="mailto:privacy@prestalya.com" style={{ color: "var(--primary)", fontWeight: 600 }}>privacy@prestalya.com</a><br />
              Pour les réclamations : <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 600 }}>www.cnil.fr</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
