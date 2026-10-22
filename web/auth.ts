import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";
import { verifyCredentials, type CredentialDeps } from "@/lib/auth/credentials";
import { loginLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { writeAudit } from "@/lib/admin/audit";

const deps: CredentialDeps = {
  findUser: (email) => prisma.user.findUnique({ where: { email } }),
  async onSuccess(user) {
    // Raw update so signing in doesn't bump updatedAt — the user's lock version for admins editing the account.
    await prisma.$executeRaw`UPDATE \`User\` SET \`lastLoginAt\` = NOW(3) WHERE \`id\` = ${user.id}`;
    await writeAudit({ userId: user.id, action: "LOGIN", entity: "User", entityId: String(user.id), summary: `Signed in: ${user.email}` });
  },
  limiter: loginLimiter,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const user = await verifyCredentials(
          { email: String(credentials?.email ?? ""), password: String(credentials?.password ?? ""), ip: getClientIp(request.headers) },
          deps,
        );
        return user ? { id: String(user.id), name: user.name, email: user.email, role: user.role } : null;
      },
    }),
  ],
});
