-- ============================================================
--  PRESTALYA — Schema complet pour Railway (base : railway)
--  Executer en une seule fois dans MySQL Workbench
-- ============================================================

USE railway;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  prenom        VARCHAR(80)  NOT NULL,
  nom           VARCHAR(80)  NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('client','prestataire','admin') NOT NULL DEFAULT 'client',
  verified      TINYINT(1)   NOT NULL DEFAULT 0,
  photo_url     TEXT,
  referral_code VARCHAR(12)  DEFAULT NULL UNIQUE,
  referred_by   CHAR(36)     DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── PROVIDERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS providers (
  id             CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id        CHAR(36)     NOT NULL,
  service        VARCHAR(120) NOT NULL,
  city           VARCHAR(100) NOT NULL,
  bio            TEXT,
  tarif_horaire  DECIMAL(8,2) DEFAULT NULL,
  available      TINYINT(1)   NOT NULL DEFAULT 1,
  photo_url      TEXT,
  siret          VARCHAR(20)  DEFAULT NULL,
  experience     TINYINT      DEFAULT NULL,
  disponibilite  VARCHAR(100) DEFAULT NULL,
  rating         DECIMAL(3,2) DEFAULT 0,
  reviews        INT          DEFAULT 0,
  niveau         ENUM('debutant','intermediaire','avance','expert') NOT NULL DEFAULT 'debutant',
  verified       TINYINT(1)   NOT NULL DEFAULT 0,
  docs_submitted TINYINT(1)   NOT NULL DEFAULT 0,
  premium        TINYINT(1)   NOT NULL DEFAULT 0,
  premium_until  DATE         DEFAULT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_service (service),
  INDEX idx_city    (city),
  INDEX idx_user    (user_id),
  INDEX idx_niveau  (niveau)
);

-- ── COMMISSIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commissions (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  niveau      ENUM('debutant','intermediaire','avance','expert') NOT NULL UNIQUE,
  taux        DECIMAL(5,2) NOT NULL,
  label       VARCHAR(80)  NOT NULL,
  description TEXT,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO commissions (id, niveau, taux, label, description) VALUES
  (UUID(), 'debutant',      15.00, 'Débutant',      'Moins de 10 prestations réalisées. Commission de 15%.'),
  (UUID(), 'intermediaire', 12.00, 'Intermédiaire', 'Entre 10 et 50 prestations. Commission de 12%.'),
  (UUID(), 'avance',         7.00, 'Avancé',        'Entre 50 et 150 prestations. Commission de 7%.'),
  (UUID(), 'expert',         3.00, 'Expert',        'Plus de 150 prestations réalisées. Commission de 3%.')
ON DUPLICATE KEY UPDATE taux = VALUES(taux);

-- ── BOOKINGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                      CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  client_id               CHAR(36)     NOT NULL,
  provider_id             CHAR(36)     NOT NULL,
  service                 VARCHAR(120) NOT NULL,
  city                    VARCHAR(100),
  date                    DATE         NOT NULL,
  propose_date            DATE         NULL,
  slot                    VARCHAR(20),
  propose_slot            VARCHAR(10)  NULL,
  comment                 TEXT,
  status                  ENUM('en_attente','refuse','propose','accepte','confirme','termine','annule') NOT NULL DEFAULT 'en_attente',
  payment_status          ENUM('non_paye','paye','rembourse') NOT NULL DEFAULT 'non_paye',
  stripe_session_id       VARCHAR(255) NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,
  montant_ht              DECIMAL(8,2) DEFAULT NULL,
  taux_commission         DECIMAL(5,2) DEFAULT NULL,
  montant_commission      DECIMAL(8,2) DEFAULT NULL,
  montant_net             DECIMAL(8,2) DEFAULT NULL,
  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_client   (client_id),
  INDEX idx_provider (provider_id)
);

-- ── DISPONIBILITES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disponibilites (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  provider_id CHAR(36)     NOT NULL,
  date_off    DATE         NOT NULL,
  slot        VARCHAR(10)  DEFAULT NULL,
  status      ENUM('indisponible','en_attente','reserve') NOT NULL DEFAULT 'indisponible',
  booking_id  CHAR(36)     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_dispo_slot (provider_id, date_off, slot),
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- ── PASSWORD RESETS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
  id         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  booking_id  CHAR(36)  NOT NULL UNIQUE,
  client_id   CHAR(36)  NOT NULL,
  provider_id CHAR(36)  NOT NULL,
  note        TINYINT   NOT NULL,
  commentaire TEXT,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)  ON DELETE CASCADE,
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_provider_reviews (provider_id)
);

-- ── PROVIDER DOCUMENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS provider_documents (
  id            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36)     NOT NULL,
  type          ENUM('identite','casier','diplome','domicile','siret_doc','autre') NOT NULL,
  label         VARCHAR(120) NOT NULL,
  filename      VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  status        ENUM('en_attente','valide','rejete') NOT NULL DEFAULT 'en_attente',
  reject_reason TEXT         DEFAULT NULL,
  uploaded_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  validated_at  DATETIME     DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user   (user_id),
  INDEX idx_status (status)
);

-- ── DEVIS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devis (
  id               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  client_id        CHAR(36)     NOT NULL,
  provider_id      CHAR(36)     NOT NULL,
  service          VARCHAR(120) NOT NULL,
  description      TEXT         NOT NULL,
  date_souhaitee   DATE         DEFAULT NULL,
  montant          DECIMAL(8,2) DEFAULT NULL,
  status           ENUM('en_attente','envoye','accepte','refuse','expire') NOT NULL DEFAULT 'en_attente',
  message_client   TEXT         DEFAULT NULL,
  message_provider TEXT         DEFAULT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_client_devis   (client_id),
  INDEX idx_provider_devis (provider_id)
);

-- ── FAVORIS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoris (
  id          CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  client_id   CHAR(36)  NOT NULL,
  provider_id CHAR(36)  NOT NULL,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_fav (client_id, provider_id),
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- ── REFERRAL REWARDS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_rewards (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  referrer_id CHAR(36)     NOT NULL,
  referred_id CHAR(36)     NOT NULL,
  credit      DECIMAL(6,2) NOT NULL DEFAULT 10.00,
  used        TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
);
