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

# Remove dev + optional packages from the tree we already installed.
# This avoids a second, network-heavy `npm ci` in a separate stage.
RUN npm prune --omit=dev --omit=optional --offline --no-audit --no-fund \
  && npm cache clean --force

# ---- Development stage (used by docker-compose.override.yml) ----
FROM node:24-alpine AS dev
WORKDIR /app

ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx prisma generate

CMD ["npm", "run", "start:dev"]

# ---- Runtime stage ----
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
