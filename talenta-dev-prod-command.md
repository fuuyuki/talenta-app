Good questions — let me give you the mental model, then a concrete workflow for this repo.

Short answer: **dev = your laptop with hot reload**, **prod = an immutable, optimized build**. Your VPS is production the moment real users or real data touch it.

## Dev vs prod in this repo

| | Dev | Prod |
|---|---|---|
| Compose files | `docker-compose.yml` + `docker-compose.override.yml` (auto-loaded) | `docker-compose.yml` only |
| Build target | `dev` stage | final stage (`runner` / runtime) |
| Source code | bind-mounted from your disk | baked into the image |
| Command | `nest start --watch`, `next dev` | `node dist/main.js`, `node server.js` |
| Dependencies | full, including dev tools | production + no optional Prisma engines |
| Code changes | reflected immediately | require a rebuild |
| `NODE_ENV` | `development` | `production` |
| Runs as | root | non-root (`node` / `nextjs`) |
| Image size | large (hundreds of MB) | small (~180–230 MB) |
| Purpose | fast feedback | stability, security, size |

Both use the same Postgres container and the same `talenta_db_data` volume.

## Your workflow

### 1. Daily development (local)

```bash
docker compose up -d
docker compose logs -f backend frontend
```

Edit files — Nest/Next reload automatically. No rebuild needed for source changes.

Rebuild only when dependencies or the Dockerfile change:

```bash
docker compose up -d --build --renew-anon-volumes
```

`--renew-anon-volumes` is only necessary when `package-lock.json` changes, because `/app/node_modules` is an anonymous volume.

### 2. Test the production build locally

Before touching the VPS:

```bash
docker compose down
docker compose -f docker-compose.yml up -d --build
```

Verify `http://localhost:8090/` and the login flow. Then stop it with:

```bash
docker compose -f docker-compose.yml down
```

This is the exact artifact your VPS will run.

### 3. Deploy to the VPS

On your machine:

```bash
git add .
git commit -m "..."
git push
```

On the VPS:

```bash
ssh user@your-vps
cd /path/to/talenta-app
git pull

# .env must already exist on the VPS with real secrets
docker compose -f docker-compose.yml up -d --build

# check
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs -f backend frontend nginx

# clean old images occasionally
docker image prune -f
```

Always use `-f docker-compose.yml` on the VPS. **Never** run plain `docker compose up` there while `docker-compose.override.yml` exists — it would mount your source and start dev servers in production.

### Rollback

Simplest: check out the previous commit and rebuild.

```bash
git checkout <previous-commit>
docker compose -f docker-compose.yml up -d --build
```

For a more robust setup, tag images with the git SHA in CI. Not necessary yet.

## Important gotchas

**1. Database updates are not automatic.**
`db/init/01_schema.sql` runs **only when the Postgres volume is first created**. If you add a table/column later, nothing happens on the existing VPS database. You need Prisma migrations:

```bash
# local: create a migration
cd backend
npx prisma migrate dev --name add_something
```

Then in production, run `prisma migrate deploy` before the new backend starts. The current runtime image removes the Prisma CLI (`--omit=dev`), so this needs a small dedicated migrate stage/service. I can set that up if you want.

**2. Backups.**
The database is in a named Docker volume. Back it up regularly:

```bash
docker exec talenta_db pg_dump -U "$DB_USER" "$DB_NAME" > backup.sql
```

Do **not** run `docker compose down -v` in production — it deletes the database volume.

**3. Public access.**
Your compose maps nginx to `127.0.0.1:8090`, so it is only reachable **inside the VPS** (e.g. via SSH tunnel). For a public site you need either:

- change it to `0.0.0.0:8090:80` (plus firewall), or
- better: run Caddy/Nginx on the host with a domain and TLS in front of it.

**4. Secrets.**
Keep a separate `.env` on the VPS (copy from `.env.example`, then fill in real values). Never commit it. Use a strong `JWT_SECRET`.

**5. Build needs internet.**
The image build downloads npm packages and Google Fonts. If the VPS can't reach Google Fonts, `next build` will fail; self-hosting the Geist font is the fix.

## Recommendation

Rename `docker-compose.override.yml` → `docker-compose.dev.yml`. Then:

- Local dev: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
- Local/VPS prod: `docker compose up -d --build`

This makes it impossible to accidentally start dev mode on the VPS. Want me to rename it and add a small `Makefile` (or scripts) so `make dev` / `make prod` / `make migrate` are one-liners?
