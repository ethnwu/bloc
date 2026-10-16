CREATE TABLE snapshots (code TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, name TEXT NOT NULL, data TEXT NOT NULL, content_hash TEXT NOT NULL, created_at INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);
CREATE INDEX snapshots_project ON snapshots(project_id,content_hash,revoked);
CREATE TABLE stage_templates (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,name TEXT NOT NULL,data TEXT NOT NULL,updated_at INTEGER NOT NULL);
CREATE INDEX stage_templates_owner ON stage_templates(user_id);
CREATE TABLE public_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window INTEGER NOT NULL);
