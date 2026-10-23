// Edge-safe Auth.js config, shared by middleware.ts and auth.ts. No Node-only imports here.
import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
  }
  interface Session {
    user: { id: string; name: string; email: string; role: Role };
  }
}

/** Every /admin/** page except the sign-in page needs a session. */
export function needsSignIn(path: string): boolean {
  return (path === "/admin" || path.startsWith("/admin/")) && path !== "/admin/login";
}

export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      return !needsSignIn(request.nextUrl.pathname) || !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.uid);
      session.user.role = token.role as Role;
      return session;
    },
  },
} satisfies NextAuthConfig;
