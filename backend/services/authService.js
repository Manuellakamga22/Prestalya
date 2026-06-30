const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRepo = require("../repositories/userRepository");
const db = require("../config/db");
const { sendMail } = require("../config/mailer");
const { resetPassword: resetTpl, welcome: welcomeTpl } = require("../config/emailTemplates");

const register = async ({ prenom, nom, email, password, role }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw Object.assign(new Error("Cet email est déjà utilisé."), { status: 409 });

  const password_hash = await bcrypt.hash(password, 12);
  const user = await userRepo.create({ prenom, nom, email, password_hash, role: role || "client" });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  sendMail({
    to: user.email,
    subject: "Bienvenue sur Prestalya ! 🎉",
    html: welcomeTpl({ prenom: user.prenom, role: user.role }),
  }).catch(() => {});

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw Object.assign(new Error("Email ou mot de passe incorrect."), { status: 401 });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error("Email ou mot de passe incorrect."), { status: 401 });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
};

const me = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw Object.assign(new Error("Utilisateur introuvable."), { status: 404 });
  return user;
};

const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await db.query(
    "INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (UUID(), ?, ?, ?)",
    [user.id, token, expires]
  );

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Réinitialisation de votre mot de passe Prestalya",
    html: resetTpl({ prenom: user.prenom, resetUrl }),
  });
};

const resetPassword = async (token, newPassword) => {
  const [rows] = await db.query(
    "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()",
    [token]
  );
  if (!rows[0]) throw Object.assign(new Error("Lien invalide ou expiré."), { status: 400 });

  const hash = await bcrypt.hash(newPassword, 12);
  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, rows[0].user_id]);
  await db.query("UPDATE password_resets SET used = 1 WHERE token = ?", [token]);
};

module.exports = { register, login, me, forgotPassword, resetPassword };
