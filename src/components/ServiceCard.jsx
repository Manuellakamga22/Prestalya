import { useNavigate } from "react-router-dom";
import { serviceIcons } from "./Icons";
import "../styles/cards.css";

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const Icon = serviceIcons[service.slug];

  return (
    <div className="service-card" onClick={() => navigate("/prestataires")}>
      <div className="service-card-icon">
        {Icon ? <Icon size={26} /> : <span style={{ fontSize: "1.4rem" }}>🔧</span>}
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span className="service-card-link">
        Voir les prestataires <span>→</span>
      </span>
    </div>
  );
}
