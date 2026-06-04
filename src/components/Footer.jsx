import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">P</div>
              <span>Prestalya</span>
            </div>
            <p>La plateforme qui vous connecte avec des prestataires fiables pour tous vos services à domicile.</p>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Ménage à domicile</Link></li>
              <li><Link to="/services">Babysitting</Link></li>
              <li><Link to="/services">Aide informatique</Link></li>
              <li><Link to="/services">Coiffure</Link></li>
              <li><Link to="/services">Tous les services</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Plateforme</h4>
            <ul>
              <li><Link to="/prestataires">Trouver un prestataire</Link></li>
              <li><Link to="/devenir-prestataire">Devenir prestataire</Link></li>
              <li><Link to="/reservation">Réserver</Link></li>
              <li><Link to="/a-propos">À propos</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><Link to="/contact">Nous contacter</Link></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Conditions d'utilisation</a></li>
              <li><a href="#">Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Prestalya. Tous droits réservés.</span>
          <div className="footer-bottom-links">
            <a href="#">Mentions légales</a>
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
