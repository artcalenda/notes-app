FROM oven/bun:1.2 AS builder

WORKDIR /app

COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN bun install

COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/backend
RUN bun run migrate

WORKDIR /app
RUN bun run build

FROM oven/bun:1.2-slim

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/drizzle ./backend/drizzle
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/notes.db
ENV STATIC_DIR=./frontend/dist

EXPOSE 3000

WORKDIR /app/backend
CMD ["sh", "-c", "bun run migrate && bun run dist/index.js"]
