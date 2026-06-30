const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

const getOrCreateCode = async (user_id) => {
  const [rows] = await db.query(`SELECT referral_code FROM users WHERE id = ?`, [user_id]);
  if (rows[0]?.referral_code) return rows[0].referral_code;
  const code = generateCode();
  await db.query(`UPDATE users SET referral_code = ? WHERE id = ?`, [code, user_id]);
  return code;
};

const applyReferral = async (referred_id, code) => {
  // Un utilisateur ne peut utiliser qu'un seul code de parrainage, une seule fois
  const [[self]] = await db.query(`SELECT referred_by FROM users WHERE id = ?`, [referred_id]);
  if (self?.referred_by) return { alreadyUsed: true };

  const [referrers] = await db.query(`SELECT id FROM users WHERE referral_code = ?`, [code]);
  if (!referrers.length) return null;
  const referrer_id = referrers[0].id;
  if (referrer_id === referred_id) return null;

  await db.query(`UPDATE users SET referred_by = ? WHERE id = ?`, [referrer_id, referred_id]);
  const rewardId = uuidv4();
  await db.query(
    `INSERT INTO referral_rewards (id, referrer_id, referred_id, credit) VALUES (?, ?, ?, 10.00)`,
    [rewardId, referrer_id, referred_id]
  );
  return { referrer_id, credit: 10 };
};

const getRewards = async (user_id) => {
  const [rows] = await db.query(
    `SELECT r.*, u.prenom, u.nom FROM referral_rewards r
     JOIN users u ON u.id = r.referred_id
     WHERE r.referrer_id = ? ORDER BY r.created_at DESC`,
    [user_id]
  );
  return rows;
};

const getTotalCredit = async (user_id) => {
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(credit),0) AS total FROM referral_rewards WHERE referrer_id = ? AND used = 0`,
    [user_id]
  );
  return parseFloat(rows[0]?.total || 0);
};

const getUnusedRewards = async (user_id) => {
  const [rows] = await db.query(
    `SELECT id, credit FROM referral_rewards WHERE referrer_id = ? AND used = 0 ORDER BY created_at ASC`,
    [user_id]
  );
  return rows;
};

const markRewardsUsed = async (ids) => {
  if (!ids.length) return;
  await db.query(`UPDATE referral_rewards SET used = 1 WHERE id IN (?)`, [ids]);
};

module.exports = { getOrCreateCode, applyReferral, getRewards, getTotalCredit, getUnusedRewards, markRewardsUsed };
