import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">🏠</div>
              <span>Prestalya</span>
            </div>
            <p>Prestalya est la plateforme qui vous connecte aux meilleurs prestataires à domicile.</p>
            <div className="footer-social">
              <button className="social-btn" title="Facebook">f</button>
              <button className="social-btn" title="Instagram">in</button>
              <button className="social-btn" title="Twitter">𝕏</button>
              <button className="social-btn" title="LinkedIn">li</button>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/prestataires">Prestataires</Link></li>
              <li><Link to="/devenir-prestataire">Devenir prestataire</Link></li>
              <li><Link to="/a-propos">À propos</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services populaires</h4>
            <ul>
              <li><Link to="/services">Ménage à domicile</Link></li>
              <li><Link to="/services">Nettoyage canapé</Link></li>
              <li><Link to="/services">Désinfection</Link></li>
              <li><Link to="/services">Repassage</Link></li>
              <li><Link to="/services">Babysitting</Link></li>
              <li><Link to="/services">Aide informatique</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Informations</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">CGU</a></li>
              <li><a href="#">Confidentialité</a></li>
              <li><a href="#">Mentions légales</a></li>
            </ul>
            <h4 style={{ marginTop: 20 }}>Contact</h4>
            <ul>
              <li><a href="mailto:contact@prestalya.com">contact@prestalya.com</a></li>
              <li><a href="tel:+33123456789">+33 6 12 34 56 78</a></li>
              <li><a href="#">Paris, France</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Prestalya – Tous droits réservés.</span>
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
