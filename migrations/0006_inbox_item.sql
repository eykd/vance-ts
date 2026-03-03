CREATE TABLE inbox_item (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'clarified')),
  clarified_into_type TEXT CHECK (clarified_into_type IN ('action')),
  clarified_into_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_inbox_item_workspace_id ON inbox_item(workspace_id);
