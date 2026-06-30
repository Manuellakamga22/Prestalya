const commissionService = require("../services/commissionService");

const getTaux = async (req, res, next) => {
  try { res.json(await commissionService.getTaux()); }
  catch (err) { next(err); }
};

const updateTaux = async (req, res, next) => {
  try {
    const { niveau, taux } = req.body;
    res.json(await commissionService.updateTaux(niveau, parseFloat(taux)));
  } catch (err) { next(err); }
};

const simuler = async (req, res, next) => {
  try {
    const { provider_id, montant_ht } = req.body;
    res.json(await commissionService.calculerPourBooking(provider_id, parseFloat(montant_ht)));
  } catch (err) { next(err); }
};

module.exports = { getTaux, updateTaux, simuler };
