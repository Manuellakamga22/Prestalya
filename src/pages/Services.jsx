import ServiceCard from "../components/ServiceCard";
import { services } from "../data";
import "../styles/pages.css";

export default function Services() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Nos services à domicile</h1>
          <p>Découvrez tous les services disponibles sur Prestalya.</p>
        </div>
      </section>

      <section className="services-page">
        <div className="container">
          <div className="services-grid-page">
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
