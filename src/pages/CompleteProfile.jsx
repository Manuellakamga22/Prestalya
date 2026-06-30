import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, API_ORIGIN } from "../api";
import SEO from "../components/SEO";
import "../styles/complete-profile.css";

const DOCS = [
  {
    type:     "identite",
    label:    "Pièce d'identité",
    icon:     "🪪",
    required: true,
    desc:     "CNI recto-verso ou passeport en cours de validité.",
    formats:  "JPG, PNG, PDF · max 10 Mo",
  },
  {
    type:     "casier",
    label:    "Casier judiciaire B3",
    icon:     "📋",
    required: true,
    desc:     "Extrait de casier judiciaire de moins de 3 mois (téléchargeable sur justice.fr).",
    formats:  "JPG, PNG, PDF · max 10 Mo",
  },
  {
    type:     "domicile",
    label:    "Justificatif de domicile",
    icon:     "🏠",
    required: false,
    desc:     "Facture EDF, eau, gaz ou quittance de loyer de moins de 3 mois.",
    formats:  "JPG, PNG, PDF · max 10 Mo",
  },
  {
    type:     "diplome",
    label:    "Diplôme / Certification professionnelle",
    icon:     "🎓",
    required: false,
    desc:     "Tout document attestant de vos compétences (diplôme, attestation de formation…).",
    formats:  "JPG, PNG, PDF · max 10 Mo",
  },
  {
    type:     "siret_doc",
    label:    "Extrait Kbis / Avis de situation SIRET",
    icon:     "🏢",
    required: false,
    desc:     "Si vous exercez en tant qu'auto-entrepreneur ou société.",
    formats:  "JPG, PNG, PDF · max 10 Mo",
  },
];

const STATUS_STYLE = {
  en_attente: { bg: "#FEF3C7", color: "#92400E", icon: "⏳", label: "En attente" },
  valide:     { bg: "#D1FAE5", color: "#065F46", icon: "✅", label: "Validé" },
  rejete:     { bg: "#FEE2E2", color: "#991B1B", icon: "❌", label: "Refusé" },
};

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [uploaded, setUploaded]   = useState({});   // type → doc object
  const [uploading, setUploading] = useState({});   // type → bool
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]     = useState(true);
  const refs = useRef({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/connexion"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "prestataire") { navigate("/dashboard"); return; }
    setUser(u);

    api.get("/documents/me")
      .then(docs => {
        const map = {};
        docs.forEach(d => { map[d.type] = d; });
        setUploaded(map);
        const hasSubmitted = docs.length > 0 && docs.every(d => d.status !== undefined);
        setSubmitted(u.docs_submitted || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(type, label, file) {
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      form.append("label", label);
      const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
      const res = await fetch(`${API_ORIGIN}/api/documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur upload");
      }
      const doc = await res.json();
      setUploaded(prev => ({ ...prev, [type]: doc }));
    } catch (e) {
      setErrors(prev => ({ ...prev, [type]: e.message }));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  }

  async function handleSubmit() {
    const requiredMissing = DOCS.filter(d => d.required && !uploaded[d.type]);
    if (requiredMissing.length > 0) {
      alert(`Documents obligatoires manquants : ${requiredMissing.map(d => d.label).join(", ")}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/documents/submit", {});
      setSubmitted(true);
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  }

  const requiredDone = DOCS.filter(d => d.required).every(d => uploaded[d.type]);

  if (loading) return <div className="cp-loading">Chargement…</div>;

  return (
    <main className="cp-page">
      <SEO title="Compléter mon profil" description="Vérification de votre identité prestataire Prestalya." path="/completer-profil" />

      <div className="cp-container">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-icon">🔐</div>
          <div>
            <h1 className="cp-title">Vérifiez votre identité</h1>
            <p className="cp-subtitle">
              Pour garantir la sécurité de nos clients, nous vérifions l'identité de chaque prestataire.
              Une fois validé, vous obtiendrez le badge <strong>✓ Vérifié</strong> sur votre profil.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="cp-progress-row">
          {DOCS.map(d => {
            const doc = uploaded[d.type];
            const st  = doc ? STATUS_STYLE[doc.status] : null;
            return (
              <div key={d.type} className={`cp-progress-step ${doc ? "done" : ""}`}>
                <div className="cp-progress-circle" style={st ? { background: st.bg, color: st.color } : {}}>
                  {doc ? st.icon : d.icon}
                </div>
                <span className="cp-progress-label">{d.label.split(" ")[0]}</span>
                {d.required && !doc && <span className="cp-required-dot" />}
              </div>
            );
          })}
        </div>

        {/* Submitted banner */}
        {submitted && (
          <div className="cp-banner success">
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <div>
              <p style={{ fontWeight: 800, margin: "0 0 3px" }}>Dossier soumis avec succès !</p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#065f46" }}>
                Notre équipe examine vos documents sous 24–48h. Vous recevrez une notification dès la validation.
              </p>
            </div>
          </div>
        )}

        {/* Document cards */}
        <div className="cp-docs">
          {DOCS.map(d => {
            const doc = uploaded[d.type];
            const st  = doc ? STATUS_STYLE[doc.status] : null;
            const isUploading = uploading[d.type];
            const err = errors[d.type];

            return (
              <div key={d.type} className={`cp-doc-card ${doc ? "has-doc" : ""} ${doc?.status === "rejete" ? "rejected" : ""}`}>
                <div className="cp-doc-header">
                  <span className="cp-doc-icon">{d.icon}</span>
                  <div className="cp-doc-info">
                    <p className="cp-doc-label">
                      {d.label}
                      {d.required && <span className="cp-required-tag">Obligatoire</span>}
                    </p>
                    <p className="cp-doc-desc">{d.desc}</p>
                  </div>
                  {doc && st && (
                    <span className="cp-doc-status" style={{ background: st.bg, color: st.color }}>
                      {st.icon} {st.label}
                    </span>
                  )}
                </div>

                {doc?.status === "rejete" && doc.reject_reason && (
                  <div className="cp-reject-reason">
                    <strong>Motif de refus :</strong> {doc.reject_reason}
                  </div>
                )}

                {doc?.status !== "valide" && (
                  <div className="cp-doc-upload">
                    <input
                      ref={el => refs.current[d.type] = el}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      style={{ display: "none" }}
                      onChange={e => handleUpload(d.type, d.label, e.target.files?.[0])}
                    />
                    <button
                      className={`cp-upload-btn ${doc ? "replace" : ""}`}
                      onClick={() => refs.current[d.type]?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <><span className="cp-spinner" /> Envoi en cours…</>
                      ) : doc ? (
                        <>🔄 Remplacer le document</>
                      ) : (
                        <>📎 Choisir un fichier</>
                      )}
                    </button>
                    <span className="cp-formats">{d.formats}</span>
                  </div>
                )}

                {doc && doc.status !== "rejete" && (
                  <div className="cp-doc-file">
                    <span>📄 {doc.original_name}</span>
                    <span style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}>
                      Déposé le {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}

                {err && <p className="cp-error">{err}</p>}
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        {!submitted && (
          <div className="cp-submit-row">
            <div className="cp-submit-info">
              <span style={{ color: requiredDone ? "#059669" : "#D97706", fontWeight: 700 }}>
                {requiredDone ? "✅ Documents obligatoires déposés" : "⚠️ Pièce d'identité et casier judiciaire obligatoires"}
              </span>
              <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", margin: "4px 0 0" }}>
                Vous pourrez ajouter d'autres documents après soumission.
              </p>
            </div>
            <button
              className="btn-primary cp-submit-btn"
              onClick={handleSubmit}
              disabled={!requiredDone || submitting}
            >
              {submitting ? "Envoi…" : "🚀 Soumettre mon dossier"}
            </button>
          </div>
        )}

        <div className="cp-footer-links">
          <Link to="/prestataire">← Retour à mon tableau de bord</Link>
          <Link to="/contact">Une question ? Contactez-nous</Link>
        </div>
      </div>
    </main>
  );
}
