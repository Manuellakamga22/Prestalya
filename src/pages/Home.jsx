import { Link, useNavigate } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import TestimonialCard from "../components/TestimonialCard";
import { services, testimonials } from "../data";
import { serviceIcons } from "../components/Icons";
import useReveal from "../hooks/useReveal";
import SEO from "../components/SEO";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  useReveal();


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Services à domicile",
    "provider": { "@type": "Organization", "name": "Prestalya", "url": "https://prestalya.com" },
    "areaServed": { "@type": "Country", "name": "France" },
    "description": "Mise en relation entre particuliers et prestataires de services à domicile vérifiés."
  };

  return (
    <main>
      <SEO
        title="Trouvez un prestataire fiable près de chez vous"
        description="Prestalya : réservez des prestataires vérifiés à domicile. Ménage, babysitting, aide informatique, coiffure, plomberie, électricité. Disponibles partout en France."
        path="/"
        jsonLd={jsonLd}
      />
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="container">
          <div className="hero-layout">
            <div>
              <div className="hero-badge">✨ Plateforme de confiance en France</div>
              <h1>Trouvez un prestataire fiable près de chez vous</h1>
              <p className="hero-subtitle">
                Réservez facilement des services à domicile : ménage, nettoyage, désinfection, aide informatique, babysitting et plus encore.
              </p>
              <div className="hero-actions">
                <Link to="/reservation" className="btn-primary">Réserver une prestation</Link>
                <Link to="/devenir-prestataire" className="btn-green">Devenir prestataire</Link>
              </div>
            </div>

            <div className="hero-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
                alt="Prestataire professionnelle à domicile"
                loading="eager"
              />
              <div className="hero-image-badge">
                <div className="badge-avatars">
                  {[{ bg: "#4A90D9" }, { bg: "#2ECC71" }, { bg: "#E91E8C" }].map((a, i) => (
                    <div key={i} className="mini-av" style={{ background: a.bg }}>✓</div>
                  ))}
                </div>
                <div className="badge-text">
                  <strong>500+ prestataires vérifiés</strong>
                  <span>Disponibles près de chez vous</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── Comment ça marche ─── */}
      <section className="how-it-works reveal">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">Réserver un prestataire n'a jamais été aussi simple. Trois étapes suffisent.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Choisissez un service</h3>
              <p>Parcourez notre catalogue de services et sélectionnez celui dont vous avez besoin.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Sélectionnez un prestataire</h3>
              <p>Consultez les profils, les avis et les tarifs puis choisissez le prestataire idéal.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Réservez votre créneau</h3>
              <p>Choisissez une date et un horaire qui vous convient. Confirmation immédiate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Avantages ─── */}
      <section className="advantages reveal">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pourquoi choisir Prestalya ?</h2>
            <p className="section-subtitle">Une plateforme conçue pour votre tranquillité d'esprit.</p>
          </div>
          <div className="advantages-grid">
            {[
              { icon: "✅", title: "Prestataires vérifiés", desc: "Tous nos professionnels sont contrôlés, évalués et validés avant d'accéder à la plateforme." },
              { icon: "⚡", title: "Réservation simple", desc: "Réservez en quelques clics, sans appel téléphonique, sans paperasse inutile." },
              { icon: "🔒", title: "Paiement sécurisé", desc: "Votre paiement est libéré uniquement après validation de votre prestation." },
              { icon: "⭐", title: "Avis clients", desc: "Consultez les avis vérifiés pour faire le meilleur choix (bientôt disponible)." },
            ].map((a, i) => (
              <div key={i} className="advantage-card">
                <div className="adv-icon">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section style={{ padding: "88px 0", background: "var(--gray-50)" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nos services</h2>
            <p className="section-subtitle">Des prestations pour tous vos besoins, assurées par des professionnels qualifiés.</p>
          </div>
          {(() => {
            const HOME_SLUGS = ["menage","babysitting","desinsectisation","deratisation","electricite","plomberie","coiffure","aide-informatique"];
            const homeServices = HOME_SLUGS.map(slug => services.find(s => s.slug === slug)).filter(Boolean);
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
                  {homeServices.slice(0, 4).map(s => <ServiceCard key={s.id} service={s} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22, marginTop: 22 }}>
                  {homeServices.slice(4, 8).map(s => <ServiceCard key={s.id} service={s} />)}
                </div>
              </>
            );
          })()}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link to="/services" className="btn-outline">Voir tous les services →</Link>
          </div>
        </div>
      </section>

      {/* ─── Témoignages ─── */}
      <section className="testimonials-section reveal">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Ce que disent nos clients</h2>
            <p className="section-subtitle">Des milliers de clients satisfaits font confiance à Prestalya.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => <TestimonialCard key={i} testimonial={t} />)}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Prêt à réserver votre prestation ?</h2>
              <p>Des professionnels fiables, disponibles près de chez vous.</p>
            </div>
            <div className="cta-actions">
              <Link to="/reservation" className="btn-white">Réserver maintenant</Link>
              <Link to="/prestataires" className="btn-outline-white">Voir les prestataires</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
