import SEO from "../components/SEO";
import "../styles/pages.css";

export default function MentionsLegales() {
  const rows = [
    ["Raison sociale", "Prestalya SAS"],
    ["Capital social", "10 000 €"],
    ["Siège social", "12 rue de la Paix, 75002 Paris, France"],
    ["SIRET", "123 456 789 00010"],
    ["RCS", "Paris B 123 456 789"],
    ["N° TVA intracommunautaire", "FR 12 123456789"],
    ["Directeur de publication", "Emmanuel Dupont"],
    ["Email de contact", "manuellakamga20@gmail.com"],
    ["Téléphone", "+33 6 34 66 01 03"],
  ];

  return (
    <main>
      <SEO
        title="Mentions légales"
        description="Mentions légales de Prestalya SAS : éditeur du site, hébergeur, propriété intellectuelle et responsabilités."
        path="/mentions-legales"
      />
      <section className="page-hero">
        <div className="container">
          <h1>Mentions légales</h1>
          <p>Informations légales relatives à la société Prestalya SAS.</p>
        </div>
      </section>

      <section style={{ padding: "64px 0 96px" }}>
        <div className="container" style={{ maxWidth: 760 }}>

          <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid rgba(124,58,237,0.07)", overflow: "hidden", marginBottom: 48 }}>
            <div style={{ background: "var(--grad-primary)", padding: "20px 28px" }}>
              <h2 style={{ color: "white", fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>Éditeur du site</h2>
            </div>
            <div style={{ padding: "0 28px" }}>
              {rows.map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--gray-100)", gap: 16 }}>
                  <span style={{ color: "var(--gray-500)", fontSize: "0.97rem", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.97rem", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            { title: "Hébergement", content: "Le site Prestalya est hébergé par OVHcloud, SAS au capital de 10 174 560 €, dont le siège social est situé 2 rue Kellermann – 59100 Roubaix – France. Téléphone : 1007." },
            { title: "Propriété intellectuelle", content: "L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes) est protégé par le droit d'auteur. Toute reproduction, même partielle, sans autorisation préalable écrite de Prestalya SAS est strictement interdite et constituerait une contrefaçon sanctionnée par les articles L335-2 et suivants du Code de la propriété intellectuelle." },
            { title: "Liens hypertextes", content: "Le site Prestalya peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre informatif uniquement. Prestalya n'est pas responsable du contenu de ces sites externes et ne peut être tenu responsable des dommages pouvant résulter de leur consultation." },
            { title: "Cookies", content: "Le site utilise uniquement des cookies strictement nécessaires au fonctionnement technique (session, authentification). Aucun cookie publicitaire ou de tracking tiers n'est déposé sans votre consentement explicite." },
            { title: "Droit applicable et juridiction", content: "Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux compétents de Paris seront saisis, sauf disposition légale contraire." },
          ].map((s) => (
            <div key={s.title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{s.title}</h2>
              <p style={{ color: "var(--gray-500)", lineHeight: 1.85 }}>{s.content}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
