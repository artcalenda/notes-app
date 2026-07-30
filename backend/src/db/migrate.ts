import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { loadEnv } from "../config/env";

const backendRoot = resolve(import.meta.dir, "../..");
const migrationsFolder = resolve(backendRoot, "drizzle/migrations");

export async function runMigrations(): Promise<void> {
  const env = loadEnv();
  const dbDir = dirname(env.DATABASE_PATH);

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const sqlite = new Database(env.DATABASE_PATH);
  const db = drizzle(sqlite);

  migrate(db, { migrationsFolder });
  sqlite.close();

  console.log("Migrations applied successfully");
}

if (import.meta.main) {
  await runMigrations();
}
