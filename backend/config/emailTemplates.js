const BASE = process.env.CLIENT_URL || "http://localhost:5173";

const header = (title) => `
<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 24px rgba(0,0,0,0.07)">
  <div style="background:linear-gradient(135deg,#7C3AED,#5B21B6);padding:36px 28px;text-align:center">
    <div style="font-size:2rem;margin-bottom:8px">&#127968;</div>
    <h1 style="color:#fff;margin:0;font-size:1.5rem;font-weight:900">Prestalya</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:0.95rem">${title}</p>
  </div>
  <div style="padding:32px 28px">`;

const footer = () => `
  </div>
  <div style="padding:16px 28px;background:#F9FAFB;text-align:center;color:#9CA3AF;font-size:0.8rem;border-top:1px solid #E5E7EB">
    &copy; ${new Date().getFullYear()} Prestalya &middot; La marketplace des services &agrave; domicile<br/>
    <a href="${BASE}/confidentialite" style="color:#9CA3AF;text-decoration:none">Politique de confidentialit&eacute;</a> &middot;
    <a href="${BASE}/cgu" style="color:#9CA3AF;text-decoration:none">CGU</a>
  </div>
</div>`;

const btnLogin = (label, redirect = "/dashboard") =>
  `<a href="${BASE}/connexion?redirect=${encodeURIComponent(redirect)}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:12px">${label} &rarr;</a>`;

// 1. Bienvenue
const welcome = ({ prenom, role }) => header("Bienvenue sur Prestalya !") + `
  <p style="color:#374151;font-size:1rem">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Votre compte <strong>${role === "prestataire" ? "prestataire" : "client"}</strong> a bien &eacute;t&eacute; cr&eacute;&eacute;. Bienvenue sur Prestalya !</p>
  <div style="background:#F4F3FF;border-radius:12px;padding:20px;margin:20px 0">
    ${role === "prestataire"
      ? `<p style="margin:6px 0;color:#374151">&#10003; Cr&eacute;ez votre fiche prestataire</p>
         <p style="margin:6px 0;color:#374151">&#128203; Renseignez vos disponibilit&eacute;s</p>
         <p style="margin:6px 0;color:#374151">&#128274; Soumettez vos documents de v&eacute;rification</p>`
      : `<p style="margin:6px 0;color:#374151">&#128269; Recherchez un prestataire</p>
         <p style="margin:6px 0;color:#374151">&#128197; R&eacute;servez en quelques clics</p>
         <p style="margin:6px 0;color:#374151">&#11088; Notez vos prestataires</p>`
    }
  </div>
  ${btnLogin("Se connecter &agrave; mon espace", role === "prestataire" ? "/prestataire" : "/dashboard")}
` + footer();

// 2. Reinitialisation mot de passe
const resetPassword = ({ prenom, resetUrl }) => header("R&eacute;initialisation du mot de passe") + `
  <p style="color:#374151">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Vous avez demand&eacute; &agrave; r&eacute;initialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
  <div style="text-align:center;margin:28px 0">
    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem">
      R&eacute;initialiser mon mot de passe
    </a>
  </div>
  <p style="color:#6B7280;font-size:0.9rem">Ce lien est valable <strong>1 heure</strong>.</p>
  <p style="color:#6B7280;font-size:0.9rem">Si vous n'avez pas fait cette demande, ignorez cet email &mdash; votre mot de passe reste inchang&eacute;.</p>
` + footer();

// 3. Confirmation reservation client
const bookingConfirmation = ({ prenom, service, date, slot, ref }) => header("R&eacute;servation enregistr&eacute;e") + `
  <p style="color:#374151">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Votre r&eacute;servation a bien &eacute;t&eacute; enregistr&eacute;e sur Prestalya.</p>
  <div style="background:#F4F3FF;border-radius:12px;padding:20px;margin:20px 0">
    <p style="margin:8px 0;color:#374151"><strong>Service :</strong> ${service}</p>
    <p style="margin:8px 0;color:#374151"><strong>Date :</strong> ${date}</p>
    <p style="margin:8px 0;color:#374151"><strong>Cr&eacute;neau :</strong> ${slot || "&Agrave; d&eacute;finir avec le prestataire"}</p>
    <p style="margin:8px 0;color:#374151"><strong>R&eacute;f&eacute;rence :</strong> <code style="background:#EDE9FE;padding:2px 8px;border-radius:6px;color:#7C3AED">#${ref}</code></p>
  </div>
  <p style="color:#6B7280;font-size:0.9rem">Le prestataire confirmera votre r&eacute;servation sous 24h.</p>
  ${btnLogin("Voir ma r&eacute;servation", "/dashboard")}
` + footer();

// 4. Statut reservation -> client
const bookingStatusUpdate = ({ prenom, service, status, date }) => {
  const info = {
    accepte:  { label: "accept&eacute;e par le prestataire", color: "#2563EB" },
    refuse:   { label: "refus&eacute;e par le prestataire",  color: "#DC2626" },
    propose:  { label: "modifi&eacute;e (nouveau cr&eacute;neau propos&eacute;)", color: "#D97706" },
    confirme: { label: "confirm&eacute;e", color: "#059669" },
    annule:   { label: "annul&eacute;e",   color: "#DC2626" },
    termine:  { label: "termin&eacute;e",  color: "#7C3AED" },
  }[status] || { label: status, color: "#374151" };

  return header(`R&eacute;servation ${info.label}`) + `
  <p style="color:#374151">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Votre r&eacute;servation pour <strong>${service}</strong> le <strong>${date}</strong> a &eacute;t&eacute; <strong style="color:${info.color}">${info.label}</strong>.</p>
  ${status === "termine" ? `<p style="color:#374151">Merci de nous faire confiance ! N'oubliez pas de laisser un avis.</p>` : ""}
  ${btnLogin(status === "termine" ? "Laisser un avis" : "Voir ma r&eacute;servation", "/dashboard")}
  ` + footer();
};

// 5. Nouvelle reservation -> prestataire
const newBookingProvider = ({ prenomProvider, prenomClient, service, date, slot }) => header("Nouvelle r&eacute;servation re&ccedil;ue") + `
  <p style="color:#374151">Bonjour <strong>${prenomProvider}</strong>,</p>
  <p style="color:#374151"><strong>${prenomClient}</strong> vient de r&eacute;server votre service.</p>
  <div style="background:#F4F3FF;border-radius:12px;padding:20px;margin:20px 0">
    <p style="margin:8px 0;color:#374151"><strong>Service :</strong> ${service}</p>
    <p style="margin:8px 0;color:#374151"><strong>Date :</strong> ${date}</p>
    <p style="margin:8px 0;color:#374151"><strong>Cr&eacute;neau :</strong> ${slot || "&Agrave; d&eacute;finir"}</p>
  </div>
  <p style="color:#6B7280;font-size:0.9rem">Connectez-vous pour confirmer ou refuser cette r&eacute;servation.</p>
  ${btnLogin("G&eacute;rer mes r&eacute;servations", "/prestataire")}
` + footer();

// 6. Devis recu -> client
const devisRecu = ({ prenom, service, montant, message }) => header("Votre devis est arriv&eacute; !") + `
  <p style="color:#374151">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Le prestataire a r&eacute;pondu &agrave; votre demande de devis pour <strong>${service}</strong>.</p>
  <div style="background:#F4F3FF;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
    <p style="margin:0 0 4px;color:#6B7280;font-size:0.9rem">Montant propos&eacute;</p>
    <p style="margin:0;font-size:2rem;font-weight:900;color:#7C3AED">${montant}&euro;</p>
  </div>
  ${message ? `<p style="color:#374151;font-style:italic">"${message}"</p>` : ""}
  ${btnLogin("Accepter ou refuser le devis", "/dashboard")}
` + footer();

// 7. Devis accepte -> prestataire
const devisAccepte = ({ prenomProvider, prenomClient, service, montant }) => header("Devis accept&eacute; !") + `
  <p style="color:#374151">Bonjour <strong>${prenomProvider}</strong>,</p>
  <p style="color:#374151"><strong>${prenomClient}</strong> a accept&eacute; votre devis de <strong>${montant}&euro;</strong> pour <strong>${service}</strong>.</p>
  <p style="color:#374151">Vous pouvez maintenant convenir d'un rendez-vous avec votre client.</p>
  ${btnLogin("Voir mes devis", "/prestataire")}
` + footer();

// 8. Documents valides -> prestataire
const documentsValides = ({ prenom }) => header("Profil v&eacute;rifi&eacute; !") + `
  <p style="color:#374151">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Bonne nouvelle ! Vos documents ont &eacute;t&eacute; v&eacute;rifi&eacute;s et valid&eacute;s par notre &eacute;quipe.</p>
  <div style="background:#D1FAE5;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
    <p style="margin:8px 0 0;color:#065F46;font-weight:700">Votre badge "Prestataire v&eacute;rifi&eacute;" est maintenant actif</p>
  </div>
  <p style="color:#6B7280;font-size:0.9rem">Votre profil appara&icirc;t maintenant en priorit&eacute; dans les r&eacute;sultats de recherche.</p>
  ${btnLogin("Voir mon profil", "/prestataire")}
` + footer();

// 9. Contact recu
const contactConfirmation = ({ prenom, sujet }) => header("Message re&ccedil;u") + `
  <p style="color:#374151">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Nous avons bien re&ccedil;u votre message concernant : <strong>${sujet}</strong>.</p>
  <p style="color:#374151">Notre &eacute;quipe vous r&eacute;pondra dans les <strong>24 heures ouvrables</strong>.</p>
` + footer();

// 10. Paiement reussi
const paiementReussi = ({ prenom, service, montant, ref }) => header("Paiement confirm&eacute;") + `
  <p style="color:#374151">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#374151">Votre paiement a bien &eacute;t&eacute; re&ccedil;u.</p>
  <div style="background:#D1FAE5;border-radius:12px;padding:20px;margin:20px 0">
    <p style="margin:8px 0;color:#374151"><strong>Service :</strong> ${service}</p>
    <p style="margin:8px 0;color:#374151"><strong>Montant :</strong> <strong style="color:#059669">${montant}&euro;</strong></p>
    <p style="margin:8px 0;color:#374151"><strong>R&eacute;f&eacute;rence :</strong> <code style="background:#EDE9FE;padding:2px 8px;border-radius:6px;color:#7C3AED">#${ref}</code></p>
  </div>
  ${btnLogin("Voir ma r&eacute;servation", "/dashboard")}
` + footer();

module.exports = {
  welcome, resetPassword, bookingConfirmation, bookingStatusUpdate,
  newBookingProvider, devisRecu, devisAccepte, documentsValides,
  contactConfirmation, paiementReussi,
};
