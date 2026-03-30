-- Prestoplot grammar storage
-- See specs/016-prestoplot-core/contracts/storage-port.md

CREATE TABLE IF NOT EXISTS grammars (
  key        TEXT NOT NULL PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_grammars_updated_at ON grammars (updated_at);
