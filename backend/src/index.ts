import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { loadEnv } from "./config/env";
import { createDb } from "./db";
import { NotesRepository } from "./repositories/notes.repository";
import { createNotesRoutes } from "./routes/notes.routes";
import { NotesService } from "./services/notes.service";
import { successResponse } from "./types/api-response";

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

app.listen({
  hostname: "0.0.0.0",
  port: env.PORT,
});

console.log(
  `Simple Note API running at http://0.0.0.0:${env.PORT} (${env.NODE_ENV})`,
);

export type App = typeof app;
