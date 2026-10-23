# Database migrations

Plain SQL, applied in numeric order. There is no ORM migration table: each file
is written to be **idempotent** (`CREATE ... IF NOT EXISTS`, `ON CONFLICT DO
NOTHING`), so re-running one is harmless.

## Files

| File | Safe on a live DB? | Purpose |
| --- | --- | --- |
| `001_add_user_roles.sql` | yes (additive) | Creates `roles` + `user_roles`, seeds admin/mentor/mentee, backfills from legacy `users.role`. Keeps `users.role` so a rollback is possible. |
| `002_drop_users_role.sql` | yes, but only **after** verification | Drops the legacy `users.role` column and its index. |

`db/init/01_schema.sql` is only used when Postgres initializes a *fresh* volume;
it already contains the new tables and no `users.role`. Do not edit it for
existing databases.

## Order of operations on the VPS

The new backend reads `roles` / `user_roles` on every login and at startup, so
**migrate before you deploy**. Deploying first means logins return 500 and the
superadmin bootstrap cannot run.

```bash
cd ~/talenta-app

# 0. make sure the current (old) stack is up
docker compose -f docker-compose.yml ps

# 1. back up, apply 001, verify  (all in one)
./db/migrations/migrate.sh all

# 2. deploy the new code
git pull
docker compose -f docker-compose.yml up -d --build
docker compose -f docker-compose.yml up -d --force-recreate nginx   # only if nginx.conf changed

# 3. smoke test in the browser: login, /admin/users, assign a user both
#    mentor + mentee, confirm that user sees /mentor and /mentee.

# 4. after everything works, remove the legacy column
./db/migrations/migrate.sh apply 002_drop_users_role.sql
```

## Individual commands

```bash
./db/migrations/migrate.sh backup                       # pg_dump -> db/backups/
./db/migrations/migrate.sh apply 001_add_user_roles.sql
./db/migrations/migrate.sh verify                       # users + roles report
```

### Reading the `verify` output

- `users_without_roles` must be `0`. A non-zero count means some legacy
  `users.role` value was not one of `admin` / `mentor` / `mentee` (the old schema
  constrained it to those three, so this should not happen). Those accounts
  cannot log in until they get a role — set one from `/admin/users`.
- The role counts should roughly match what you expect from the old data.

## Restoring the backup (if a step goes wrong)

`db/backups/` is git-ignored. The dump is custom format (`-Fc`), so use
`pg_restore` inside the container:

```bash
docker compose -f docker-compose.yml exec -T db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
  < db/backups/pre-migration-YYYYmmdd-HHMMSS.dump
```

Rolling back only the new tables is easier and loses no user data:

```sql
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
```

Then redeploy the previous backend image (which still uses `users.role`, still
present thanks to the additive design of 001).

## Adding a new migration

1. Pick the next number: `003_<short_description>.sql`.
2. Wrap it in `BEGIN; ... COMMIT;`.
3. Make it idempotent where reasonably possible.
4. Update the table above.
