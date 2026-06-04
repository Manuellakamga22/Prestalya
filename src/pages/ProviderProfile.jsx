import { useParams, useNavigate } from "react-router-dom";
import { providers } from "../data";
import "../styles/pages.css";

function Stars({ rating }) {
  return (
    <span className="stars">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = providers.find((p) => p.id === Number(id));

  if (!provider) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2>Prestataire introuvable</h2>
        <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate("/prestataires")}>
          Retour aux prestataires
        </button>
      </div>
    );
  }

  return (
    <main className="profile-page">
      <div className="container">
        <button className="profile-back" onClick={() => navigate("/prestataires")}>
          ← Retour aux prestataires
        </button>

        <div className="profile-layout">
          <div className="profile-main">
            <div className="profile-header">
              <div className="profile-avatar-large" style={{ background: provider.color }}>
                {provider.avatar}
              </div>
              <div className="profile-header-info">
                <h1>{provider.name}</h1>
                <p>{provider.service}</p>
                <div className="profile-meta">
                  <span>📍 {provider.city}</span>
                  <span>💰 {provider.price}</span>
                  {provider.available ? (
                    <span className="badge-available">✓ Disponible</span>
                  ) : (
                    <span className="badge-unavailable">Indisponible</span>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-section">
                <h3>À propos</h3>
                <p>{provider.description}</p>
              </div>

              <div className="profile-section">
                <h3>Compétences</h3>
                <div className="skills-list">
                  {provider.skills.map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3>Disponibilités</h3>
                <div className="schedule-list">
                  {provider.schedule.map((s, i) => (
                    <div key={i} className="schedule-item">
                      <div className="schedule-dot"></div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3>Avis clients ({provider.testimonials.length})</h3>
                <div className="reviews-list">
                  {provider.testimonials.map((t, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <span className="review-author">{t.author}</span>
                        <Stars rating={t.note} />
                      </div>
                      <p className="review-text">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="profile-sidebar">
            <div className="booking-widget">
              <h3>Tarif indicatif</h3>
              <div className="widget-price">{provider.price}</div>
              <div className="widget-rating">
                <Stars rating={provider.rating} />
                <span><strong>{provider.rating}</strong> ({provider.reviews} avis)</span>
              </div>
              <hr className="widget-divider" />
              <button className="btn-primary widget-book-btn" onClick={() => navigate("/reservation")}>
                Réserver ce prestataire
              </button>
            </div>

            <div className="booking-widget">
              <h3>Service proposé</h3>
              <p style={{ color: "var(--gray-text)", marginTop: 8, fontSize: "0.95rem" }}>{provider.service}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
