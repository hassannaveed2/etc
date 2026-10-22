import { expect, test } from "vitest";
import { adminAccessProblem } from "@/lib/admin/users";
import { userForm } from "@/lib/validation/admin";

const admin = { id: 1, role: "ADMIN" as const, active: true };

test("you can't remove your own admin access", () => {
  expect(adminAccessProblem({ actorId: 1, target: admin, next: { role: "EDITOR", active: true }, otherActiveAdmins: 3 })).toBe(
    "You can't remove your own admin access.",
  );
  expect(adminAccessProblem({ actorId: 1, target: admin, next: { role: "ADMIN", active: false }, otherActiveAdmins: 3 })).toBe(
    "You can't remove your own admin access.",
  );
});

test("the last active admin can't be demoted or deactivated", () => {
  expect(adminAccessProblem({ actorId: 2, target: admin, next: { role: "EDITOR", active: true }, otherActiveAdmins: 0 })).toBe(
    "At least one active admin is required.",
  );
});

test("ordinary changes are allowed", () => {
  expect(adminAccessProblem({ actorId: 2, target: admin, next: { role: "EDITOR", active: true }, otherActiveAdmins: 1 })).toBeNull();
  expect(adminAccessProblem({ actorId: 1, target: { id: 5, role: "EDITOR", active: true }, next: { role: "EDITOR", active: false }, otherActiveAdmins: 0 })).toBeNull();
  expect(adminAccessProblem({ actorId: 1, target: admin, next: { role: "ADMIN", active: true }, otherActiveAdmins: 0 })).toBeNull();
});

test("new users need a 12-character password; existing users may leave it empty", () => {
  const base = { name: "Sana", email: "Sana@ETC.test ", role: "EDITOR" };
  expect(userForm.safeParse({ ...base, password: "short" }).error!.issues[0].message).toBe("Use at least 12 characters.");
  expect(userForm.safeParse({ ...base, password: "" }).error!.issues[0].message).toBe("Set a password of at least 12 characters.");
  expect(userForm.parse({ ...base, id: "4", password: "" }).password).toBeUndefined();
  expect(userForm.parse({ ...base, password: "long-enough-pass" }).email).toBe("sana@etc.test");
});
