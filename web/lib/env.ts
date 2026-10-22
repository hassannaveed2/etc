import { z } from "zod";

const optional = z.string().trim().min(1).optional();

const schema = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
  SHADOW_DATABASE_URL: optional,
  AUTH_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: optional,
  ADMIN_NAME: optional,
  SPACES_ENDPOINT: optional,
  SPACES_REGION: optional,
  SPACES_BUCKET: optional,
  SPACES_KEY: optional,
  SPACES_SECRET: optional,
  SPACES_CDN_BASE: optional,
  IP_HASH_SALT: z.string().min(1),
  SMTP_HOST: optional,
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: optional,
  SMTP_PASS: optional,
  SMTP_FROM: optional,
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_ENV: z.enum(["development", "staging", "production"]).default("development"),
});

export type Env = z.infer<typeof schema>;

/** Parses raw environment variables. Errors name the variables only, never their values. */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined && v !== ""));
  const result = schema.safeParse(cleaned);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((i) => String(i.path[0])))];
    throw new Error(`Missing or invalid environment variables: ${names.join(", ")}`);
  }
  return result.data;
}

let cached: Env | undefined;

export function getEnv(): Env {
  return (cached ??= parseEnv(process.env));
}
