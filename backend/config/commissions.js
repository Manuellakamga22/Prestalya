const COMMISSIONS = {
  debutant:      { taux: 15, label: "Débutant",      seuilMin: 0,   seuilMax: 9   },
  intermediaire: { taux: 12, label: "Intermédiaire", seuilMin: 10,  seuilMax: 49  },
  avance:        { taux: 7,  label: "Avancé",        seuilMin: 50,  seuilMax: 149 },
  expert:        { taux: 3,  label: "Expert",        seuilMin: 150, seuilMax: null },
};

function calculerCommission(montantHT, niveau) {
  const config = COMMISSIONS[niveau] || COMMISSIONS.debutant;
  const taux = config.taux;
  const montantCommission = parseFloat(((montantHT * taux) / 100).toFixed(2));
  const montantNet = parseFloat((montantHT - montantCommission).toFixed(2));
  return { taux, montantCommission, montantNet };
}

function getNiveauParPrestations(nbPrestations) {
  if (nbPrestations >= 150) return "expert";
  if (nbPrestations >= 50)  return "avance";
  if (nbPrestations >= 10)  return "intermediaire";
  return "debutant";
}

module.exports = { COMMISSIONS, calculerCommission, getNiveauParPrestations };
