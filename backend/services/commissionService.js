const commissionRepo = require("../repositories/commissionRepository");
const providerRepo = require("../repositories/providerRepository");
const db = require("../config/db");
const { calculerCommission, getNiveauParPrestations } = require("../config/commissions");

const getTaux = async () => commissionRepo.getAll();

const updateTaux = async (niveau, taux) => {
  const niveauxValides = ["debutant", "intermediaire", "avance", "expert"];
  if (!niveauxValides.includes(niveau))
    throw Object.assign(new Error("Niveau invalide."), { status: 400 });
  if (taux < 0 || taux > 100)
    throw Object.assign(new Error("Taux entre 0 et 100."), { status: 400 });
  return commissionRepo.updateTaux(niveau, taux);
};

const calculerPourBooking = async (provider_id, montantHT) => {
  const provider = await providerRepo.findById(provider_id);
  if (!provider) throw Object.assign(new Error("Prestataire introuvable."), { status: 404 });

  const commission = await commissionRepo.getByNiveau(provider.niveau);
  const taux = commission ? commission.taux : 25;
  const montantCommission = parseFloat(((montantHT * taux) / 100).toFixed(2));
  const montantNet = parseFloat((montantHT - montantCommission).toFixed(2));

  return {
    niveau: provider.niveau,
    taux,
    montantHT,
    montantCommission,
    montantNet,
  };
};

const upgradeNiveauAuto = async (provider_id) => {
  const [[result]] = await db.query(
    "SELECT COUNT(*) AS total FROM bookings WHERE provider_id = ? AND status = 'termine'",
    [provider_id]
  );
  const newNiveau = getNiveauParPrestations(result.total);
  await db.query("UPDATE providers SET niveau = ? WHERE id = ?", [newNiveau, provider_id]);
  return newNiveau;
};

module.exports = { getTaux, updateTaux, calculerPourBooking, upgradeNiveauAuto };
