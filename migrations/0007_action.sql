CREATE TABLE action (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  created_by_actor_id TEXT NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready', 'active', 'done', 'waiting', 'scheduled', 'archived')),
  area_id TEXT NOT NULL REFERENCES area(id),
  context_id TEXT NOT NULL REFERENCES context(id),
  project_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_action_workspace_id ON action(workspace_id);
CREATE INDEX idx_action_workspace_status ON action(workspace_id, status);
