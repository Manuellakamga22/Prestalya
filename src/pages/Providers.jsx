import { useState } from "react";
import ProviderCard from "../components/ProviderCard";
import { providers, cities, servicesList } from "../data";
import "../styles/pages.css";

export default function Providers() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes les villes");
  const [service, setService] = useState("Tous les services");

  const filtered = providers.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.service.toLowerCase().includes(search.toLowerCase());
    const matchCity = city === "Toutes les villes" || p.city === city;
    const matchService = service === "Tous les services" || p.service === service;
    return matchSearch && matchCity && matchService;
  });

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Trouver un prestataire</h1>
          <p>Consultez les profils et réservez le prestataire qui vous convient.</p>
        </div>
      </section>

      <section className="providers-page">
        <div className="container">
          <div className="search-bar-wrapper" style={{ marginTop: 36 }}>
            <div className="search-bar-inner">
              <div className="search-input-group" style={{ flex: 2 }}>
                <label>Rechercher</label>
                <input
                  type="text"
                  placeholder="Nom, service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="search-input-group">
                <label>Ville</label>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="search-input-group">
                <label>Service</label>
                <select value={service} onChange={(e) => setService(e.target.value)}>
                  {servicesList.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button className="btn-primary" style={{ alignSelf: "flex-end", padding: "11px 24px" }}>
                Rechercher
              </button>
            </div>
          </div>

          <p className="providers-count">
            {filtered.length} prestataire{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="providers-grid">
            {filtered.length > 0 ? (
              filtered.map((p) => <ProviderCard key={p.id} provider={p} />)
            ) : (
              <div className="no-results">
                <p>Aucun prestataire trouvé pour ces critères.</p>
                <span>Essayez de modifier vos filtres.</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
