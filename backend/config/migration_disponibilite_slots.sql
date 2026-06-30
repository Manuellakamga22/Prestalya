-- Ajouter la colonne slot à disponibilites
ALTER TABLE disponibilites
  DROP INDEX uniq_dispo,
  ADD COLUMN slot VARCHAR(10) DEFAULT NULL AFTER date_off,
  ADD UNIQUE KEY uniq_dispo_slot (provider_id, date_off, slot);
