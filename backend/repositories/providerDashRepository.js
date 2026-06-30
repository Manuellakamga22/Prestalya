const db = require("../config/db");

const getStats = async (provider_id) => {
  const [[bookings]] = await db.query(
    "SELECT COUNT(*) AS total FROM bookings WHERE provider_id = ?", [provider_id]
  );
  const [[pending]] = await db.query(
    "SELECT COUNT(*) AS total FROM bookings WHERE provider_id = ? AND status = 'en_attente'", [provider_id]
  );
  const [[done]] = await db.query(
    "SELECT COUNT(*) AS total FROM bookings WHERE provider_id = ? AND status = 'termine'", [provider_id]
  );
  const [[rating]] = await db.query(
    "SELECT rating, reviews FROM providers WHERE id = ?", [provider_id]
  );
  return {
    total: bookings.total,
    pending: pending.total,
    done: done.total,
    rating: rating?.rating || 0,
    reviews: rating?.reviews || 0,
  };
};

const getUpcoming = async (provider_id) => {
  const [rows] = await db.query(
    `SELECT b.*, CONCAT(u.prenom,' ',u.nom) AS client_name
     FROM bookings b JOIN users u ON u.id = b.client_id
     WHERE b.provider_id = ? AND b.status IN ('en_attente','confirme') AND b.date >= CURDATE()
     ORDER BY b.date ASC, b.slot ASC
     LIMIT 10`,
    [provider_id]
  );
  return rows;
};

module.exports = { getStats, getUpcoming };
