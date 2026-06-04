import { useNavigate } from "react-router-dom";
import "../styles/cards.css";

function Stars({ rating }) {
  return (
    <span className="stars">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function ProviderCard({ provider }) {
  const navigate = useNavigate();

  return (
    <div className="provider-card">
      <div className="provider-card-header">
        <div className="avatar" style={{ background: provider.color }}>
          {provider.avatar}
        </div>
        <div className="provider-card-info">
          <h3>{provider.name}</h3>
          <span className="provider-service-badge">{provider.service}</span>
          <div className="provider-card-meta">
            <span className="provider-meta-item">📍 {provider.city}</span>
            <span className="provider-meta-item">💰 {provider.price}</span>
          </div>
          <div className="provider-card-rating">
            <Stars rating={provider.rating} />
            <strong>{provider.rating}</strong>
            <span>({provider.reviews} avis)</span>
          </div>
        </div>
      </div>

      {provider.available ? (
        <span className="badge-available">✓ Disponible</span>
      ) : (
        <span className="badge-unavailable">Indisponible</span>
      )}

      <div className="provider-card-footer">
        <button className="btn-secondary" onClick={() => navigate(`/prestataires/${provider.id}`)}>
          Voir le profil
        </button>
        <button className="btn-primary" onClick={() => navigate("/reservation")}>
          Réserver
        </button>
      </div>
    </div>
  );
}
