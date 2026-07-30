FROM oven/bun:1.2 AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY package.json ./
COPY backend/package.json ./backend/
COPY backend/bun.lock ./backend/
COPY frontend/package.json ./frontend/
COPY frontend/bun.lock ./frontend/

RUN bun install --cwd backend --frozen-lockfile && bun install --cwd frontend --frozen-lockfile

COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app
RUN bun run build

FROM oven/bun:1.2-slim

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/drizzle ./backend/drizzle
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/app/data/notes.db
ENV STATIC_DIR=./frontend/dist

EXPOSE 8080

CMD ["bun", "backend/src/index.ts"]
