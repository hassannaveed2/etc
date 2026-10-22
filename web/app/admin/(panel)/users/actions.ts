"use server";

import { defineAction, UserFacingError } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { adminAccessProblem } from "@/lib/admin/users";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { userForm } from "@/lib/validation/admin";

/** Admin only. Creates or updates a user; passwords are only changed when a new one is typed. */
export const saveUser = defineAction({
  permission: "users:manage",
  schema: userForm,
  entity: "User",
  action: (i) => (i.id ? "UPDATE" : "CREATE"),
  tags: [],
  async run(input, { user }): Promise<SaveData & { email: string }> {
    const passwordHash = input.password ? await hashPassword(input.password) : undefined;
    if (input.id) {
      const target = await prisma.user.findUniqueOrThrow({ where: { id: input.id } });
      const otherActiveAdmins = await prisma.user.count({ where: { role: "ADMIN", active: true, NOT: { id: input.id } } });
      const problem = adminAccessProblem({ actorId: user.id, target, next: { role: input.role, active: input.active }, otherActiveAdmins });
      if (problem) throw new UserFacingError(problem);
      await updateLocked(prisma.user, input.id, input.updatedAt, {
        name: input.name,
        email: input.email,
        role: input.role,
        active: input.active,
        ...(passwordHash ? { passwordHash } : {}),
      });
      const after = await prisma.user.findUniqueOrThrow({ where: { id: input.id }, select: { updatedAt: true } });
      return { id: input.id, email: input.email, updatedAt: after.updatedAt.toISOString() };
    }
    const u = await prisma.user.create({
      data: { name: input.name, email: input.email, role: input.role, active: input.active, passwordHash: passwordHash! },
    });
    return { id: u.id, email: u.email, redirect: `/admin/users/${u.id}?saved=1`, updatedAt: u.updatedAt.toISOString() };
  },
  entityId: (d) => String(d.id),
  // never log passwords; the email identifies the account
  summary: (d, i) => `${i.id ? "Updated" : "Created"} user ${d.email}${i.password ? " (password set)" : ""}`,
});
