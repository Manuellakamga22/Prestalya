import { Link } from "react-router-dom";
import "../styles/pages.css";
import "../styles/Home.css";

export default function About() {
  return (
    <main className="about-page">
      <section className="page-hero">
        <div className="container">
          <h1>À propos de Prestalya</h1>
          <p>Une startup française qui simplifie l'accès aux services à domicile de confiance.</p>
        </div>
      </section>

      <section className="about-intro">
        <div className="container">
          <div className="about-intro-grid">
            <div>
              <h2>Notre mission</h2>
              <p>
                Prestalya est née d'un constat simple : trouver un prestataire à domicile fiable, disponible et au juste prix est souvent une vraie galère. Bouche à oreille incertain, annonces douteuses, comparaison impossible.
              </p>
              <p>
                Notre mission est de changer cela. Nous mettons en relation les particuliers avec des prestataires vérifiés pour tous leurs besoins du quotidien : ménage, coiffure, babysitting, informatique, dépannage et bien plus.
              </p>
              <p>
                Prestalya, c'est la confiance retrouvée dans les services à domicile.
              </p>
            </div>
            <div className="about-visual">
              <div className="about-visual-icon">🏠</div>
              <h3>Des services à domicile pensés pour vous</h3>
              <p>Trouvez, comparez et réservez en quelques clics.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-numbers">
        <div className="container">
          <div className="numbers-grid">
            <div className="number-item">
              <strong>500+</strong>
              <span>Prestataires vérifiés</span>
            </div>
            <div className="number-item">
              <strong>2 000+</strong>
              <span>Réservations effectuées</span>
            </div>
            <div className="number-item">
              <strong>4.8/5</strong>
              <span>Note moyenne clients</span>
            </div>
            <div className="number-item">
              <strong>8</strong>
              <span>Catégories de services</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nos valeurs</h2>
            <p className="section-subtitle">Ce en quoi nous croyons et ce qui guide chaque décision chez Prestalya.</p>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <h3>🤝 Confiance</h3>
              <p>Tous nos prestataires sont vérifiés, validés et évalués. Nous ne laissons rien au hasard pour garantir votre sécurité.</p>
            </div>
            <div className="value-card">
              <h3>✨ Simplicité</h3>
              <p>Réserver ne devrait pas être compliqué. Prestalya rend le processus fluide, rapide et accessible à tous.</p>
            </div>
            <div className="value-card">
              <h3>💚 Engagement local</h3>
              <p>Nous valorisons les professionnels locaux et aidons les talents de votre région à développer leur activité.</p>
            </div>
            <div className="value-card">
              <h3>📊 Transparence</h3>
              <p>Tarifs visibles, avis vérifiés, profils honnêtes. Pas de surprises, pas de frais cachés.</p>
            </div>
            <div className="value-card">
              <h3>🔒 Sécurité</h3>
              <p>Vos données personnelles sont protégées. Vos paiements seront sécurisés. Votre vie privée est respectée.</p>
            </div>
            <div className="value-card">
              <h3>🌍 Accessibilité</h3>
              <p>Des services pensés pour tous, partout en France, à des tarifs justes et compétitifs.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Rejoignez la communauté Prestalya</h2>
          <p>Client ou prestataire, votre place est chez nous.</p>
          <div className="cta-buttons">
            <Link to="/reservation" className="btn-primary">Réserver maintenant</Link>
            <Link to="/devenir-prestataire" className="btn-secondary">Devenir prestataire</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
