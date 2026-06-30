const providerService = require("../services/providerService");

const list = async (req, res, next) => {
  try {
    const { service, city, available } = req.query;
    const filters = {
      service: service || null,
      city: city || null,
      available: available !== undefined ? available === "true" : undefined,
    };
    const providers = await providerService.list(filters);
    res.json(providers);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const provider = await providerService.getOne(req.params.id);
    res.json(provider);
  } catch (err) { next(err); }
};

const createProfile = async (req, res, next) => {
  try {
    const profile = await providerService.createProfile(req.user.id, req.body);
    res.status(201).json(profile);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await providerService.updateProfile(req.params.id, req.user.id, req.body);
    res.json(profile);
  } catch (err) { next(err); }
};

module.exports = { list, getOne, createProfile, updateProfile };
