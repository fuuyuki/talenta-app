-- Run only AFTER the multi-role backend/frontend is deployed and verified.
-- Removes the legacy single-role column and its index.
BEGIN;

DROP INDEX IF EXISTS idx_users_role;
ALTER TABLE users DROP COLUMN IF EXISTS role;

COMMIT;
