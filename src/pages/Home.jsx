import { Link } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import TestimonialCard from "../components/TestimonialCard";
import { services, testimonials } from "../data";
import "../styles/Home.css";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">✨ Plateforme de confiance en France</div>
            <h1>
              Trouvez un prestataire <span>fiable</span> près de chez vous
            </h1>
            <p className="hero-subtitle">
              Réservez facilement des services à domicile : ménage, nettoyage, désinfection, aide informatique, babysitting et plus encore.
            </p>
            <div className="hero-actions">
              <Link to="/reservation" className="btn-primary">Réserver une prestation</Link>
              <Link to="/devenir-prestataire" className="btn-secondary">Devenir prestataire</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>500+</strong>
                <span>Prestataires vérifiés</span>
              </div>
              <div className="hero-stat">
                <strong>2 000+</strong>
                <span>Réservations effectuées</span>
              </div>
              <div className="hero-stat">
                <strong>4.8/5</strong>
                <span>Note moyenne</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services populaires */}
      <section className="home-services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nos services populaires</h2>
            <p className="section-subtitle">Des prestations pour tous vos besoins, assurées par des professionnels qualifiés.</p>
          </div>
          <div className="services-grid">
            {services.slice(0, 4).map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link to="/services" className="btn-secondary">Voir tous les services</Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">Réserver un prestataire n'a jamais été aussi simple. Trois étapes suffisent.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Choisissez un service</h3>
              <p>Parcourez notre catalogue de services et sélectionnez celui dont vous avez besoin.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Sélectionnez un prestataire</h3>
              <p>Consultez les profils, les avis et les tarifs pour choisir le prestataire idéal.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Réservez votre créneau</h3>
              <p>Choisissez une date et un horaire qui vous convient. Confirmation immédiate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="advantages">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pourquoi choisir Prestalya ?</h2>
            <p className="section-subtitle">Une plateforme conçue pour votre tranquillité d'esprit.</p>
          </div>
          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="advantage-icon">✅</div>
              <div>
                <h3>Prestataires vérifiés</h3>
                <p>Tous nos prestataires sont contrôlés, évalués et validés avant d'accéder à la plateforme.</p>
              </div>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">🚀</div>
              <div>
                <h3>Réservation simple</h3>
                <p>Réservez en quelques clics, sans appel téléphonique, sans paperasse inutile.</p>
              </div>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">🔒</div>
              <div>
                <h3>Paiement sécurisé</h3>
                <p>Votre paiement est sécurisé et n'est libéré qu'après validation de votre prestation.</p>
              </div>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">⭐</div>
              <div>
                <h3>Avis clients vérifiés</h3>
                <p>Les avis sont publiés uniquement par des clients ayant réellement utilisé le service.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Ce que disent nos clients</h2>
            <p className="section-subtitle">Des milliers de clients satisfaits font confiance à Prestalya.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="cta-section">
        <div className="container">
          <h2>Prêt à déléguer vos tâches ?</h2>
          <p>Rejoignez des milliers de clients qui font confiance à Prestalya pour leurs services à domicile.</p>
          <div className="cta-buttons">
            <Link to="/reservation" className="btn-primary">Réserver maintenant</Link>
            <Link to="/prestataires" className="btn-secondary">Voir les prestataires</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
