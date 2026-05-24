-- Migration V18: Support Google OAuth by making password_hash nullable and adding google_sub
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN google_sub VARCHAR(255) UNIQUE;
