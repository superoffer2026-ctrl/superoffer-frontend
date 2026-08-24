# syntax=docker/dockerfile:1

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runtime ──────────────────────────────────────────────────────────────────
# `output: 'standalone'` in next.config.ts emits a self-contained server bundle,
# so the image carries only what the app actually imports.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=4200 HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Owned by the runtime user: runtime-config.sh writes config.js into this
# directory at start-up, and cannot if it belongs to root.
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs runtime-config.sh ./runtime-config.sh
RUN chmod +x ./runtime-config.sh

USER nextjs
EXPOSE 4200

# runtime-config.sh writes public/config.js so the API URL is set per environment
# rather than baked into the build.
ENTRYPOINT ["/bin/sh", "-c", "./runtime-config.sh && node server.js"]
