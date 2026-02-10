FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy ONLY package files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# This layer is cached unless package.json or pnpm-lock.yaml changes
RUN pnpm install --frozen-lockfile

# Copy source files (this invalidates cache only for build step)
COPY . .

RUN pnpm run export:full

# ============================================
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

RUN echo '{"name":"sakina-quran","private":true}' > package.json

RUN pnpm add expo@54.0.30 sql.js@^1.13.0 --ignore-scripts \
    && pnpm store prune \
    && rm -rf /root/.local/share/pnpm/store

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/assets/quran.db ./assets/quran.db

EXPOSE 3000

CMD ["pnpm", "exec", "expo", "serve", "dist", "--port", "3000"]