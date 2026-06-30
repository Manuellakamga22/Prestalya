-- Run this once in MySQL Workbench to add extra columns to providers table
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS siret         VARCHAR(20)  DEFAULT NULL AFTER photo_url,
  ADD COLUMN IF NOT EXISTS experience    TINYINT      DEFAULT NULL AFTER siret,
  ADD COLUMN IF NOT EXISTS disponibilite VARCHAR(100) DEFAULT NULL AFTER experience;
