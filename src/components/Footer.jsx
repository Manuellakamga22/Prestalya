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
            <p>La plateforme qui vous connecte aux meilleurs prestataires à domicile partout en France.</p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn" title="Facebook">f</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn" title="Instagram">📷</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn" title="X (Twitter)">𝕏</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-btn" title="LinkedIn">in</a>
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
              <li><Link to="/prestataires">Ménage à domicile</Link></li>
              <li><Link to="/prestataires">Nettoyage canapé</Link></li>
              <li><Link to="/prestataires">Désinfection</Link></li>
              <li><Link to="/prestataires">Repassage</Link></li>
              <li><Link to="/prestataires">Babysitting</Link></li>
              <li><Link to="/prestataires">Aide informatique</Link></li>
              <li><Link to="/prestataires">Électricité</Link></li>
              <li><Link to="/prestataires">Coiffure à domicile</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Informations</h4>
            <ul>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/cgu">CGU</Link></li>
              <li><Link to="/confidentialite">Confidentialité</Link></li>
              <li><Link to="/mentions-legales">Mentions légales</Link></li>
            </ul>
            <h4 style={{ marginTop: 24 }}>Contact</h4>
            <ul>
              <li><a href="mailto:manuellakamga20@gmail.com">manuellakamga20@gmail.com</a></li>
              <li><a href="tel:+33634660103">+33 6 34 66 01 03</a></li>
              <li><span style={{ color: "rgba(255,255,255,0.6)" }}>Paris, France</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Prestalya – Tous droits réservés.</span>
          <div className="footer-bottom-links">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/cgu">CGU</Link>
            <Link to="/confidentialite">Confidentialité</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
