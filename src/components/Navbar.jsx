import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
    { to: "/prestataires", label: "Prestataires" },
    { to: "/devenir-prestataire", label: "Devenir prestataire" },
    { to: "/a-propos", label: "À propos" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">P</div>
            <span>Prestal<span className="logo-accent">ya</span></span>
          </Link>

          <ul className="navbar-links">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => isActive ? "active" : ""}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-cta">
            <Link to="/reservation" className="btn-primary">Réserver</Link>
          </div>

          <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`navbar-mobile ${open ? "open" : ""}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/reservation" className="btn-primary" onClick={() => setOpen(false)}>
            Réserver une prestation
          </Link>
        </div>
      </div>
    </nav>
  );
}
