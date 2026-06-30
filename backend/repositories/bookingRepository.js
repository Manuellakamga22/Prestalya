const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const create = async ({ client_id, provider_id, service, city, date, slot, comment, montant_ht, taux_commission, montant_commission, montant_net }) => {
  const id = uuidv4();
  await db.query(
    `INSERT INTO bookings (id, client_id, provider_id, service, city, date, slot, comment, montant_ht, taux_commission, montant_commission, montant_net)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, client_id, provider_id || null, service, city, date, slot, comment || null,
     montant_ht || null, taux_commission || null, montant_commission || null, montant_net || null]
  );
  return findById(id);
};

const findByClient = async (client_id) => {
  const [rows] = await db.query(
    `SELECT b.*,
            CONCAT(u.prenom,' ',u.nom) AS provider_name,
            p.photo_url, p.niveau
     FROM bookings b
     LEFT JOIN providers p ON p.id = b.provider_id
     LEFT JOIN users u ON u.id = p.user_id
     WHERE b.client_id = ?
     ORDER BY b.created_at DESC`,
    [client_id]
  );
  return rows;
};

const findByProvider = async (provider_id) => {
  const [rows] = await db.query(
    `SELECT b.*, CONCAT(u.prenom,' ',u.nom) AS client_name
     FROM bookings b
     JOIN users u ON u.id = b.client_id
     WHERE b.provider_id = ?
     ORDER BY b.created_at DESC`,
    [provider_id]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query("SELECT * FROM bookings WHERE id = ?", [id]);
  return rows[0] || null;
};

const updateStatus = async (id, status) => {
  await db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
  return findById(id);
};

const setProvider = async (id, provider_id, status) => {
  await db.query("UPDATE bookings SET provider_id = ?, status = ? WHERE id = ?", [provider_id, status, id]);
  return findById(id);
};

const setProposal = async (id, propose_date, propose_slot) => {
  await db.query(
    "UPDATE bookings SET status = 'propose', propose_date = ?, propose_slot = ? WHERE id = ?",
    [propose_date, propose_slot, id]
  );
  return findById(id);
};

// Le client accepte la proposition : la date/le créneau proposés deviennent définitifs
const acceptProposal = async (id) => {
  const booking = await findById(id);
  await db.query(
    "UPDATE bookings SET status = 'accepte', date = ?, slot = ?, propose_date = NULL, propose_slot = NULL WHERE id = ?",
    [booking.propose_date, booking.propose_slot, id]
  );
  return findById(id);
};

const setStripeSession = async (id, stripe_session_id) => {
  await db.query("UPDATE bookings SET stripe_session_id = ? WHERE id = ?", [stripe_session_id, id]);
  return findById(id);
};

const markPaid = async (id, stripe_payment_intent_id) => {
  await db.query(
    "UPDATE bookings SET status = 'confirme', payment_status = 'paye', stripe_payment_intent_id = ? WHERE id = ?",
    [stripe_payment_intent_id, id]
  );
  return findById(id);
};

const markRefunded = async (id) => {
  await db.query("UPDATE bookings SET payment_status = 'rembourse' WHERE id = ?", [id]);
  return findById(id);
};

const findByStripeSessionId = async (stripe_session_id) => {
  const [rows] = await db.query("SELECT * FROM bookings WHERE stripe_session_id = ?", [stripe_session_id]);
  return rows[0] || null;
};

module.exports = {
  create, findByClient, findByProvider, findById, updateStatus, setProvider, setProposal, acceptProposal,
  setStripeSession, markPaid, findByStripeSessionId, markRefunded,
};
