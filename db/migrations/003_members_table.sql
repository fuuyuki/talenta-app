-- Introduce `members` as the master roster, separate from `users`.
--
-- Additive and re-runnable: safe to apply while the current app is running.
-- It creates `members`, copies the old `member_profiles` rows into it, and
-- re-points the operational tables (groups, sessions, organizations) at members.
--
-- The legacy `member_profiles` table and `users.group_id` / `users.mentor_id`
-- are intentionally left in place so a rollback to the previous image works.
-- Drop them later with 004_drop_member_profiles.sql once verified.

BEGIN;

-- ------------------------------------------------------------
-- 1. members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender TEXT,
    birth_place TEXT,
    birth_date DATE,
    address TEXT,
    sma_id INT,
    domisili_id INT,
    occupation_id INT,
    university_id INT,
    faculty TEXT,
    major TEXT,
    entry_year SMALLINT,
    graduation_year SMALLINT,
    mentorship_tier TEXT,
    activity_status TEXT NOT NULL DEFAULT 'active',
    group_id UUID,
    mentor_id UUID,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_members_user ON members(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_group ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_members_mentor ON members(mentor_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(activity_status);
CREATE INDEX IF NOT EXISTS idx_members_full_name ON members(full_name);

ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_user;
ALTER TABLE members ADD CONSTRAINT fk_members_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_group;
ALTER TABLE members ADD CONSTRAINT fk_members_group
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_mentor;
ALTER TABLE members ADD CONSTRAINT fk_members_mentor
    FOREIGN KEY (mentor_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_gender_check;
ALTER TABLE members ADD CONSTRAINT members_gender_check
    CHECK (gender IN ('L', 'P'));

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_activity_status_check;
ALTER TABLE members ADD CONSTRAINT members_activity_status_check
    CHECK (activity_status IN ('active', 'inactive', 'mutated', 'lost contact'));

-- ------------------------------------------------------------
-- 2. Copy existing profiles (legacy name: member_profiles)
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'member_profiles'
    ) THEN
        INSERT INTO members (
            user_id, full_name, email, phone, gender, birth_place, birth_date,
            address, sma_id, domisili_id, occupation_id, university_id, faculty,
            major, entry_year, graduation_year, mentorship_tier,
            activity_status, created_at, updated_at
        )
        SELECT
            mp.user_id, mp.full_name, u.email, mp.phone, mp.gender, mp.birth_place,
            mp.birth_date, mp.address, mp.sma_id, mp.domisili_id, mp.occupation_id,
            mp.university_id, mp.faculty, mp.major, mp.entry_year,
            mp.graduation_year, mp.mentorship_tier, mp.activity_status,
            mp.created_at, mp.updated_at
        FROM member_profiles mp
        JOIN users u ON u.id = mp.user_id
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Make sure every account referenced by membership data has a member row
--    (accounts used only for administration stay without one).
-- ------------------------------------------------------------
INSERT INTO members (user_id, full_name, created_at, updated_at)
SELECT DISTINCT u.id,
       COALESCE(NULLIF(split_part(u.email, '@', 1), ''), u.email),
       u.created_at,
       u.updated_at
FROM users u
WHERE (
        u.group_id IS NOT NULL
     OR u.mentor_id IS NOT NULL
     OR EXISTS (SELECT 1 FROM groups g WHERE g.mentor_id = u.id)
     OR EXISTS (SELECT 1 FROM sessions s WHERE s.mentor_id = u.id OR s.mentee_id = u.id)
      )
  AND NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id = u.id)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 4. Move group / mentor assignment from users onto members
-- ------------------------------------------------------------
UPDATE members m
SET group_id = u.group_id
FROM users u
WHERE u.id = m.user_id
  AND u.group_id IS NOT NULL
  AND m.group_id IS NULL;

UPDATE members m
SET mentor_id = mentor_member.id
FROM users u
JOIN members mentor_member ON mentor_member.user_id = u.mentor_id
WHERE u.id = m.user_id
  AND u.mentor_id IS NOT NULL
  AND m.mentor_id IS NULL;

-- ------------------------------------------------------------
-- 5. Re-point groups.mentor_id from users to members
-- ------------------------------------------------------------
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class src ON src.oid = con.conrelid
    JOIN pg_class ref ON ref.oid = con.confrelid
    JOIN pg_attribute att
         ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f'
      AND src.relname = 'groups'
      AND att.attname = 'mentor_id'
      AND ref.relname = 'users'
    LIMIT 1;

    IF constraint_name IS NOT NULL THEN
        UPDATE groups g SET mentor_id = m.id
        FROM members m
        WHERE m.user_id = g.mentor_id;

        EXECUTE format('ALTER TABLE groups DROP CONSTRAINT %I', constraint_name);
        ALTER TABLE groups ADD CONSTRAINT fk_groups_mentor
            FOREIGN KEY (mentor_id) REFERENCES members(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------
-- 6. Re-point sessions.mentor_id / sessions.mentee_id from users to members
-- ------------------------------------------------------------
DO $$
DECLARE
    constraint_name text;
    column_name text;
BEGIN
    FOREACH column_name IN ARRAY ARRAY['mentor_id', 'mentee_id']
    LOOP
        SELECT con.conname INTO constraint_name
        FROM pg_constraint con
        JOIN pg_class src ON src.oid = con.conrelid
        JOIN pg_class ref ON ref.oid = con.confrelid
        JOIN pg_attribute att
             ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
        WHERE con.contype = 'f'
          AND src.relname = 'sessions'
          AND att.attname = column_name
          AND ref.relname = 'users'
        LIMIT 1;

        IF constraint_name IS NOT NULL THEN
            EXECUTE format('ALTER TABLE sessions DROP CONSTRAINT %I', constraint_name);

            IF column_name = 'mentor_id' THEN
                UPDATE sessions s SET mentor_id = m.id
                FROM members m WHERE m.user_id = s.mentor_id;
            ELSE
                UPDATE sessions s SET mentee_id = m.id
                FROM members m WHERE m.user_id = s.mentee_id;
            END IF;

            EXECUTE format(
                'ALTER TABLE sessions ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES members(id) ON DELETE CASCADE',
                'sessions_' || column_name || '_fkey',
                column_name
            );
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- 7. user_organizations -> member_organizations
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_organizations'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'member_organizations'
    ) THEN
        -- Members are required before the pivot rows can point at them.
        INSERT INTO members (user_id, full_name, created_at, updated_at)
        SELECT DISTINCT u.id,
               COALESCE(NULLIF(split_part(u.email, '@', 1), ''), u.email),
               u.created_at,
               u.updated_at
        FROM users u
        JOIN user_organizations uo ON uo.user_id = u.id
        WHERE NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id = u.id)
        ON CONFLICT DO NOTHING;

        ALTER TABLE user_organizations RENAME TO member_organizations;
        ALTER TABLE member_organizations RENAME COLUMN user_id TO member_id;
        ALTER TABLE member_organizations
            DROP CONSTRAINT IF EXISTS user_organizations_user_id_fkey;

        -- Values are still user ids at this point; map them to member ids.
        UPDATE member_organizations mo
        SET member_id = m.id
        FROM members m
        WHERE m.user_id = mo.member_id;
    END IF;
END $$;

ALTER TABLE member_organizations
    DROP CONSTRAINT IF EXISTS member_organizations_member_id_fkey;
ALTER TABLE member_organizations
    ADD CONSTRAINT member_organizations_member_id_fkey
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

COMMIT;
