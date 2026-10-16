CREATE TABLE shares (token_hash TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,created_at INTEGER NOT NULL);
CREATE INDEX shares_project_idx ON shares(project_id);
