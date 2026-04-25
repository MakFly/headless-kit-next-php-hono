# syntax=docker/dockerfile:1.7
ARG BUN_VERSION=1.2-alpine

FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --production --no-save

FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --no-save
COPY . .
RUN bun run build

FROM oven/bun:${BUN_VERSION} AS runtime
RUN apk add --no-cache curl tini \
    && addgroup -S app \
    && adduser -S app -G app

WORKDIR /app

COPY --from=deps  --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist         ./dist
COPY --chown=app:app drizzle             ./drizzle
COPY --chown=app:app scripts             ./scripts
COPY --chown=app:app drizzle.config.ts package.json tsconfig.json ./
COPY --chown=app:app docker/entrypoint.sh ./docker/entrypoint.sh

RUN chmod +x ./docker/entrypoint.sh \
    && mkdir -p /app/data \
    && chown -R app:app /app/data

USER app

ENV NODE_ENV=production \
    PORT=3333 \
    DATABASE_URL=/app/data/{{PROJECT_NAME}}.db

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:3333/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "./docker/entrypoint.sh"]
CMD ["bun", "run", "dist/index.js"]
