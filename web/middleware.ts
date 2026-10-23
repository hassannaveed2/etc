import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { authConfig, needsSignIn } from "./auth.config";
import { buildCsp, securityHeaders } from "@/lib/csp";

const { auth } = NextAuth(authConfig);

const policy = (nonce: string) => buildCsp(nonce, { dev: process.env.NODE_ENV !== "production" });

function secure(res: NextResponse, csp: string): NextResponse {
  res.headers.set("Content-Security-Policy", csp);
  for (const [k, v] of Object.entries(securityHeaders())) res.headers.set(k, v);
  return res;
}

/** Fresh nonce per request, passed to rendering via request headers (Next applies it to its own scripts). */
function next(req: NextRequest): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  const csp = policy(nonce);
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  return secure(NextResponse.next({ request: { headers } }), csp);
}

// Auth.js still runs a custom handler when `authorized` says no, so the admin guard redirects here itself.
const admin = auth((req) => {
  if (needsSignIn(req.nextUrl.pathname) && !req.auth?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return secure(NextResponse.redirect(url), policy(btoa(crypto.randomUUID())));
  }
  return next(req);
});

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const path = req.nextUrl.pathname;
  return path === "/admin" || path.startsWith("/admin/") ? admin(req, ev as never) : next(req);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
