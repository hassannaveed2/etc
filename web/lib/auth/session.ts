import "server-only";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { can, type Permission } from "@/lib/rbac";
import type { SessionUser } from "./credentials";

/** The signed-in user, re-read from the database so deactivation and role changes apply immediately. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/** For admin pages: redirects to login when signed out, renders the 403 page when the role lacks `p`. */
export async function requireUser(p?: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (p && !can(user.role, p)) forbidden();
  return user;
}
