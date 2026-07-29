import { existsSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

function resolveStaticDir(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("/")) {
    return value;
  }

  const candidates = [
    resolve(process.cwd(), value),
    resolve(process.cwd(), "../frontend/dist"),
    resolve(process.cwd(), "frontend/dist"),
  ];

  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, "index.html"))) {
      return candidate;
    }
  }

  return resolve(process.cwd(), value);
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
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
