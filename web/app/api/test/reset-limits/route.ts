import { NextResponse } from "next/server";
import { formLimiter, loginLimiter } from "@/lib/rate-limit";
import { testRoutesEnabled } from "@/lib/test-routes";

export const dynamic = "force-dynamic";

/** E2E helper: clears the in-memory rate limiters between tests. */
export async function POST() {
  if (!testRoutesEnabled()) return new NextResponse(null, { status: 404 });
  formLimiter.clear();
  loginLimiter.clear();
  return new NextResponse(null, { status: 204 });
}
