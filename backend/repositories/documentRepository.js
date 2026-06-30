const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const create = async ({ user_id, type, label, filename, original_name }) => {
  const id = uuidv4();
  await db.query(
    `INSERT INTO provider_documents (id, user_id, type, label, filename, original_name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, user_id, type, label, filename, original_name]
  );
  const [rows] = await db.query("SELECT * FROM provider_documents WHERE id = ?", [id]);
  return rows[0];
};

const findByUser = async (user_id) => {
  const [rows] = await db.query(
    "SELECT * FROM provider_documents WHERE user_id = ? ORDER BY uploaded_at DESC",
    [user_id]
  );
  return rows;
};

const findAll = async (status) => {
  let q = `
    SELECT d.*, u.prenom, u.nom, u.email
    FROM provider_documents d
    JOIN users u ON u.id = d.user_id
    WHERE 1=1
  `;
  const params = [];
  if (status) { q += " AND d.status = ?"; params.push(status); }
  q += " ORDER BY d.uploaded_at DESC";
  const [rows] = await db.query(q, params);
  return rows;
};

const updateStatus = async (id, status, reject_reason = null) => {
  await db.query(
    `UPDATE provider_documents
     SET status = ?, reject_reason = ?, validated_at = ?
     WHERE id = ?`,
    [status, reject_reason, status !== "en_attente" ? new Date() : null, id]
  );
  const [rows] = await db.query("SELECT * FROM provider_documents WHERE id = ?", [id]);
  return rows[0];
};

const markSubmitted = async (user_id) => {
  await db.query("UPDATE providers SET docs_submitted = 1 WHERE user_id = ?", [user_id]);
};

const setVerified = async (user_id, verified) => {
  await Promise.all([
    db.query("UPDATE providers SET verified = ? WHERE user_id = ?",  [verified ? 1 : 0, user_id]),
    db.query("UPDATE users    SET verified = ? WHERE id = ?",        [verified ? 1 : 0, user_id]),
  ]);
};

module.exports = { create, findByUser, findAll, updateStatus, markSubmitted, setVerified };
