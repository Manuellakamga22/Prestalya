import { useState } from "react";
import ProviderCard from "../components/ProviderCard";
import { providers, cities, servicesList } from "../data";
import "../styles/pages.css";

export default function Providers() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes les villes");
  const [service, setService] = useState("Tous les services");

  const filtered = providers.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.service.toLowerCase().includes(q);
    const matchCity = city === "Toutes les villes" || p.city === city;
    const matchService = service === "Tous les services" || p.service === service;
    return matchSearch && matchCity && matchService;
  });

  return (
    <main>
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
              placeholder="Rechercher un service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="search-sep" />
            <select className="search-select" value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="search-sep" />
            <select className="search-select" value={service} onChange={(e) => setService(e.target.value)}>
              {servicesList.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-primary">Rechercher</button>
          </div>
        </div>
      </section>

      <section className="providers-page">
        <div className="container providers-content">
          <p className="providers-count">
            {filtered.length} prestataire{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="providers-list">
            {filtered.length > 0
              ? filtered.map((p) => <ProviderCard key={p.id} provider={p} />)
              : <div className="no-results"><p>Aucun prestataire trouvé pour ces critères.</p></div>
            }
          </div>
          {filtered.length > 0 && (
            <span className="see-more-link">Voir plus de prestataires →</span>
          )}
        </div>
      </section>
    </main>
  );
}
