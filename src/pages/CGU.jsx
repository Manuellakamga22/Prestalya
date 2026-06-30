import SEO from "../components/SEO";
import "../styles/pages.css";

const sections = [
  { title: "1. Objet", text: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Prestalya, accessible à l'adresse prestalya.com. En accédant à la plateforme, vous acceptez sans réserve les présentes conditions." },
  { title: "2. Description du service", text: "Prestalya est une plateforme de mise en relation entre des particuliers ou entreprises (« Clients ») et des professionnels du service à domicile (« Prestataires »). Prestalya agit en qualité d'intermédiaire et n'est pas partie aux contrats conclus entre Clients et Prestataires." },
  { title: "3. Inscription et compte", text: "L'accès à certaines fonctionnalités nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir leur exactitude. Toute utilisation frauduleuse ou non autorisée du compte est strictement interdite." },
  { title: "4. Utilisation de la plateforme", text: "L'utilisateur s'engage à utiliser la plateforme conformément aux lois en vigueur, à ne pas perturber le fonctionnement du service, à ne pas publier de contenu illicite, trompeur ou offensant, et à respecter les droits des tiers." },
  { title: "5. Réservations et paiements", text: "Les réservations effectuées via la plateforme sont soumises à la disponibilité du prestataire. Le paiement est sécurisé via notre prestataire Stripe. Les tarifs affichés sont TTC. Prestalya se réserve le droit de modifier ses tarifs de commission à tout moment." },
  { title: "6. Annulations et remboursements", text: "Les conditions d'annulation varient selon les prestataires. En règle générale, toute annulation plus de 24h avant la prestation est remboursée intégralement. Les annulations tardives peuvent entraîner des frais. En cas de litige, Prestalya intervient en médiateur." },
  { title: "7. Responsabilité", text: "Prestalya met tout en œuvre pour assurer la qualité des prestataires référencés mais ne peut garantir les résultats des prestations. La responsabilité de Prestalya est limitée au montant des commissions perçues. Prestalya n'est pas responsable des dommages indirects." },
  { title: "8. Propriété intellectuelle", text: "Tous les éléments de la plateforme (logo, textes, images, design) sont la propriété exclusive de Prestalya SAS et sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite." },
  { title: "9. Modification des CGU", text: "Prestalya se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email des modifications substantielles. L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles conditions." },
  { title: "10. Droit applicable", text: "Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, les tribunaux compétents de Paris seront saisis." },
];

export default function CGU() {
  return (
    <main>
      <SEO
        title="Conditions Générales d'Utilisation"
        description="Consultez les CGU de Prestalya : conditions d'accès, responsabilités, paiements, propriété intellectuelle et droit applicable."
        path="/cgu"
      />
      <section className="page-hero">
        <div className="container">
          <h1>Conditions Générales d'Utilisation</h1>
          <p>Dernière mise à jour : janvier 2025</p>
        </div>
      </section>

      <section style={{ padding: "64px 0 96px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius)", padding: "18px 24px", marginBottom: 40, border: "1px solid var(--primary-mid)" }}>
            <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.97rem" }}>
              📋 En utilisant Prestalya, vous acceptez les présentes conditions. Veuillez les lire attentivement.
            </p>
          </div>
          {sections.map((s) => (
            <div key={s.title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{s.title}</h2>
              <p style={{ color: "var(--gray-500)", lineHeight: 1.85, fontSize: "1rem" }}>{s.text}</p>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 32, marginTop: 16 }}>
            <p style={{ color: "var(--gray-400)", fontSize: "0.93rem" }}>
              Pour toute question relative aux présentes CGU, contactez-nous à <a href="mailto:legal@prestalya.com" style={{ color: "var(--primary)" }}>legal@prestalya.com</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
