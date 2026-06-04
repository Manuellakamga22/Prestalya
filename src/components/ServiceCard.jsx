import { useNavigate } from "react-router-dom";
import "../styles/cards.css";

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <div className="service-card">
      <div className="service-card-icon">{service.icon}</div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <button className="btn-primary" onClick={() => navigate("/prestataires")}>
        Voir les prestataires
      </button>
    </div>
  );
}
