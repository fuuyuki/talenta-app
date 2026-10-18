# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Accept the build argument from docker-compose
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
COPY prisma ./prisma/

# Generate Prisma client (needs DATABASE_URL)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built application
COPY --from=builder /app/dist ./dist

# Copy the generated Prisma client and node_modules from builder
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
