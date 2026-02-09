-- Migration: Create users table
-- Maps from User entity (src/domain/entities/User.ts)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  email_normalized TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  password_changed_at TEXT NOT NULL,
  last_login_ip TEXT,
  last_login_user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email_normalized ON users(email_normalized);
