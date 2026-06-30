-- ── 1. DEVIS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devis (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  client_id   CHAR(36)     NOT NULL,
  provider_id CHAR(36)     NOT NULL,
  service     VARCHAR(120) NOT NULL,
  description TEXT         NOT NULL,
  date_souhaitee DATE      DEFAULT NULL,
  montant     DECIMAL(8,2) DEFAULT NULL,
  status      ENUM('en_attente','envoye','accepte','refuse','expire') NOT NULL DEFAULT 'en_attente',
  message_client    TEXT  DEFAULT NULL,
  message_provider  TEXT  DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_client_devis   (client_id),
  INDEX idx_provider_devis (provider_id)
);

-- ── 2. FAVORIS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoris (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  client_id   CHAR(36)     NOT NULL,
  provider_id CHAR(36)     NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_fav (client_id, provider_id),
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- ── 3. DISPONIBILITES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disponibilites (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  provider_id CHAR(36)     NOT NULL,
  date_off    DATE         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_dispo (provider_id, date_off),
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- ── 4. PREMIUM ─────────────────────────────────────────────────────────────
ALTER TABLE providers ADD COLUMN premium TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE providers ADD COLUMN premium_until DATE DEFAULT NULL;

-- ── 5. PARRAINAGE ──────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN referral_code VARCHAR(12) DEFAULT NULL UNIQUE;
ALTER TABLE users ADD COLUMN referred_by   CHAR(36)   DEFAULT NULL;
CREATE TABLE IF NOT EXISTS referral_rewards (
  id            CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  referrer_id   CHAR(36)  NOT NULL,
  referred_id   CHAR(36)  NOT NULL,
  credit        DECIMAL(6,2) NOT NULL DEFAULT 10.00,
  used          TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
);
