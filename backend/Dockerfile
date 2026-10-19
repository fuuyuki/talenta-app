# ---- Build stage ----
FROM node:24-alpine AS builder
WORKDIR /app

# A valid URL is required by `prisma generate`, but no connection is made.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Generate the Prisma client, then build NestJS.
RUN npx prisma generate
RUN npm run build

# ---- Production dependencies ----
# The app uses the `pg` driver adapter, so Prisma's native engines and Studio
# are not needed at runtime. Omitting optional packages keeps this tree ~100 MB
# instead of ~350 MB.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --omit=optional --no-audit --no-fund

# ---- Runtime stage ----
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
