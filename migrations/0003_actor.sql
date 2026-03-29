CREATE TABLE actor (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('human', 'agent')),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_actor_workspace_id ON actor(workspace_id);
