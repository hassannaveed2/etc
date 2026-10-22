import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Guards /admin/** (except /admin/login) via the authorized callback. Task 27 adds CSP and security headers.
export default NextAuth(authConfig).auth;

export const config = { matcher: ["/admin/:path*"] };
