import { useNavigate } from "react-router-dom";
import "../styles/cards.css";

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <div className="service-card" onClick={() => navigate("/prestataires")}>
      <div style={{ overflow: "hidden" }}>
        <img
          className="service-card-img"
          src={service.photo}
          alt={service.title}
          loading="lazy"
        />
      </div>
      <div className="service-card-body">
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <span className="service-card-link">
          Voir les prestataires <span>→</span>
        </span>
      </div>
    </div>
  );
}
