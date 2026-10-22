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

export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/admin") && path !== "/admin/login") return !!auth?.user;
      return true;
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
