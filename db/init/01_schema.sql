-- ============================================================
-- TALENTA SCHEMA (Kader & Mentorship System)
-- ============================================================
-- Two distinct concepts:
--   members  -> the roster: all people the yayasan tracks, with or without
--               a login account (bulky demographic / academic data).
--   users    -> authentication + authorisation only. A user may be linked
--               to at most one member; admins may exist without one.
-- See db/migrations/README.md for how existing databases are upgraded.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- ------------------------------------------------------------
-- 1. LOOKUP TABLES
-- ------------------------------------------------------------
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE occupations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE universities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 2. ORGANIZATIONS (Many-to-Many for member)
-- ------------------------------------------------------------
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT -- e.g., 'community', 'hobby', 'activist'
);

-- ------------------------------------------------------------
-- 3. USERS (Authentication only)
-- ------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. MEMBERS (The roster; account link is optional)
-- ------------------------------------------------------------
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID CONSTRAINT uq_members_user UNIQUE
        REFERENCES users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,             -- "nama lengkap"
    email TEXT CONSTRAINT uq_members_email UNIQUE, -- contact address, may differ from the login email
    phone TEXT,                          -- "nomor_hp"
    gender TEXT CHECK (gender IN ('L', 'P')), -- "jenis_kelamin"
    birth_place TEXT,                    -- "tempat lahir"
    birth_date DATE,                     -- "tanggal lahir"
    address TEXT,                        -- "alamat lengkap"

    -- Academic & Occupation Lookups
    sma_id INT REFERENCES schools(id) ON DELETE SET NULL,
    domisili_id INT REFERENCES cities(id) ON DELETE SET NULL,
    occupation_id INT REFERENCES occupations(id) ON DELETE SET NULL,
    university_id INT REFERENCES universities(id) ON DELETE SET NULL,

    -- Academic details
    faculty TEXT,                        -- "fakultas"
    major TEXT,                          -- "jurusan"
    entry_year SMALLINT,                 -- "tahun masuk"
    graduation_year SMALLINT,            -- "tahun lulus"

    -- Statuses
    mentorship_tier TEXT,                -- "level"
    activity_status TEXT NOT NULL DEFAULT 'active'
        CHECK (activity_status IN ('active', 'inactive', 'mutated', 'lost contact')), -- "keaktifan"

    group_id UUID,                       -- FK added after `groups` exists
    mentor_id UUID,                      -- FK added after `groups` exists

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_group ON members(group_id);
CREATE INDEX idx_members_mentor ON members(mentor_id);
CREATE INDEX idx_members_status ON members(activity_status);
CREATE INDEX idx_members_full_name ON members(full_name);

-- ------------------------------------------------------------
-- 4b. ROLES (A user can hold multiple roles)
-- ------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

INSERT INTO roles (code, name) VALUES
    ('admin', 'Admin'),
    ('mentor', 'Mentor'),
    ('mentee', 'Mentee');

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ------------------------------------------------------------
-- 5. GROUPS (Mentorship groups)
-- ------------------------------------------------------------
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mentor_id UUID, -- FK added after `members` exists
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE members
  ADD CONSTRAINT fk_members_group
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

ALTER TABLE members
  ADD CONSTRAINT fk_members_mentor
  FOREIGN KEY (mentor_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE groups
  ADD CONSTRAINT fk_groups_mentor
  FOREIGN KEY (mentor_id) REFERENCES members(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 6. MEMBER ORGANIZATIONS (Pivot Table)
-- ------------------------------------------------------------
CREATE TABLE member_organizations (
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (member_id, organization_id)
);

-- ------------------------------------------------------------
-- 7. MENTORSHIP SESSIONS & ARTICLES
-- ------------------------------------------------------------
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- Optional: link to group
    mentor_id UUID REFERENCES members(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES members(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    title TEXT,
    agenda TEXT,
    notes TEXT,
    private_notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    body_md TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 8. REGISTRATION REQUESTS (Tickets)
-- ------------------------------------------------------------
CREATE TABLE registration_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE, -- Ensures they can't submit twice
    phone           TEXT,
    reason          TEXT,                 -- Why they want to join
    status          TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
