CREATE TABLE audit_event (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_audit_event_workspace_id ON audit_event(workspace_id);
CREATE INDEX idx_audit_event_entity ON audit_event(entity_type, entity_id);
