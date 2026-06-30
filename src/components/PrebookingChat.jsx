import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ORIGIN } from "../api";

export default function PrebookingChat({ service, providerId, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resume, setResume]     = useState(null);

  async function send() {
    const content = input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch(`${API_ORIGIN}/api/ai/prebooking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, service }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.message }]);
      if (data.resume) setResume(data.resume);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Désolé, une erreur est survenue." }]);
    } finally { setLoading(false); }
  }

  function goBook() {
    navigate(`/reservation?service=${encodeURIComponent(service)}&provider=${providerId}&resume=${encodeURIComponent(resume || "")}`);
    onClose?.();
  }

  return (
    <div className="pb-overlay">
      <div className="pb-modal">
        <div className="pb-header">
          <span>💬 Assistant réservation — {service}</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="pb-messages">
          {messages.length === 0 && (
            <div className="pb-bubble assistant">
              Bonjour ! Pour mieux vous mettre en relation avec ce prestataire, pouvez-vous me décrire votre besoin en quelques mots ?
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`pb-bubble ${m.role}`}>
              {m.content.replace(/RÉSUMÉ:.*/i, "").trim()}
            </div>
          ))}
          {loading && <div className="pb-bubble assistant pb-typing"><span/><span/><span/></div>}
        </div>

        {resume ? (
          <div className="pb-resume">
            <p><strong>Résumé :</strong> {resume}</p>
            <button className="btn-primary" onClick={goBook}>Réserver maintenant →</button>
          </div>
        ) : (
          <div className="pb-input-row">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Décrivez votre besoin…"
              disabled={loading}
            />
            <button onClick={send} disabled={!input.trim() || loading}>➤</button>
          </div>
        )}
      </div>
    </div>
  );
}
