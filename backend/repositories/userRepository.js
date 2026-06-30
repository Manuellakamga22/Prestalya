const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const findByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, prenom, nom, email, role, photo_url, verified, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

const create = async ({ prenom, nom, email, password_hash, role }) => {
  const id = uuidv4();
  await db.query(
    "INSERT INTO users (id, prenom, nom, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
    [id, prenom, nom, email, password_hash, role]
  );
  return findById(id);
};

module.exports = { findByEmail, findById, create };
