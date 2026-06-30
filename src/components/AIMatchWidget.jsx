import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function AIMatchWidget({ providers }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [results, setResults]         = useState(null);
  const [loading, setLoading]         = useState(false);

  async function match() {
    if (!description.trim() || loading) return;
    setLoading(true);
    try {
      const matches = await api.post("/ai/match", { description, providers });
      setResults(matches);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }

  return (
    <div className="ai-match-box">
      <div className="ai-match-header">
        <span className="ai-match-icon">🎯</span>
        <div>
          <p className="ai-match-title">Trouvez le prestataire idéal</p>
          <p className="ai-match-sub">Décrivez votre besoin, nous sélectionnons les 3 meilleurs pour vous</p>
        </div>
      </div>

      <div className="ai-match-input-row">
        <input
          className="ai-match-input"
          placeholder="Ex: J'ai une fuite sous l'évier, besoin urgent…"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => e.key === "Enter" && match()}
        />
        <button className="ai-match-btn" onClick={match} disabled={!description.trim() || loading}>
          {loading ? <span className="ai-send-spinner" /> : "Trouver →"}
        </button>
      </div>

      {results !== null && (
        <div className="ai-match-results">
          {results.length === 0 ? (
            <p style={{ color: "var(--gray-400)", textAlign: "center", padding: "12px 0" }}>Aucun prestataire correspondant trouvé.</p>
          ) : results.map((p, i) => (
            <div key={i} className="ai-match-card" onClick={() => navigate(`/prestataires/${p.id}`)}>
              <div className="ai-match-rank">#{i + 1}</div>
              <div className="ai-match-info">
                <p className="ai-match-name">{p.prenom} {p.nom} <span className="ai-match-service">{p.service}</span></p>
                <p className="ai-match-raison">🎯 {p.ai_raison}</p>
                <p className="ai-match-meta">⭐ {parseFloat(p.rating||0).toFixed(1)} · {p.city}</p>
              </div>
              <button className="ai-match-voir">Voir →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
