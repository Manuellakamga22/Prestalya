import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_ORIGIN } from "../api";
import "../styles/ai-assistant.css";

const SUGGESTIONS = [
  "J'ai une fuite d'eau",
  "Je cherche quelqu'un pour le ménage",
  "Mon électricité ne fonctionne plus",
  "Je veux une baby-sitter ce week-end",
  "J'ai des cafards chez moi",
];

const WELCOME = {
  role: "assistant",
  content: "Bonjour ! 👋 Je suis l'assistant de **Prestalya**. Décrivez votre besoin et je vous aide à trouver le bon prestataire !",
};

export default function AIAssistant() {
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [suggested, setSuggested] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  async function send(text) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    setSuggested(null);

    const userMsg = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // build history excluding the static welcome message
      const apiMessages = [...messages, userMsg]
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_ORIGIN}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.message };
      setMessages(prev => [...prev, aiMsg]);

      if (data.suggestedService && data.suggestedLink) {
        setSuggested({ service: data.suggestedService, link: data.suggestedLink });
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Désolé, je rencontre un problème technique. Réessayez dans un instant.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([WELCOME]);
    setInput("");
    setSuggested(null);
  }

  function renderText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  }

  return (
    <>
      {/* Floating button */}
      <button className={`ai-fab ${open ? "open" : ""}`} onClick={() => setOpen(o => !o)} aria-label="Besoin d'aide ?">
        {open ? "✕" : <><span className="ai-fab-icon">💬</span><span className="ai-fab-label">Besoin d'aide ?</span></>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="ai-panel-avatar">💬</div>
              <div>
                <p className="ai-panel-title">Assistant Prestalya</p>
                <p className="ai-panel-sub">En ligne</p>
              </div>
            </div>
            <button className="ai-panel-reset" onClick={reset} title="Nouvelle conversation">↺</button>
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-bubble ${m.role}`}>
                {m.role === "assistant" && <div className="ai-bubble-avatar">💬</div>}
                <div
                  className="ai-bubble-text"
                  dangerouslySetInnerHTML={{ __html: renderText(m.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="ai-bubble assistant">
                <div className="ai-bubble-avatar">💬</div>
                <div className="ai-bubble-text ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {suggested && !loading && (
              <div className="ai-suggestion-card">
                <p className="ai-suggestion-label">Service identifié</p>
                <p className="ai-suggestion-service">{suggested.service}</p>
                <button className="ai-suggestion-btn" onClick={() => { navigate(suggested.link); setOpen(false); }}>
                  Réserver maintenant →
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="ai-quick-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="ai-quick-btn" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="ai-input-row">
            <input
              ref={inputRef}
              className="ai-input"
              placeholder="Décrivez votre besoin…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading}
            />
            <button className="ai-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
              {loading ? <span className="ai-send-spinner" /> : "➤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
