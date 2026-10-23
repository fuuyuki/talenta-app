-- Run only AFTER migration 003 is applied, the new code is deployed, and
-- members / accounts look correct in /admin/members.
--
-- Removes the legacy single-table profile and the account-level group/mentor
-- columns that now live on `members`.
BEGIN;

DROP TABLE IF EXISTS member_profiles;

ALTER TABLE users DROP COLUMN IF EXISTS group_id;
ALTER TABLE users DROP COLUMN IF EXISTS mentor_id;

DROP INDEX IF EXISTS idx_users_group;
DROP INDEX IF EXISTS idx_users_mentor;

COMMIT;
