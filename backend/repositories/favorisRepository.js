const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const toggle = async (client_id, provider_id) => {
  const [rows] = await db.query(
    `SELECT id FROM favoris WHERE client_id = ? AND provider_id = ?`,
    [client_id, provider_id]
  );
  if (rows.length > 0) {
    await db.query(`DELETE FROM favoris WHERE client_id = ? AND provider_id = ?`, [client_id, provider_id]);
    return { saved: false };
  }
  await db.query(`INSERT INTO favoris (id, client_id, provider_id) VALUES (?, ?, ?)`, [uuidv4(), client_id, provider_id]);
  return { saved: true };
};

const findByClient = async (client_id) => {
  const [rows] = await db.query(
    `SELECT p.*, u.prenom, u.nom, f.created_at AS saved_at
     FROM favoris f
     JOIN providers p ON p.id = f.provider_id
     JOIN users u ON u.id = p.user_id
     WHERE f.client_id = ? ORDER BY f.created_at DESC`,
    [client_id]
  );
  return rows;
};

const isFavori = async (client_id, provider_id) => {
  const [rows] = await db.query(
    `SELECT id FROM favoris WHERE client_id = ? AND provider_id = ?`,
    [client_id, provider_id]
  );
  return rows.length > 0;
};

const getClientFavIds = async (client_id) => {
  const [rows] = await db.query(`SELECT provider_id FROM favoris WHERE client_id = ?`, [client_id]);
  return rows.map(r => r.provider_id);
};

module.exports = { toggle, findByClient, isFavori, getClientFavIds };
