const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const create = async ({ booking_id, client_id, provider_id, note, commentaire }) => {
  const id = uuidv4();
  await db.query(
    "INSERT INTO reviews (id, booking_id, client_id, provider_id, note, commentaire) VALUES (?,?,?,?,?,?)",
    [id, booking_id, client_id, provider_id, note, commentaire]
  );
  await refreshRating(provider_id);
  const [rows] = await db.query("SELECT * FROM reviews WHERE id = ?", [id]);
  return rows[0];
};

const refreshRating = async (provider_id) => {
  const [rows] = await db.query(
    "SELECT AVG(note) AS avg, COUNT(*) AS total FROM reviews WHERE provider_id = ?",
    [provider_id]
  );
  const { avg, total } = rows[0];
  await db.query("UPDATE providers SET rating = ?, reviews = ? WHERE id = ?", [
    parseFloat(avg || 0).toFixed(2),
    total,
    provider_id,
  ]);
};

const findByProvider = async (provider_id) => {
  const [rows] = await db.query(
    `SELECT r.*, CONCAT(u.prenom,' ',u.nom) AS client_name
     FROM reviews r JOIN users u ON u.id = r.client_id
     WHERE r.provider_id = ?
     ORDER BY r.created_at DESC`,
    [provider_id]
  );
  return rows;
};

const findByBooking = async (booking_id) => {
  const [rows] = await db.query("SELECT * FROM reviews WHERE booking_id = ?", [booking_id]);
  return rows[0] || null;
};

module.exports = { create, findByProvider, findByBooking };
