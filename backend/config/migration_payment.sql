ALTER TABLE bookings
  ADD COLUMN payment_status ENUM('non_paye','paye','rembourse') NOT NULL DEFAULT 'non_paye' AFTER status,
  ADD COLUMN stripe_session_id VARCHAR(255) NULL AFTER payment_status,
  ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL AFTER stripe_session_id;
