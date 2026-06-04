import { Link } from "react-router-dom";
import "../styles/pages.css";
import "../styles/Home.css";

export default function About() {
  return (
    <main className="about-page">
      <section className="page-hero">
        <div className="container">
          <h1>À propos de Prestalya</h1>
          <p>Prestalya est la plateforme qui connecte les particuliers et les professionnels des services à domicile.</p>
        </div>
      </section>

      <section className="about-intro">
        <div className="container">
          <div className="about-intro-grid">
            <div>
              <h2>Notre mission</h2>
              <p>Prestalya est née d'un constat simple : trouver un prestataire à domicile fiable, disponible et au juste prix est souvent compliqué.</p>
              <p>Notre mission est de simplifier l'accès aux services à domicile en mettant en relation les particuliers avec des prestataires vérifiés pour tous leurs besoins du quotidien.</p>
              <p>Prestalya, c'est la confiance retrouvée dans les services à domicile.</p>
            </div>
            <div className="about-visual">
              <span className="vis-icon">🏠</span>
              <h3>Services à domicile pensés pour vous</h3>
              <p>Trouvez, comparez et réservez en quelques clics, partout en France.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-mission">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 36 }}>
            <h2 className="section-title">Ce qui nous anime</h2>
          </div>
          <div className="mission-cards">
            <div className="mission-card">
              <div className="m-icon">🎯</div>
              <h3>Notre mission</h3>
              <p>Simplifier votre quotidien en vous connectant à des professionnels fiables et qualifiés, disponibles près de chez vous.</p>
            </div>
            <div className="mission-card">
              <div className="m-icon">🌍</div>
              <h3>Notre vision</h3>
              <p>Devenir la référence des services à domicile en France, en offrant une expérience simple, transparente et de qualité.</p>
            </div>
            <div className="mission-card">
              <div className="m-icon">💎</div>
              <h3>Nos valeurs</h3>
              <p>Confiance, simplicité, qualité et proximité. Tout ce que nous faisons est guidé par le souci de bien vous servir.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-numbers">
        <div className="container">
          <div className="numbers-grid">
            <div className="number-item"><strong>500+</strong><span>Prestataires vérifiés</span></div>
            <div className="number-item"><strong>2 000+</strong><span>Réservations effectuées</span></div>
            <div className="number-item"><strong>4.8/5</strong><span>Note moyenne clients</span></div>
            <div className="number-item"><strong>8</strong><span>Catégories de services</span></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Rejoignez la communauté Prestalya</h2>
              <p>Client ou prestataire, votre place est chez nous.</p>
            </div>
            <div className="cta-actions">
              <Link to="/reservation" className="btn-white">Réserver maintenant</Link>
              <Link to="/devenir-prestataire" className="btn-outline-white">Devenir prestataire</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
