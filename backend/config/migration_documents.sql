-- Run once in MySQL Workbench

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

-- Add verification status to providers table
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS verified       TINYINT(1) NOT NULL DEFAULT 0 AFTER niveau,
  ADD COLUMN IF NOT EXISTS docs_submitted TINYINT(1) NOT NULL DEFAULT 0 AFTER verified;

-- Add verification status to users table (for badge)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verified TINYINT(1) NOT NULL DEFAULT 0 AFTER role;
