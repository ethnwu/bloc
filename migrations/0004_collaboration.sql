ALTER TABLE shares ADD COLUMN role TEXT NOT NULL DEFAULT 'viewer';
CREATE TABLE project_members (project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,role TEXT NOT NULL CHECK(role IN ('editor','viewer')),created_at INTEGER NOT NULL,PRIMARY KEY(project_id,user_id));
CREATE INDEX members_user ON project_members(user_id);
CREATE TABLE project_presence (project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,seen INTEGER NOT NULL,PRIMARY KEY(project_id,user_id));
