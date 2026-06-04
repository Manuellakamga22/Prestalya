import ServiceCard from "../components/ServiceCard";
import { services } from "../data";
import "../styles/pages.css";

export default function Services() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Nos services à domicile</h1>
          <p>Des prestataires qualifiés pour chaque besoin, disponibles près de chez vous.</p>
        </div>
      </section>

      <section className="services-page">
        <div className="container">
          <div className="services-page-grid">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p>Contactez-nous, nous ferons tout pour répondre à votre besoin.</p>
          <div className="cta-buttons">
            <a href="/contact" className="btn-primary">Nous contacter</a>
          </div>
        </div>
      </section>
    </main>
  );
}
