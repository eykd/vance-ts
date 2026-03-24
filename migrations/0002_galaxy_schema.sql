-- Galaxy schema: star_systems, routes, trade_pairs
-- See specs/015-galaxy-seed-d1/data-model.md
--
-- NOTE: routes and trade_pairs reference star_systems.id via REFERENCES clauses,
-- but D1/SQLite only enforces FK constraints when PRAGMA foreign_keys = ON.
-- This pragma is NOT guaranteed in D1; the REFERENCES clauses serve as
-- documentation and enable enforcement if the pragma is enabled in the future.

CREATE TABLE star_systems (
  id             TEXT    NOT NULL PRIMARY KEY,
  name           TEXT    NOT NULL UNIQUE,
  x              INTEGER NOT NULL,
  y              INTEGER NOT NULL,
  is_oikumene    INTEGER NOT NULL,
  classification TEXT    NOT NULL CHECK (classification IN ('oikumene','uninhabited','lost_colony','hidden_enclave')),
  density        TEXT    NOT NULL,
  attributes     TEXT    NOT NULL,
  planetary      TEXT    NOT NULL,
  civilization   TEXT    NOT NULL,
  trade_codes    TEXT    NOT NULL,
  economics      TEXT    NOT NULL
);

CREATE UNIQUE INDEX idx_star_systems_coords ON star_systems (x, y);
CREATE INDEX idx_star_systems_name ON star_systems (name);
CREATE INDEX idx_star_systems_classification ON star_systems (classification);

CREATE TABLE routes (
  origin_id      TEXT NOT NULL REFERENCES star_systems(id),
  destination_id TEXT NOT NULL REFERENCES star_systems(id),
  cost           REAL NOT NULL,
  PRIMARY KEY (origin_id, destination_id)
);

CREATE INDEX idx_routes_destination ON routes (destination_id);

CREATE TABLE trade_pairs (
  system_a_id TEXT    NOT NULL REFERENCES star_systems(id),
  system_b_id TEXT    NOT NULL REFERENCES star_systems(id),
  btn         REAL    NOT NULL,
  hops        INTEGER NOT NULL,
  PRIMARY KEY (system_a_id, system_b_id)
);

CREATE INDEX idx_trade_pairs_system_b ON trade_pairs (system_b_id);
