import { useParams, useNavigate } from "react-router-dom";
import { providers, weekDays } from "../data";
import "../styles/pages.css";

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const p = providers.find((x) => x.id === Number(id));

  if (!p) return (
    <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h2>Prestataire introuvable</h2>
      <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate("/prestataires")}>
        Retour aux prestataires
      </button>
    </div>
  );

  return (
    <main className="profile-page">
      <div className="container">
        <button className="profile-back" onClick={() => navigate("/prestataires")}>
          ← Retour aux résultats
        </button>

        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-top">
              {p.photo ? (
                <img className="profile-photo" src={p.photo} alt={p.name}
                  onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
              ) : null}
              <div className="profile-avatar" style={{ background: p.color, display: p.photo ? "none" : "flex" }}>
                {p.avatar}
              </div>

              <div className="profile-top-info">
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 5 }}>
                  <h1>{p.name}</h1>
                  {p.available
                    ? <span className="badge-available">● Disponible</span>
                    : <span className="badge-unavailable">● Indisponible</span>
                  }
                </div>
                <div className="profile-service">{p.service}</div>
                <div className="profile-location">📍 {p.city}, {p.district}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.97rem" }}>
                  <span className="stars">{"★".repeat(Math.round(p.rating))}</span>
                  <strong>{p.rating}</strong>
                  <span style={{ color: "var(--gray-500)" }}>({p.reviews} avis)</span>
                </div>
                <div className="profile-qualities">
                  {p.qualities.map((q, i) => (
                    <span key={i} className="quality-item">
                      <span className="quality-check">✓</span> {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-section">
                <h3>À propos</h3>
                <p>{p.description}</p>
              </div>

              <div className="profile-section">
                <h3>Services proposés</h3>
                <div className="skills-wrap">
                  {p.skills.map((s, i) => <span key={i} className="skill-pill">{s}</span>)}
                </div>
              </div>

              <div className="profile-section">
                <h3>Tarifs</h3>
                <table className="tarifs-table">
                  <tbody>
                    {p.tarifs.map((t, i) => (
                      <tr key={i}><td>{t.label}</td><td>{t.price}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="profile-section">
                <h3>Disponibilités</h3>
                <div className="dispo-grid">
                  {weekDays.map((day) => {
                    const slots = p.schedule[day] || [];
                    return (
                      <div key={day} className="dispo-day">
                        <div className="dispo-day-label">{day}</div>
                        {slots.length > 0
                          ? slots.map((s, i) => <div key={i} className="dispo-slot">{s}</div>)
                          : <div className="dispo-empty">—</div>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="profile-section">
                <h3>Avis clients</h3>
                <div className="reviews-list">
                  {p.testimonials.map((t, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <span className="review-author">{t.author}</span>
                        <span className="stars">{"★".repeat(t.note)}</span>
                      </div>
                      <p className="review-text">{t.text}</p>
                    </div>
                  ))}
                </div>
                <span className="see-all-reviews">Voir tous les avis ({p.reviews}) →</span>
              </div>
            </div>
          </div>

          <aside className="profile-sidebar">
            <div className="booking-widget">
              <div style={{ fontSize: "0.88rem", color: "var(--gray-500)", fontWeight: 600, marginBottom: 6 }}>Tarif indicatif</div>
              <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--navy)", marginBottom: 14 }}>{p.price}</div>
              <div className="booking-widget-rating">
                <span className="stars">{"★".repeat(Math.round(p.rating))}</span>
                <strong>{p.rating}</strong>
                <span>({p.reviews} avis)</span>
              </div>
              <hr className="widget-sep" />
              <button className="btn-primary" onClick={() => navigate("/reservation")}
                style={{ width: "100%", padding: "15px", justifyContent: "center" }}>
                Réserver ce prestataire
              </button>
            </div>

            <div className="booking-widget" style={{ marginTop: 16 }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 14 }}>Ce prestataire propose</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {p.qualities.map((q, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "0.97rem", color: "var(--gray-700)" }}>
                    <span style={{ color: "var(--green)", fontWeight: 800, fontSize: "1.05rem" }}>✓</span> {q}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
