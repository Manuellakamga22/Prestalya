-- Renommer price_hour en tarif_horaire (si la colonne s'appelle price_hour)
ALTER TABLE providers
  CHANGE COLUMN price_hour tarif_horaire DECIMAL(8,2) DEFAULT NULL;

-- Si la colonne s'appelle déjà tarif_horaire et que price_hour n'existe pas, ignorer cette migration.
