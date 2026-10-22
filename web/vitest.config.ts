import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.ts"],
    // web/.env (git-ignored) supplies DATABASE_URL etc. for integration tests; CI sets real env vars instead.
    env: { ...loadEnv(mode, process.cwd(), ""), ...process.env } as Record<string, string>,
    // integration tests share one database; run files one at a time
    fileParallelism: false,
    // the shared cluster is in Singapore; remote round-trips need more than the 5 s default
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
}));
