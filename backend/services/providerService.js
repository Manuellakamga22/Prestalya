const providerRepo = require("../repositories/providerRepository");

const list = async (filters) => providerRepo.findAll(filters);

const getOne = async (id) => {
  const p = await providerRepo.findById(id);
  if (!p) throw Object.assign(new Error("Prestataire introuvable."), { status: 404 });
  return p;
};

const createProfile = async (user_id, data) => {
  const existing = await providerRepo.findByUserId(user_id);
  if (existing) throw Object.assign(new Error("Profil prestataire déjà existant."), { status: 409 });
  return providerRepo.create({ user_id, ...data });
};

const updateProfile = async (id, user_id, data) => {
  const p = await providerRepo.findById(id);
  if (!p) throw Object.assign(new Error("Prestataire introuvable."), { status: 404 });
  if (p.user_id !== user_id) throw Object.assign(new Error("Non autorisé."), { status: 403 });
  return providerRepo.update(id, data);
};

module.exports = { list, getOne, createProfile, updateProfile };
