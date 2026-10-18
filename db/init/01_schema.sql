-- ============================================================
-- TALENTA SCHEMA (Kader & Mentorship System)
-- ============================================================

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
-- 2. ORGANIZATIONS (Many-to-Many for user)
-- ------------------------------------------------------------
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT -- e.g., 'community', 'hobby', 'activist'
);

-- ------------------------------------------------------------
-- 3. GROUPS (Mentorship groups)
-- ------------------------------------------------------------
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mentor_id UUID, -- Added FK later to avoid circular dependency
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. USERS (Base authentication and roles)
-- ------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'mentor', 'mentee')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    mentor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Self-referencing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Now that 'users' exists, link the 'groups' table to its mentor
ALTER TABLE groups
  ADD CONSTRAINT fk_groups_mentor
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_mentor ON users(mentor_id);
CREATE INDEX idx_users_group ON users(group_id);

-- ------------------------------------------------------------
-- 5. MEMBER PROFILES (Personal, Academic, & Status Data)
-- ------------------------------------------------------------
CREATE TABLE member_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,             -- "nama lengkap"
    gender TEXT CHECK (gender IN ('L', 'P')), -- "jenis_kelamin" (Laki-laki/Perempuan)
    birth_place TEXT,                    -- "tempat lahir"
    birth_date DATE,                     -- "tanggal lahir"
    address TEXT,                        -- "alamat lengkap"
    phone TEXT,                          -- "nomor_hp"

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

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. USER ORGANIZATIONS (Pivot Table)
-- ------------------------------------------------------------
CREATE TABLE user_organizations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, organization_id)
);

-- ------------------------------------------------------------
-- 7. MENTORSHIP SESSIONS & ARTICLES (From previous design)
-- ------------------------------------------------------------
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- Optional: link to group
    mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
