const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const findAll = async ({ service, city, available } = {}) => {
  let query = `
    SELECT p.*, u.prenom, u.nom, u.email
    FROM providers p
    JOIN users u ON u.id = p.user_id
    WHERE 1=1
  `;
  const params = [];
  if (service)              { params.push(`%${service}%`); query += " AND (p.service LIKE ? OR CONCAT(u.prenom,' ',u.nom) LIKE ?)"; params.push(`%${service}%`); }
  if (city)                 { params.push(`%${city}%`);    query += " AND p.city LIKE ?"; }
  if (available !== undefined) { params.push(available ? 1 : 0); query += " AND p.available = ?"; }
  query += " ORDER BY p.rating DESC";
  const [rows] = await db.query(query, params);
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT p.*, u.prenom, u.nom, u.email
     FROM providers p JOIN users u ON u.id = p.user_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const findByUserId = async (userId) => {
  const [rows] = await db.query("SELECT * FROM providers WHERE user_id = ?", [userId]);
  return rows[0] || null;
};

const create = async ({ user_id, service, city, bio, price, photo_url, siret, experience, disponibilite }) => {
  const id = uuidv4();
  await db.query(
    `INSERT INTO providers (id, user_id, service, city, bio, price, photo_url, siret, experience, disponibilite)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, user_id, service, city, bio, price || null, photo_url || null, siret || null, experience || null, disponibilite || null]
  );
  return findById(id);
};

const update = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const set = keys.map((k) => `${k} = ?`).join(", ");
  await db.query(`UPDATE providers SET ${set} WHERE id = ?`, [...values, id]);
  return findById(id);
};

module.exports = { findAll, findById, findByUserId, create, update };
