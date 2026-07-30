import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { loadEnv } from "./config/env";
import { createDb } from "./db";
import { runMigrations } from "./db/migrate";
import { NotesRepository } from "./repositories/notes.repository";
import { createNotesRoutes } from "./routes/notes.routes";
import { NotesService } from "./services/notes.service";
import { successResponse } from "./types/api-response";

function startServer() {
  const env = loadEnv();
  const db = createDb(env.DATABASE_PATH);
  const notesService = new NotesService(new NotesRepository(db));

  const app = new Elysia()
    .use(
      cors({
        origin: env.NODE_ENV === "production" ? false : env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      }),
    )
    .get("/health", () => successResponse({ status: "ok" }))
    .use(createNotesRoutes(notesService));

  if (env.STATIC_DIR) {
    app.use(
      staticPlugin({
        assets: env.STATIC_DIR,
        prefix: "/",
      }),
    );

    app.get("/*", ({ request, set }) => {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/notes") || url.pathname === "/health") {
        set.status = 404;
        return { success: false, message: "Not found" };
      }

      set.headers["content-type"] = "text/html; charset=utf-8";
      return Bun.file(`${env.STATIC_DIR}/index.html`);
    });
  }

  const hostname = process.env.HOST ?? "0.0.0.0";

  app.listen({
    hostname,
    port: env.PORT,
  });

  console.log(`Working directory: ${process.cwd()}`);
  console.log(
    `Simple Note API listening on ${hostname}:${env.PORT} (${env.NODE_ENV})`,
  );
  if (env.STATIC_DIR) {
    console.log(`Serving frontend from ${env.STATIC_DIR}`);
  } else {
    console.log("Frontend static files disabled (API-only mode)");
  }
  console.log(`Database: ${env.DATABASE_PATH}`);

  return app;
}

async function main() {
  try {
    await runMigrations();
    startServer();
  } catch (error) {
    console.error("Failed to start Simple Note API:", error);
    process.exit(1);
  }
}

await main();

export type App = ReturnType<typeof startServer>;
