const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Retourne { "2026-08-05": { "09h00": "indisponible", "10h00": "reserve" }, ... }
const findByProvider = async (provider_id) => {
  const [rows] = await db.query(
    `SELECT date_off, slot, status FROM disponibilites WHERE provider_id = ? ORDER BY date_off, slot`,
    [provider_id]
  );
  const map = {};
  for (const r of rows) {
    const d = r.date_off instanceof Date
      ? `${r.date_off.getFullYear()}-${String(r.date_off.getMonth() + 1).padStart(2, "0")}-${String(r.date_off.getDate()).padStart(2, "0")}`
      : String(r.date_off).slice(0, 10);
    if (!map[d]) map[d] = {};
    if (r.slot) map[d][r.slot] = r.status;
  }
  return map;
};

const getSlot = async (provider_id, date_off, slot) => {
  const [rows] = await db.query(
    `SELECT * FROM disponibilites WHERE provider_id = ? AND date_off = ? AND slot = ?`,
    [provider_id, date_off, slot]
  );
  return rows[0] || null;
};

// Le prestataire ajoute/retire manuellement un créneau disponible
const toggleSlot = async (provider_id, date_off, slot) => {
  const existing = await getSlot(provider_id, date_off, slot);
  if (existing) {
    if (existing.status !== "disponible") {
      throw Object.assign(new Error("Ce créneau est déjà réservé ou en attente, vous ne pouvez pas le modifier."), { status: 409 });
    }
    await db.query(`DELETE FROM disponibilites WHERE id = ?`, [existing.id]);
    return { added: false, date: date_off, slot };
  }
  await db.query(
    `INSERT INTO disponibilites (id, provider_id, date_off, slot, status) VALUES (?, ?, ?, ?, 'disponible')`,
    [uuidv4(), provider_id, date_off, slot]
  );
  return { added: true, date: date_off, slot };
};

// Marque un créneau avec un statut système (en_attente / reserve), lié à une réservation
const setSlotStatus = async (provider_id, date_off, slot, status, booking_id = null) => {
  const existing = await getSlot(provider_id, date_off, slot);
  if (existing) {
    await db.query(`UPDATE disponibilites SET status = ?, booking_id = ? WHERE id = ?`, [status, booking_id, existing.id]);
    return;
  }
  await db.query(
    `INSERT INTO disponibilites (id, provider_id, date_off, slot, status, booking_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), provider_id, date_off, slot, status, booking_id]
  );
};

// Libère un créneau (réservation refusée / annulée) — supprime sauf si bloqué manuellement
const freeSlot = async (provider_id, date_off, slot) => {
  await db.query(
    `DELETE FROM disponibilites WHERE provider_id = ? AND date_off = ? AND slot = ? AND status IN ('en_attente','reserve')`,
    [provider_id, date_off, slot]
  );
};

const isSlotTaken = async (provider_id, date_off, slot) => {
  const row = await getSlot(provider_id, date_off, slot);
  return !!row;
};

module.exports = { findByProvider, getSlot, toggleSlot, setSlotStatus, freeSlot, isSlotTaken };
