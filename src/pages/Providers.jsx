import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProviderCard from "../components/ProviderCard";
import ProviderCardSkeleton from "../components/ProviderCardSkeleton";
import AIMatchWidget from "../components/AIMatchWidget";
import { api } from "../api";
import { services as ALL_SERVICES } from "../data";
import SEO from "../components/SEO";
import "../styles/pages.css";

const ALL_PLATFORM_SERVICES = ALL_SERVICES.map(s => s.title).sort();

export default function Providers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [dispo, setDispo] = useState(false);
  const [verified, setVerified] = useState(false);
  const [prixMax, setPrixMax] = useState("");
  const [noteMin, setNoteMin] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [visible, setVisible] = useState(6);

  useEffect(() => {
    api.get("/providers?limit=200").then((data) => {
      const list = data.providers || data;
      setProviders(list);
      const uniqueCities = [...new Set(list.map((p) => p.city).filter(Boolean))].sort();
      setCities(uniqueCities);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = providers.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || (p.prenom + " " + p.nom).toLowerCase().includes(q) || p.service.toLowerCase().includes(q);
    const matchCity = !city || (p.city || "").toLowerCase().includes(city.toLowerCase());
    const matchService = !service || (p.service || "").toLowerCase().includes(service.toLowerCase());
    const matchDispo = !dispo || p.available;
    const matchVerified = !verified || p.verified;
    const matchPrix = !prixMax || (parseFloat(p.price) || 0) <= parseFloat(prixMax);
    const matchNote = !noteMin || (parseFloat(p.rating) || 0) >= parseFloat(noteMin);
    return matchSearch && matchCity && matchService && matchDispo && matchVerified && matchPrix && matchNote;
  }).sort((a, b) => {
    if (sortBy === "prix_asc")  return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
    if (sortBy === "prix_desc") return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
    if (sortBy === "note")      return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    if (sortBy === "exp")       return (parseInt(b.experience) || 0) - (parseInt(a.experience) || 0);
    return 0;
  });

  const activeFiltersCount = [dispo, verified, prixMax, noteMin].filter(Boolean).length;

  return (
    <main>
      <SEO
        title="Trouver un prestataire à domicile"
        description="Recherchez parmi des centaines de prestataires vérifiés : ménage, babysitting, électricité, coiffure..."
        path="/prestataires"
      />
      <section className="page-hero">
        <div className="container">
          <h1>Trouvez le prestataire idéal</h1>
          <p>Recherchez parmi des professionnels disponibles près de chez vous.</p>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Nom ou service..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisible(6); }}
            />
            <div className="search-sep" />
            <input
              className="search-select"
              type="text"
              placeholder="Toutes les villes"
              value={city}
              onChange={(e) => { setCity(e.target.value); setVisible(6); }}
              list="prov-cities-list"
            />
            <datalist id="prov-cities-list">
              {cities.map((c) => <option key={c} value={c} />)}
            </datalist>
            <div className="search-sep" />
            <select className="search-select" value={service} onChange={(e) => { setService(e.target.value); setVisible(6); }}>
              <option value="">Tous les services</option>
              {ALL_PLATFORM_SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-primary" onClick={() => setVisible(6)}>Rechercher</button>
          </div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.97rem", color: "var(--gray-700)", fontWeight: 600 }}>
              <input type="checkbox" checked={dispo} onChange={(e) => { setDispo(e.target.checked); setVisible(6); }}
                style={{ width: 18, height: 18, accentColor: "var(--primary)", cursor: "pointer" }} />
              Disponibles uniquement
            </label>
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: showFilters ? "var(--primary)" : "var(--gray-100)", color: showFilters ? "#fff" : "var(--gray-700)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
            >
              ⚙️ Filtres avancés {activeFiltersCount > 0 && <span style={{ background: "#fff", color: "var(--primary)", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>{activeFiltersCount}</span>}
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid var(--gray-200)", fontSize: "0.9rem", color: "var(--gray-700)", cursor: "pointer" }}>
              <option value="default">Trier par défaut</option>
              <option value="note">Meilleures notes</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="exp">Plus expérimentés</option>
            </select>
          </div>

          {showFilters && (
            <div style={{ marginTop: 16, background: "var(--gray-50)", borderRadius: 12, padding: "18px 24px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end", border: "1.5px solid var(--gray-200)" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--gray-600)", marginBottom: 6 }}>Prix max (€/h)</label>
                <input type="number" min="0" placeholder="ex: 50" value={prixMax}
                  onChange={(e) => { setPrixMax(e.target.value); setVisible(6); }}
                  style={{ width: 110, padding: "7px 10px", border: "1.5px solid var(--gray-200)", borderRadius: 8, fontSize: "0.95rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--gray-600)", marginBottom: 6 }}>Note minimum</label>
                <select value={noteMin} onChange={(e) => { setNoteMin(e.target.value); setVisible(6); }}
                  style={{ padding: "7px 10px", border: "1.5px solid var(--gray-200)", borderRadius: 8, fontSize: "0.95rem", width: 130 }}>
                  <option value="">Toutes</option>
                  <option value="4">⭐⭐⭐⭐ 4+</option>
                  <option value="4.5">⭐⭐⭐⭐⭐ 4.5+</option>
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.95rem", color: "var(--gray-700)", fontWeight: 600, paddingBottom: 2 }}>
                <input type="checkbox" checked={verified} onChange={(e) => { setVerified(e.target.checked); setVisible(6); }}
                  style={{ width: 18, height: 18, accentColor: "var(--primary)" }} />
                ✅ Vérifiés uniquement
              </label>
              {activeFiltersCount > 0 && (
                <button onClick={() => { setVerified(false); setPrixMax(""); setNoteMin(""); setVisible(6); }}
                  style={{ padding: "7px 14px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.88rem" }}>
                  ✕ Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="providers-page">
        <div className="container providers-content">
          {!loading && providers.length > 0 && (
            <AIMatchWidget providers={providers} />
          )}
          <p className="providers-count">
            {loading ? "Chargement…" : `${filtered.length} prestataire${filtered.length !== 1 ? "s" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
          </p>

          <div className="providers-list">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProviderCardSkeleton key={i} />)
              : filtered.length > 0
                ? filtered.slice(0, visible).map((p) => (
                    <ProviderCard key={p.id} provider={p} onClick={() => navigate(`/prestataires/${p.id}`)} />
                  ))
                : <div className="no-results"><p>Aucun prestataire trouvé pour ces critères.</p></div>
            }
          </div>

          {!loading && filtered.length > visible && (
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button className="btn-outline" onClick={() => setVisible(v => v + 6)}>
                Voir plus de prestataires ({filtered.length - visible} restants)
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
