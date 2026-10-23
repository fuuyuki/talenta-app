# Database migrations

Plain SQL, applied in numeric order. There is no ORM migration table: each file
is written to be **idempotent** (guards, `IF NOT EXISTS`, `ON CONFLICT DO
NOTHING`), so re-running one is harmless. Files 002 and 004 are the exceptions —
they are destructive cleanups, so they must run only once and only after
verification.

## Data model

| Concept | Table | Notes |
| --- | --- | --- |
| Login account | `users` | Email, password hash, active flag. Nothing else. |
| Authorisation | `roles`, `user_roles` | A user may hold several roles globally (admin/mentor/mentee). |
| Roster / member data | `members` | The master list of people. `user_id` is **nullable**: a member may exist before (or without) an account. Bulk demographic/academic data lives here. |
| Group & mentor | `groups`, `members.group_id`, `members.mentor_id` | Mentor assignment is a property of the member, not the account. |
| Content | `articles` | `author_id` → `users`, because publishing needs an account. |

Deleting an account sets `members.user_id` to NULL; the member record survives.

## Files

| File | Safe on a live DB? | Purpose |
| --- | --- | --- |
| `001_add_user_roles.sql` | yes (additive) | Creates `roles` + `user_roles`, seeds admin/mentor/mentee, backfills from legacy `users.role`. Keeps `users.role` so a rollback is possible. |
| `002_drop_users_role.sql` | only **after** verification | Drops the legacy `users.role` column and its index. |
| `003_members_table.sql` | yes (additive) | Creates `members`, copies `member_profiles` into it, moves group/mentor and organization links onto members. Keeps `member_profiles` and `users.group_id` / `users.mentor_id` for rollback. |
| `004_drop_member_profiles.sql` | only **after** verification | Drops `member_profiles` and the legacy account-level `group_id` / `mentor_id`. |

`db/init/01_schema.sql` is only used when Postgres initializes a *fresh* volume;
it already contains the final shape. Do not edit it for existing databases.

## Order of operations on the VPS

Both new backends read the new tables on every login and at startup, so
**migrate before you deploy**. Deploying first means logins return 500 and the
superadmin bootstrap cannot run.

```bash
cd ~/talenta-app

# 0. make sure the current (old) stack is up
docker compose -f docker-compose.yml ps

# 1. back up, apply 001 + 003, verify
./db/migrations/migrate.sh all

# 2. deploy the new code
git pull
docker compose -f docker-compose.yml up -d --build
docker compose -f docker-compose.yml up -d --force-recreate nginx   # only if nginx.conf changed

# 3. smoke test: login, /admin/members (members with and without accounts),
#    /admin/users (roles), assign a user both mentor + mentee.

# 4. after everything works, drop the legacy structures
./db/migrations/migrate.sh apply 002_drop_users_role.sql
./db/migrations/migrate.sh apply 004_drop_member_profiles.sql
```

`003` is idempotent but it reads `users.group_id`, `users.mentor_id` and
`user_organizations`. Once **004** has dropped those, do not re-run `003` on the
same database.

## Individual commands

```bash
./db/migrations/migrate.sh backup                       # pg_dump -> db/backups/
./db/migrations/migrate.sh apply 003_members_table.sql
./db/migrations/migrate.sh verify                       # roles, members, accounts report
```

### Reading the `verify` output

- `accounts_without_role` must be `0`; a non-zero value means a legacy
  `users.role` value was not one of `admin` / `mentor` / `mentee`, so that
  account cannot log in until it gets a role.
- `without_account` is the number of members who have not been given a login
  yet — expected to grow as you import the roster.
- `accounts_without_member` counts accounts with no roster entry (usually
  admin/staff accounts). That is allowed; mentor/mentee accounts should have a
  member.

## Restoring the backup (if a step goes wrong)

`db/backups/` is git-ignored. The dump is custom format (`-Fc`), so use
`pg_restore` inside the container:

```bash
docker compose -f docker-compose.yml exec -T db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
  < db/backups/pre-migration-YYYYmmdd-HHMMSS.dump
```

To roll back only migration 003 (and keep user data), remove the new structures
and redeploy the previous image — the legacy tables are still there:

```sql
DROP TABLE IF EXISTS member_organizations;
ALTER TABLE user_organizations RENAME TO member_organizations;  -- only if you need the old name
DROP TABLE IF EXISTS members;
```

Rolling back 001 is similar: `DROP TABLE IF EXISTS user_roles; DROP TABLE IF
EXISTS roles;`. The previous image works because `users.role` is still present.

## Adding a new migration

1. Pick the next number: `005_<short_description>.sql`.
2. Wrap it in `BEGIN; ... COMMIT;`.
3. Make it idempotent where reasonably possible.
4. Update the table above.
