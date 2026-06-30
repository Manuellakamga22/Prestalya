const db = require("../config/db");

const getAll = async () => {
  const [rows] = await db.query("SELECT * FROM commissions ORDER BY taux DESC");
  return rows;
};

const getByNiveau = async (niveau) => {
  const [rows] = await db.query("SELECT * FROM commissions WHERE niveau = ?", [niveau]);
  return rows[0] || null;
};

const updateTaux = async (niveau, taux) => {
  await db.query("UPDATE commissions SET taux = ? WHERE niveau = ?", [taux, niveau]);
  return getByNiveau(niveau);
};

module.exports = { getAll, getByNiveau, updateTaux };
