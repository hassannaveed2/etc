// Creates ETC's own databases on the shared DigitalOcean MySQL cluster.
// The cluster hosts ~45 other projects: this script only ever creates the names below and never drops anything.
// Usage (from web/): node --env-file=../.env.local scripts/create-databases.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ALLOWED = ["ETCStaging", "ETCShadow"];

export function createStatement(name) {
  if (!ALLOWED.includes(name)) throw new Error(`Refusing to create database outside the ETC allow-list: ${name}`);
  return `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
}

async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD) throw new Error("DB_HOST, DB_USER and DB_PASSWORD are required");
  const mysql = (await import("mysql2/promise")).default;
  const here = path.dirname(fileURLToPath(import.meta.url));
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT || 25060),
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: { ca: readFileSync(path.join(here, "../prisma/certs/ca-certificate.crt"), "utf8"), rejectUnauthorized: true },
  });
  try {
    for (const name of ALLOWED) {
      await conn.query(createStatement(name));
      console.log(`${name} ok`);
    }
  } finally {
    await conn.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
