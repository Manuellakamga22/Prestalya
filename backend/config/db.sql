CREATE DATABASE IF NOT EXISTS prestalya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE prestalya;

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  prenom        VARCHAR(80)  NOT NULL,
  nom           VARCHAR(80)  NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('client','prestataire','admin') NOT NULL DEFAULT 'client',
  photo_url     TEXT,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS providers (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36)     NOT NULL,
  service     VARCHAR(120) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  bio         TEXT,
  price_hour  DECIMAL(8,2) DEFAULT NULL,
  available   TINYINT(1)   NOT NULL DEFAULT 1,
  photo_url   TEXT,
  rating      DECIMAL(3,2) DEFAULT 0,
  reviews     INT          DEFAULT 0,
  niveau      ENUM('debutant','intermediaire','avance','expert') NOT NULL DEFAULT 'debutant',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_service (service),
  INDEX idx_city    (city),
  INDEX idx_user    (user_id),
  INDEX idx_niveau  (niveau)
);

CREATE TABLE IF NOT EXISTS commissions (
  id           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  niveau       ENUM('debutant','intermediaire','avance','expert') NOT NULL UNIQUE,
  taux         DECIMAL(5,2) NOT NULL,
  label        VARCHAR(80)  NOT NULL,
  description  TEXT,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO commissions (id, niveau, taux, label, description) VALUES
  (UUID(), 'debutant',      15.00, 'Débutant',      'Moins de 10 prestations réalisées. Commission de 15%.'),
  (UUID(), 'intermediaire', 12.00, 'Intermédiaire', 'Entre 10 et 50 prestations. Commission de 12%.'),
  (UUID(), 'avance',         7.00, 'Avancé',        'Entre 50 et 150 prestations. Commission de 7%.'),
  (UUID(), 'expert',         3.00, 'Expert',        'Plus de 150 prestations réalisées. Commission de 3%.')
ON DUPLICATE KEY UPDATE taux = VALUES(taux);

CREATE TABLE IF NOT EXISTS bookings (
  id              CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  client_id       CHAR(36)     NOT NULL,
  provider_id     CHAR(36)     NOT NULL,
  service         VARCHAR(120) NOT NULL,
  city            VARCHAR(100),
  date            DATE         NOT NULL,
  slot            VARCHAR(20),
  comment         TEXT,
  status          ENUM('en_attente','confirme','annule','termine') NOT NULL DEFAULT 'en_attente',
  montant_ht      DECIMAL(8,2) DEFAULT NULL,
  taux_commission DECIMAL(5,2) DEFAULT NULL,
  montant_commission DECIMAL(8,2) DEFAULT NULL,
  montant_net     DECIMAL(8,2) DEFAULT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_client   (client_id),
  INDEX idx_provider (provider_id)
);

CREATE TABLE IF NOT EXISTS password_resets (
  id         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

CREATE TABLE IF NOT EXISTS reviews (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  booking_id  CHAR(36)     NOT NULL UNIQUE,
  client_id   CHAR(36)     NOT NULL,
  provider_id CHAR(36)     NOT NULL,
  note        TINYINT      NOT NULL,
  commentaire TEXT,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)  ON DELETE CASCADE,
  FOREIGN KEY (client_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_provider_reviews (provider_id)
);
