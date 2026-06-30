-- Étend le statut des réservations pour le workflow complet :
-- en_attente -> (refuse | propose | accepte) -> confirme -> termine
ALTER TABLE bookings
  MODIFY COLUMN status ENUM('en_attente','refuse','propose','accepte','confirme','termine','annule')
  NOT NULL DEFAULT 'en_attente';

ALTER TABLE bookings
  ADD COLUMN propose_date DATE NULL AFTER date,
  ADD COLUMN propose_slot VARCHAR(10) NULL AFTER slot;

-- Étend les disponibilités pour suivre le statut réel de chaque créneau
ALTER TABLE disponibilites
  ADD COLUMN status ENUM('indisponible','en_attente','reserve') NOT NULL DEFAULT 'indisponible' AFTER slot,
  ADD COLUMN booking_id CHAR(36) NULL AFTER status;
