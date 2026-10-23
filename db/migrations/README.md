# Database schema & migrations

## Baseline

`db/init/01_schema.sql` is the **single source of truth** for the schema. Postgres
runs it automatically the first time the data volume is empty (it is mounted at
`/docker-entrypoint-initdb.d`).

It already contains everything from the earlier migration chain (global roles,
`members` split from `users`, member organizations, member-based sessions) — that
chain was folded in while the database still had no data. If you ever need it,
it is in the git history before commit `516ee30`.

To recreate a database from scratch (destroys all data):

```bash
docker compose -f docker-compose.yml down -v
docker compose -f docker-compose.yml up -d --build
docker compose -f docker-compose.yml logs db | tail -20   # check for init errors
```

## Data model

| Concept | Table | Notes |
| --- | --- | --- |
| Login account | `users` | Email, password hash, active flag. Auth only. |
| Authorisation | `roles`, `user_roles` | A user may hold several roles globally (admin/mentor/mentee). |
| Roster / member data | `members` | Master list of people. `user_id` is **nullable**: a member can exist before (or without) an account. |
| Group & mentor | `groups`, `members.group_id`, `members.mentor_id` | Mentor assignment belongs to the member, not the account. |
| Content | `articles` | `author_id` → `users`; publishing needs an account. |

Deleting an account sets `members.user_id` to NULL — the member record survives.

## Migrations

Use `db/migrations/` only for changes applied to a database that already exists.
Numbering starts at **005**; there are no pending migrations today.

```bash
./db/migrations/migrate.sh backup              # pg_dump -> db/backups/
./db/migrations/migrate.sh apply 005_add_x.sql
./db/migrations/migrate.sh verify              # roles, members, accounts report
./db/migrations/migrate.sh all                 # backup + verify
```

All SQL runs inside the `db` container with its own `POSTGRES_USER` /
`POSTGRES_DB`, so no credentials or quoting are needed on the host.

### Writing a migration

1. Next number: `005_<short_description>.sql`.
2. Wrap it in `BEGIN; ... COMMIT;`.
3. Make it idempotent where reasonably possible (`IF NOT EXISTS`, `ON CONFLICT`).
4. **Also** add the same change to `db/init/01_schema.sql` so fresh installs match.
5. Test it on a restored copy of the production dump, not directly on production.

### Reading the `verify` output

- `accounts_without_role` must be `0`; otherwise that account cannot log in until
  it gets a role.
- `without_account` is the number of members not yet given a login — expected to
  grow as the roster is imported.
- `accounts_without_member` counts accounts with no roster entry (usually
  admin/staff). That is allowed.

## Backup & restore

`db/backups/` is git-ignored. Dumps are custom format (`-Fc`):

```bash
docker compose -f docker-compose.yml exec -T db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
  < db/backups/pre-migration-YYYYmmdd-HHMMSS.dump
```
