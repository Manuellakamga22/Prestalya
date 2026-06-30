const db = require("../config/db");

const getStats = async () => {
  const [[users]]       = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'client'");
  const [[providers]]   = await db.query("SELECT COUNT(*) AS total FROM providers");
  const [[bookings]]    = await db.query("SELECT COUNT(*) AS total FROM bookings");
  const [[termine]]     = await db.query("SELECT COUNT(*) AS total FROM bookings WHERE status = 'termine'");
  const [[pending]]     = await db.query("SELECT COUNT(*) AS total FROM bookings WHERE status = 'en_attente'");
  const [[commissions]] = await db.query("SELECT COALESCE(SUM(montant_commission),0) AS total FROM bookings WHERE status = 'termine'");
  const [[revenuMois]]  = await db.query(
    "SELECT COALESCE(SUM(montant_commission),0) AS total FROM bookings WHERE status='termine' AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())"
  );
  const niveaux = await db.query("SELECT niveau, COUNT(*) AS total FROM providers GROUP BY niveau");

  const [alertes] = await db.query(
    "SELECT CONCAT(u.prenom,' ',u.nom) AS name, p.rating, p.reviews FROM providers p JOIN users u ON u.id=p.user_id WHERE p.rating < 3 AND p.reviews >= 3 ORDER BY p.rating ASC LIMIT 5"
  );
  const [inactifs] = await db.query(
    "SELECT CONCAT(u.prenom,' ',u.nom) AS name FROM providers p JOIN users u ON u.id=p.user_id WHERE p.available=0 LIMIT 5"
  );

  return {
    clients:     users.total,
    providers:   providers.total,
    bookings:    bookings.total,
    termine:     termine.total,
    pending:     pending.total,
    commissions: parseFloat(commissions.total).toFixed(2),
    revenuMois:  parseFloat(revenuMois.total).toFixed(2),
    niveaux:     niveaux[0],
    alertes,
    inactifs,
  };
};

const getAllUsers = async () => {
  const [rows] = await db.query(
    "SELECT id, prenom, nom, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  return rows;
};

const getAllBookings = async () => {
  const [rows] = await db.query(
    `SELECT b.*, CONCAT(uc.prenom,' ',uc.nom) AS client_name,
            CONCAT(up.prenom,' ',up.nom) AS provider_name
     FROM bookings b
     JOIN users uc ON uc.id = b.client_id
     LEFT JOIN providers p ON p.id = b.provider_id
     LEFT JOIN users up ON up.id = p.user_id
     ORDER BY b.created_at DESC`
  );
  return rows;
};

const getAllProviders = async () => {
  const [rows] = await db.query(
    `SELECT p.*, CONCAT(u.prenom,' ',u.nom) AS name, u.email
     FROM providers p JOIN users u ON u.id=p.user_id
     ORDER BY p.created_at DESC`
  );
  return rows;
};

const getRevenus = async () => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(created_at,'%Y-%m') AS mois,
            COALESCE(SUM(montant_commission),0) AS commission,
            COALESCE(SUM(montant_ht),0) AS volume
     FROM bookings WHERE status='termine'
     GROUP BY mois ORDER BY mois DESC LIMIT 12`
  );
  return rows;
};

const updateCommission = async (niveau, taux) => {
  await db.query("UPDATE commissions SET taux=? WHERE niveau=?", [taux, niveau]);
};

const deleteUser = async (id) => {
  await db.query("DELETE FROM users WHERE id = ?", [id]);
};

// Clients sans réservation depuis X jours (ou jamais réservé)
const getInactiveClients = async (days = 30) => {
  const [rows] = await db.query(
    `SELECT u.id, u.prenom, u.nom, u.email,
            MAX(b.created_at) AS last_booking_at,
            (SELECT service FROM bookings WHERE client_id = u.id ORDER BY created_at DESC LIMIT 1) AS last_service
     FROM users u
     LEFT JOIN bookings b ON b.client_id = u.id
     WHERE u.role = 'client'
     GROUP BY u.id, u.prenom, u.nom, u.email
     HAVING last_booking_at IS NULL OR last_booking_at < DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY last_booking_at IS NULL DESC, last_booking_at ASC`,
    [days]
  );
  return rows;
};

module.exports = { getStats, getAllUsers, getAllBookings, getAllProviders, getRevenus, updateCommission, deleteUser, getInactiveClients };
