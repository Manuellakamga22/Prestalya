const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    res.json(user);
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé." });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) { next(err); }
};

module.exports = { register, login, me, forgotPassword, resetPassword };
