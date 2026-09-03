# Production image for the Ishla Next.js app.
FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci || npm install

# --- build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# --- runtime ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts

EXPOSE 3000

# Sync the DB schema (retrying until Postgres is ready), then start the server.
CMD ["sh", "-c", "for i in 1 2 3 4 5 6 7 8 9 10; do npx prisma db push --skip-generate && break; echo 'DB kutilmoqda...'; sleep 3; done && npm run start"]
