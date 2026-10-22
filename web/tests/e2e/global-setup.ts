import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../lib/auth/password";
import { EDITOR } from "./fixtures";

/** Ensures the e2e editor exists (active, EDITOR role, known password). Never touches other users. */
export default async function globalSetup() {
  const prisma = new PrismaClient();
  try {
    const passwordHash = await hashPassword(EDITOR.password);
    await prisma.user.upsert({
      where: { email: EDITOR.email },
      update: { passwordHash, role: "EDITOR", active: true },
      create: { email: EDITOR.email, name: "E2E Editor", role: "EDITOR", passwordHash },
    });
  } finally {
    await prisma.$disconnect();
  }
}
