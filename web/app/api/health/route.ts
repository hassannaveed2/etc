import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { version } from "@/package.json";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** Uptime probe: the app is up and the database answers SELECT 1 within 2 s. */
export async function GET() {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
    ]);
    return NextResponse.json({ ok: true, db: "up", version: process.env.APP_VERSION ?? version }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503, headers: NO_STORE });
  }
}
