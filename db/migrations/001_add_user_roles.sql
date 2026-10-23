-- Add global multi-role support.
--
-- Additive and idempotent: safe to run while the current app is still running.
-- The legacy `users.role` column is intentionally kept so a rollback is possible.
-- Drop it later with 002_drop_users_role.sql after the new app is verified.

BEGIN;

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

INSERT INTO roles (code, name) VALUES
    ('admin', 'Admin'),
    ('mentor', 'Mentor'),
    ('mentee', 'Mentee')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Backfill each user's single legacy role into the new relation.
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = u.role
ON CONFLICT (user_id, role_id) DO NOTHING;

COMMIT;
