import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api, API_ORIGIN } from "../api";
import SEO from "../components/SEO";
import "../styles/chat.css";

const SOCKET_URL = API_ORIGIN;

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherPhoto, setOtherPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/connexion"); return; }
    const u = JSON.parse(stored);
    setUser(u);

    // Charger les messages via REST
    Promise.all([
      api.get(`/chat/${id}/messages`),
      api.get("/chat"),
    ]).then(([msgs, convs]) => {
      setMessages(msgs);
      // Trouver le nom de l'autre participant
      const conv = convs.find(c => c._id === id);
      if (conv) {
        setOtherName(conv.other_name || "");
        setOtherPhoto(conv.other_photo || null);
      }
    }).catch(() => navigate(u.role === "prestataire" ? "/prestataire" : "/dashboard"))
      .finally(() => setLoading(false));

    // Socket pour temps réel
    const socket = io(SOCKET_URL, { auth: { token: u.token } });
    socketRef.current = socket;

    socket.emit("join_conversation", id);

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      socket.emit("mark_read", id);
    });

    socket.on("user_typing", () => setOtherTyping(true));
    socket.on("user_stop_typing", () => setOtherTyping(false));

    return () => {
      socket.emit("leave_conversation", id);
      socket.disconnect();
      clearTimeout(typingTimer.current);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;
    // Émettre via socket (correspondance avec chatSocket.js)
    socketRef.current.emit("send_message", { convId: id, content: text.trim() });
    setText("");
    stopTyping();
  };

  const startTyping = () => {
    if (!typing) {
      setTyping(true);
      socketRef.current?.emit("typing", { convId: id });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    setTyping(false);
    socketRef.current?.emit("stop_typing", { convId: id });
    clearTimeout(typingTimer.current);
  };

  const backLink = user?.role === "prestataire" ? "/prestataire" : "/dashboard";

  return (
    <main className="chat-page">
      <SEO title="Messagerie" description="Échangez avec votre prestataire." path={`/chat/${id}`} />

      <div className="chat-container">
        <div className="chat-header">
          <button className="chat-back" onClick={() => navigate(backLink)}>← Retour</button>
          <div className="chat-header-info">
            <div className="chat-header-avatar" style={{ overflow: "hidden" }}>
              {otherPhoto
                ? <img src={`${API_ORIGIN}${otherPhoto}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : (otherName?.[0] || "?")}
            </div>
            <div>
              <p className="chat-header-name">{otherName || "Conversation"}</p>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {loading && <p style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>Chargement…</p>}
          {!loading && messages.length === 0 && (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>
              Commencez la conversation !
            </p>
          )}
          {messages.map((m, i) => {
            const isMe = m.senderId === user?.id || m.sender_id === user?.id;
            const time = m.createdAt || m.created_at;
            return (
              <div key={m._id || i} className={`chat-msg ${isMe ? "mine" : "theirs"}`}>
                {!isMe && <span className="chat-sender">{m.senderName || otherName}</span>}
                <div className="chat-bubble">{m.content}</div>
                <span className="chat-time">
                  {time ? new Date(time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            );
          })}
          {otherTyping && (
            <div className="chat-msg theirs">
              <div className="chat-bubble chat-typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            className="chat-input"
            value={text}
            onChange={(e) => { setText(e.target.value); startTyping(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
            placeholder="Écrire un message…"
            autoComplete="off"
          />
          <button type="submit" className="chat-send" disabled={!text.trim()}>
            Envoyer
          </button>
        </form>
      </div>
    </main>
  );
}
