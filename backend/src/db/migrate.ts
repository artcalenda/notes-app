import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { loadEnv } from "../config/env";

const env = loadEnv();

const dbDir = env.DATABASE_PATH.replace(/[/\\][^/\\]+$/, "");
if (dbDir && dbDir !== env.DATABASE_PATH) {
  await Bun.$`mkdir -p ${dbDir}`.quiet();
}

const sqlite = new Database(env.DATABASE_PATH);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "./drizzle/migrations" });

console.log("Migrations applied successfully");
