#!/usr/bin/env bash
#
# Apply SQL migrations to the running Postgres container.
#
# Run from anywhere; paths are resolved from the repo root.
#
#   ./db/migrations/migrate.sh backup             dump the DB into db/backups/
#   ./db/migrations/migrate.sh apply 005_example.sql
#   ./db/migrations/migrate.sh verify             users, roles, members report
#   ./db/migrations/migrate.sh all                backup + verify
#
# Fresh databases are created from db/init/01_schema.sql, which is the
# single source of truth for the schema. Migrations only exist for changes
# applied after a database has already been initialised.
#
# All SQL is executed inside the `db` container using its own POSTGRES_USER /
# POSTGRES_DB, so no credentials or quoting are needed on the host.

set -euo pipefail

cd "$(dirname "$0")/../.."

COMPOSE=(docker compose -f docker-compose.yml)
MIGRATIONS_DIR="db/migrations"
BACKUP_DIR="db/backups"

die() { printf 'error: %s\n' "$1" >&2; exit 1; }

require_db() {
  if [ -z "$("${COMPOSE[@]}" ps -q db 2>/dev/null)" ]; then
    die "the 'db' container is not running. Start it with: ${COMPOSE[*]} up -d db"
  fi
}

# Run a single SQL statement.
sql() {
  "${COMPOSE[@]}" exec -T db \
    sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -c "$1"' sh "$1"
}

# Run a .sql file from the repo, streamed over stdin.
sql_file() {
  local file="$1"
  [ -f "$file" ] || die "file not found: $file"
  "${COMPOSE[@]}" exec -T db \
    sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -f -' < "$file"
}

cmd_backup() {
  require_db
  mkdir -p "$BACKUP_DIR"
  local out="$BACKUP_DIR/pre-migration-$(date +%Y%m%d-%H%M%S).dump"
  printf 'Dumping database to %s ...\n' "$out"
  "${COMPOSE[@]}" exec -T db \
    sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl -Fc' > "$out"
  [ -s "$out" ] || die "backup is empty: $out"
  printf 'Backup written: %s (%s)\n' "$out" "$(du -h "$out" | cut -f1)"
}

cmd_apply() {
  local name="${1:-}"
  [ -n "$name" ] || die "usage: $0 apply <migration.sql>"
  require_db
  local file="$MIGRATIONS_DIR/$name"
  printf 'Applying %s ...\n' "$file"
  sql_file "$file"
  printf 'Applied %s\n' "$name"
}

cmd_verify() {
  require_db

  "${COMPOSE[@]}" exec -T db \
    sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -f -' <<'SQL'
\pset pager off

\echo ''
\echo '== roles =='
SELECT r.code, count(ur.user_id) AS users
FROM roles r
LEFT JOIN user_roles ur ON ur.role_id = r.id
GROUP BY r.code
ORDER BY r.code;

\echo ''
\echo '== accounts without any role (should be 0) =='
SELECT count(*) AS accounts_without_role
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id);

SELECT CASE WHEN to_regclass('public.members') IS NULL THEN 'false' ELSE 'true' END
  AS has_members \gset

\if :has_members
\echo ''
\echo '== members vs accounts =='
SELECT
  (SELECT count(*) FROM members)                                       AS members,
  (SELECT count(*) FROM members WHERE user_id IS NOT NULL)             AS with_account,
  (SELECT count(*) FROM members WHERE user_id IS NULL)                 AS without_account,
  (SELECT count(*) FROM users)                                         AS accounts,
  (SELECT count(*) FROM users u
    WHERE NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id = u.id)) AS accounts_without_member;

\echo ''
\echo '== members by status =='
SELECT activity_status, count(*) AS members
FROM members
GROUP BY activity_status
ORDER BY activity_status;

\echo ''
\echo '== accounts linked to a member =='
SELECT u.email, m.full_name, m.activity_status
FROM users u
JOIN members m ON m.user_id = u.id
ORDER BY u.email;
\else
\echo ''
\echo '!! members table missing - this database was not initialised from db/init/01_schema.sql'
\endif
SQL
}

case "${1:-}" in
  backup) cmd_backup ;;
  apply)  shift; cmd_apply "$@" ;;
  verify) cmd_verify ;;
  all)
    cmd_backup
    cmd_verify
    ;;
  *)
    cat <<'EOF'
Usage: ./db/migrations/migrate.sh <command>

  backup             dump the database into db/backups/ (custom format)
  apply <file.sql>   apply a file from db/migrations/
  verify             users, roles and members report
  all                backup + verify
EOF
    exit 1
    ;;
esac
