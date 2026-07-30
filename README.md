# Simple Note

Production-ready note-taking app with a Bun + Elysia API, React frontend, SQLite persistence, autosave, search, and Markdown preview.

## Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Bun, Elysia, TypeScript, SQLite, Drizzle ORM |
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Query |

## Features

- CRUD notes with title and content
- Autosave while editing
- Full-text search across title and content
- Markdown preview
- Responsive layout (mobile sidebar + editor)
- Toast notifications
- Loading and error states

## Requirements

- [Bun](https://bun.sh) 1.2 or newer

## Project structure

```
.
├── backend/                 # Elysia API + Drizzle ORM
│   ├── src/
│   │   ├── config/          # Environment validation
│   │   ├── db/              # Schema, client, migrations runner
│   │   ├── repositories/    # Data access
│   │   ├── routes/          # HTTP routes
│   │   ├── services/        # Business logic
│   │   └── types/           # Shared types
│   └── drizzle/migrations/  # SQLite migrations
├── frontend/                # React SPA
│   └── src/
│       ├── api/             # REST client
│       ├── components/      # UI + feature components
│       └── hooks/           # React Query + autosave
├── Dockerfile
└── package.json             # Workspace scripts
```

## Local development

1. Install dependencies:

```bash
bun install && bun run install:all
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Run database migrations:

```bash
bun run migrate
```

4. Start backend and frontend together:

```bash
bun run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000

The Vite dev server proxies `/notes` and `/health` to the backend.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API server port |
| `DATABASE_PATH` | `./data/notes.db` | SQLite database file |
| `NODE_ENV` | `development` | Runtime mode |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin in development |
| `STATIC_DIR` | — | Serve built frontend (production) |
| `VITE_API_URL` | `` | Frontend API base URL (empty = same origin) |

## Scripts

### Root

| Command | Description |
|---------|-------------|
| `bun run dev` | Start backend + frontend in watch mode |
| `bun run dev:backend` | Backend only |
| `bun run dev:frontend` | Frontend only |
| `bun run build` | Build frontend and backend |
| `bun run start` | Run production server (migrates DB first) |
| `bun run migrate` | Apply pending migrations |
| `bun run typecheck` | Type-check both packages |

### Backend

| Command | Description |
|---------|-------------|
| `dev` | Start API in watch mode |
| `build` | Bundle API for production |
| `start` | Migrate DB and start server |
| `migrate` | Apply pending migrations |

### Frontend

| Command | Description |
|---------|-------------|
| `dev` | Start Vite dev server |
| `build` | Type-check and build for production |
| `preview` | Preview production build |

## REST API

All responses use a consistent envelope:

```json
{ "success": true, "data": ... }
{ "success": false, "message": "..." }
```

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/notes` | List notes (`?search=` optional) |
| GET | `/notes/:id` | Get one note |
| POST | `/notes` | Create note |
| PUT | `/notes/:id` | Update note |
| DELETE | `/notes/:id` | Delete note |

### Examples

```bash
curl http://localhost:3000/health

curl http://localhost:3000/notes

curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"# Markdown note"}'

curl -X PUT http://localhost:3000/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","content":"New body"}'

curl -X DELETE http://localhost:3000/notes/1
```

## Production build

```bash
bun run install:all
bun run migrate
bun run build
STATIC_DIR=./frontend/dist NODE_ENV=production bun run start
```

The backend serves the built React app from `STATIC_DIR` and handles SPA routing.

## Docker

Build and run:

```bash
docker build -t simple-note .
docker run -p 3000:3000 -v notes-data:/app/data simple-note
```

Open http://localhost:3000

## Deploy on Hostman (Bun)

1. Push this repository to GitHub.
2. In the [Hostman](https://hostman.com) dashboard, create a new app and connect the repo.

### Full-stack deployment (API + React UI)

Deploy from the **repository root**. Leave **Project directory path** empty.

| Setting | Value |
|---------|-------|
| Runtime | Bun |
| Project directory path | *(leave empty)* |
| Install command | `bun run install:all` |
| Build command | `bun run build` |
| Start command | `STATIC_DIR=./frontend/dist NODE_ENV=production bun run start` |
| Port | `PORT` (platform-provided) |
| Health check path | `/health` |

Do **not** run `bun install` alone at the repo root. The root lockfile is for local dev tools only (`concurrently`). Backend and frontend each have their own `bun.lock` under `backend/` and `frontend/`.

### API-only deployment (recommended if Hostman reports workspace errors)

Point Hostman at the backend package directly. This app uses **Elysia** (not NestJS), but the same Hostman settings apply.

| Setting | Value |
|---------|-------|
| Project directory path | `backend` |
| Install command | `bun install --frozen-lockfile` |
| Build command | `bun run build` |
| Start command | `NODE_ENV=production bun run start` |
| Health check path | `/health` |

With **Project directory path** set to `backend`, Hostman reads `backend/package.json` and `backend/bun.lock` only. No workspace resolution happens at the repo root.

**Wrong (causes "Workspace not found backend/frontend"):**

- Project directory path: `backend` + Install command: `bun install` at repo root
- Root `package.json` with `"workspaces": ["backend", "frontend"]` (removed in this repo)
- Root `bun.lock` that links `backend@workspace:backend` (regenerated — use per-package lockfiles)

4. **System dependencies** (required for a successful install/build):

   In **App settings → Dependencies** (also labeled **System Dependencies** on some screens), add:

   ```
   python3 python3-dev gcc g++ make
   ```

   Hostman passes these packages to `apt install` before `bun install`. Python and a C/C++ toolchain are needed when optional native addons are compiled during dependency installation. Use `python3` on current images; only use `python` if your image documents that alias explicitly.

   If builds still fail with compiler errors, you can use the meta-package instead:

   ```
   python3 python3-dev build-essential
   ```

   (`build-essential` includes `gcc`, `g++`, and `make`.)

5. Save settings and **trigger a new deployment** so the updated system packages are installed before the next `bun install`.

6. Optional environment variables:

```
NODE_ENV=production
DATABASE_PATH=./data/notes.db
STATIC_DIR=./frontend/dist
```

7. Attach persistent storage to `/app/data` so SQLite data survives redeploys.

8. Verify deployment:

```bash
curl https://YOUR-DOMAIN.hostman.site/health
```

## License

MIT
