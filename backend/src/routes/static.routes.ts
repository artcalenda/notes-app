import { existsSync, readdirSync } from "fs";
import { join, normalize, resolve } from "path";
import type { Elysia } from "elysia";

function resolveSafeStaticPath(staticDir: string, requestPath: string): string | null {
  const relative = normalize(requestPath.replace(/^\//, ""));

  if (relative.startsWith("..") || relative.includes("\0")) {
    return null;
  }

  const absolute = resolve(staticDir, relative);
  const normalizedRoot = resolve(staticDir);

  if (!absolute.startsWith(normalizedRoot)) {
    return null;
  }

  if (!existsSync(absolute)) {
    return null;
  }

  return absolute;
}

export function registerStaticRoutes(app: Elysia, staticDir: string) {
  app.get("/assets/*", ({ request, set }) => {
    const pathname = new URL(request.url).pathname;
    const filePath = resolveSafeStaticPath(staticDir, pathname);

    if (!filePath) {
      set.status = 404;
      return { success: false, message: "Not found" };
    }

    return Bun.file(filePath);
  });

  app.get("/*", ({ request, set }) => {
    const pathname = new URL(request.url).pathname;

    if (pathname.startsWith("/notes") || pathname === "/health") {
      set.status = 404;
      return { success: false, message: "Not found" };
    }

    if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
      const filePath = resolveSafeStaticPath(staticDir, pathname);

      if (filePath) {
        return Bun.file(filePath);
      }

      set.status = 404;
      return { success: false, message: "Not found" };
    }

    set.headers["content-type"] = "text/html; charset=utf-8";
    return Bun.file(join(staticDir, "index.html"));
  });
}

export function logStaticDir(staticDir: string) {
  const assetsDir = join(staticDir, "assets");

  if (!existsSync(join(staticDir, "index.html"))) {
    console.warn(`WARNING: ${join(staticDir, "index.html")} not found`);
    return;
  }

  if (!existsSync(assetsDir)) {
    console.warn(`WARNING: ${assetsDir} not found — frontend build may be incomplete`);
    return;
  }

  const assets = readdirSync(assetsDir);
  console.log(`Static assets (${assets.length}): ${assets.join(", ")}`);
}
