import { describe, expect, test, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createActionFactory } from "@/lib/admin/action-core";
import { StaleError } from "@/lib/admin/lock";
import type { SessionUser } from "@/lib/auth/credentials";

const editor: SessionUser = { id: 3, name: "Ed", email: "ed@etc.test", role: "EDITOR" };
const admin: SessionUser = { id: 1, name: "Ada", email: "ada@etc.test", role: "ADMIN" };

function setup(user: SessionUser | null = editor) {
  const deps = {
    getUser: vi.fn(async () => user),
    audit: vi.fn(async () => {}),
    revalidateTag: vi.fn(),
    revalidatePath: vi.fn(),
  };
  return { deps, defineAction: createActionFactory(deps) };
}

const schema = z.object({ title: z.string().min(1, "Title is required."), sections: z.array(z.object({ name: z.string().min(1, "Section name is required.") })) });

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError("db", { code, clientVersion: "6", meta });

describe("defineAction", () => {
  test("no session → formError and run is not called", async () => {
    const { defineAction, deps } = setup(null);
    const run = vi.fn();
    const act = defineAction({ permission: "content:write", schema, entity: "Notice", action: "CREATE", tags: ["notices"], run });
    expect(await act({ title: "A", sections: [] })).toEqual({ ok: false, formError: "Your session has expired. Sign in again." });
    expect(run).not.toHaveBeenCalled();
    expect(deps.audit).not.toHaveBeenCalled();
  });

  test("EDITOR on content:delete → permission error", async () => {
    const { defineAction } = setup(editor);
    const act = defineAction({ permission: "content:delete", schema: z.object({ id: z.number() }), entity: "Notice", action: "DELETE", tags: ["notices"], run: vi.fn() });
    expect(await act({ id: 1 })).toEqual({ ok: false, formError: "You don't have permission to do that." });
  });

  test("zod errors come back keyed by dotted path", async () => {
    const { defineAction } = setup();
    const act = defineAction({ permission: "content:write", schema, entity: "Test", action: "UPDATE", tags: ["tests"], run: vi.fn() });
    const r = await act({ title: "", sections: [{ name: "" }] });
    expect(r).toEqual({ ok: false, fieldErrors: { title: "Title is required.", "sections.0.name": "Section name is required." } });
  });

  test("success → audits once, revalidates every tag and path, returns data", async () => {
    const { defineAction, deps } = setup(admin);
    const act = defineAction({
      permission: "content:write",
      schema,
      entity: "Notice",
      action: "CREATE",
      tags: ["notices", "tests"],
      run: async (input, ctx) => ({ id: 42, by: ctx.user.id, title: input.title }),
      entityId: (d) => String(d.id),
      summary: (d) => `Created notice “${d.title}”`,
      paths: () => ["/news", "/"],
    });
    const r = await act({ title: "Hello", sections: [] });
    expect(r).toEqual({ ok: true, data: { id: 42, by: 1, title: "Hello" } });
    expect(deps.audit).toHaveBeenCalledOnce();
    expect(deps.audit).toHaveBeenCalledWith({ userId: 1, action: "CREATE", entity: "Notice", entityId: "42", summary: "Created notice “Hello”" });
    expect(deps.revalidateTag.mock.calls.map((c) => c[0])).toEqual(["notices", "tests"]);
    expect(deps.revalidatePath.mock.calls.map((c) => c[0])).toEqual(["/news", "/"]);
  });

  test("failure → no audit, no revalidate", async () => {
    const { defineAction, deps } = setup();
    const act = defineAction({ permission: "content:write", schema, entity: "Notice", action: "UPDATE", tags: ["notices"], run: async () => { throw new Error("boom"); } });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await act({ title: "A", sections: [] })).toEqual({ ok: false, formError: "Something went wrong. Your changes were not saved." });
    expect(deps.audit).not.toHaveBeenCalled();
    expect(deps.revalidateTag).not.toHaveBeenCalled();
    // logs the entity only, never input values
    expect(JSON.stringify(errSpy.mock.calls)).not.toContain('"A"');
    errSpy.mockRestore();
  });

  test("P2002 on a unique field → field error on that field", async () => {
    const { defineAction } = setup();
    const act = defineAction({ permission: "content:write", schema: z.object({ slug: z.string() }), entity: "Notice", action: "CREATE", tags: ["notices"], run: async () => { throw prismaError("P2002", { target: "Notice_slug_key" }); } });
    expect(await act({ slug: "dup" })).toEqual({ ok: false, fieldErrors: { slug: "This slug is already used." } });
  });

  test("P2003 on delete → still linked message", async () => {
    const { defineAction } = setup(admin);
    const act = defineAction({ permission: "content:delete", schema: z.object({ id: z.number() }), entity: "Test", action: "DELETE", tags: ["tests"], run: async () => { throw prismaError("P2003"); } });
    expect(await act({ id: 1 })).toEqual({ ok: false, formError: "This item is still linked to other content." });
  });

  // Review Focus 3
  test("StaleError → the reload message", async () => {
    const { defineAction } = setup();
    const act = defineAction({ permission: "content:write", schema: z.object({}), entity: "Faq", action: "UPDATE", tags: ["faqs"], run: async () => { throw new StaleError(); } });
    expect(await act({})).toEqual({
      ok: false,
      formError: "Someone else saved this item while you were editing. Reload to see their changes.",
    });
  });
});
