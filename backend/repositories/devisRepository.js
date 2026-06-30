const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const create = async ({ client_id, provider_id, service, description, date_souhaitee, message_client }) => {
  const id = uuidv4();
  await db.query(
    `INSERT INTO devis (id, client_id, provider_id, service, description, date_souhaitee, message_client)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, client_id, provider_id, service, description, date_souhaitee || null, message_client || null]
  );
  return findById(id);
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT d.*,
       u.prenom AS client_prenom, u.nom AS client_nom, u.email AS client_email,
       p.service AS provider_service, p.city AS provider_city,
       pu.prenom AS provider_prenom, pu.nom AS provider_nom
     FROM devis d
     JOIN users u ON u.id = d.client_id
     JOIN providers p ON p.id = d.provider_id
     JOIN users pu ON pu.id = p.user_id
     WHERE d.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const findByClient = async (client_id) => {
  const [rows] = await db.query(
    `SELECT d.*,
       p.service AS provider_service, p.city AS provider_city, p.photo_url AS provider_photo,
       pu.prenom AS provider_prenom, pu.nom AS provider_nom
     FROM devis d
     JOIN providers p ON p.id = d.provider_id
     JOIN users pu ON pu.id = p.user_id
     WHERE d.client_id = ? ORDER BY d.created_at DESC`,
    [client_id]
  );
  return rows;
};

const findByProvider = async (provider_id) => {
  const [rows] = await db.query(
    `SELECT d.*,
       u.prenom AS client_prenom, u.nom AS client_nom, u.photo_url AS client_photo
     FROM devis d
     JOIN users u ON u.id = d.client_id
     WHERE d.provider_id = ? ORDER BY d.created_at DESC`,
    [provider_id]
  );
  return rows;
};

const respond = async (id, { montant, message_provider, status }) => {
  await db.query(
    `UPDATE devis SET montant = ?, message_provider = ?, status = ? WHERE id = ?`,
    [montant, message_provider, status, id]
  );
  return findById(id);
};

const updateStatus = async (id, status) => {
  await db.query(`UPDATE devis SET status = ? WHERE id = ?`, [status, id]);
  return findById(id);
};

module.exports = { create, findById, findByClient, findByProvider, respond, updateStatus };
