import { existsSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

const repoRoot = resolve(import.meta.dir, "../../..");
const backendRoot = resolve(import.meta.dir, "../..");

function resolveStaticDir(value: string | undefined): string | undefined {
  const candidates = [
    ...(value
      ? [value.startsWith("/") ? value : resolve(repoRoot, value)]
      : []),
    resolve(repoRoot, "frontend/dist"),
    resolve(backendRoot, "../frontend/dist"),
    ...(value
      ? [value.startsWith("/") ? value : resolve(process.cwd(), value)]
      : []),
    resolve(process.cwd(), "frontend/dist"),
    resolve(process.cwd(), "../frontend/dist"),
  ];

  const seen = new Set<string>();

  for (const candidate of candidates) {
    const normalized = resolve(candidate);
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);

    if (existsSync(resolve(normalized, "index.html"))) {
      return normalized;
    }
  }

  return undefined;
}

const envSchema = z.object({
  PORT: z.preprocess(
    (value) => {
      const raw = value ?? process.env.PORT;
      if (raw === undefined || raw === "") {
        return 8080;
      }
      const parsed = Number(raw);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 8080;
    },
    z.number().int().positive(),
  ),
  DATABASE_PATH: z
    .string()
    .default("./data/notes.db")
    .transform((value) =>
      value.startsWith("/") ? value : resolve(process.cwd(), value),
    ),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  STATIC_DIR: z
    .string()
    .optional()
    .transform((value) => resolveStaticDir(value)),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  return envSchema.parse(process.env);
}
