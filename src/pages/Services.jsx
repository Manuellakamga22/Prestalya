import ServiceCard from "../components/ServiceCard";
import { services, serviceCategories } from "../data";
import SEO from "../components/SEO";
import "../styles/pages.css";

export default function Services() {
  return (
    <main>
      <SEO
        title="Nos services à domicile"
        description="Découvrez tous les services disponibles sur Prestalya : ménage, nettoyage canapé, désinfection, babysitting, aide informatique, électricité, plomberie, coiffure et plus."
        path="/services"
      />
      <section className="page-hero">
        <div className="container">
          <h1>Nos services à domicile</h1>
          <p>Découvrez tous les services disponibles sur Prestalya.</p>
        </div>
      </section>

      <section className="services-page">
        <div className="container">
          {serviceCategories.map((cat) => {
            const catServices = services.filter((s) => s.category === cat.key);
            return (
              <div key={cat.key} className="services-category-block">
                <div className="services-category-header">
                  <span className="services-category-icon">{cat.icon}</span>
                  <h2 className="services-category-title" style={{ color: cat.color }}>{cat.label}</h2>
                </div>
                <div className="services-grid-page">
                  {catServices.map((s) => <ServiceCard key={s.id} service={s} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
