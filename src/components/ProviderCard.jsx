import { useNavigate } from "react-router-dom";
import "../styles/cards.css";

export default function ProviderCard({ provider }) {
  const navigate = useNavigate();

  return (
    <div className="provider-card">
      {provider.photo ? (
        <img
          className="provider-photo"
          src={provider.photo}
          alt={provider.name}
          onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        />
      ) : null}
      <div
        className="provider-avatar-fallback"
        style={{ background: provider.color, display: provider.photo ? "none" : "flex" }}
      >
        {provider.avatar}
      </div>

      <div className="provider-info">
        <div className="provider-name">{provider.name}</div>
        <span className="provider-service-tag">{provider.service}</span>
        <div className="provider-location">📍 {provider.city}, {provider.district}</div>
        <div className="provider-rating">
          <span className="stars">{"★".repeat(Math.round(provider.rating))}</span>
          <strong>{provider.rating}</strong>
          <span>({provider.reviews} avis)</span>
          <span style={{ margin: "0 4px", color: "var(--gray-300)" }}>·</span>
          <span>{provider.price}</span>
        </div>
      </div>

      <div className="provider-right">
        {provider.available
          ? <span className="badge-available">● Disponible</span>
          : <span className="badge-unavailable">● Indisponible</span>
        }
        <div className="provider-actions">
          <button className="btn-outline" onClick={() => navigate(`/prestataires/${provider.id}`)}>
            Voir le profil
          </button>
          <button className="btn-primary" onClick={() => navigate("/reservation")}>
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
