import { expect, test } from "vitest";
import { computeTosTotals, normalizeTos } from "@/lib/admin/tos";
import { testForm } from "@/lib/validation/admin";
import data from "@/prisma/seed-data/mockup.json";

test("row totals are recomputed from the cells, never trusted", () => {
  expect(computeTosTotals({ levels: ["K", "U"], rows: [{ area: "A", v: [1, 2], total: 99 }] }).rows[0].total).toBe(3);
});

test("form TOS strings become numbers, subtotal checkboxes become booleans, totals are computed", () => {
  expect(
    normalizeTos({ levels: ["K", "U"], rows: [{ area: "A1", v: ["1", "2"], subtotal: "on" }, { area: "A2", v: ["", "4"] }] }),
  ).toEqual({ levels: ["K", "U"], rows: [{ area: "A1", v: [1, 2], total: 3, subtotal: true }, { area: "A2", v: [0, 4], total: 4, subtotal: false }] });
});

test("no rows means no table", () => {
  expect(normalizeTos(undefined)).toBeNull();
  expect(normalizeTos({ levels: ["K"], rows: [] })).toBeNull();
});

test("the USAT seed round-trips through the test form schema", () => {
  const usat = data.tests.find((t) => t.slug === "usat")!;
  const asForm = {
    ...usat,
    fee: String(usat.fee),
    sortOrder: String(usat.sortOrder),
    published: "on",
    categories: usat.categories!.map((c) => ({ ...c, levels: c.levels.map(String) })),
    tos: { levels: usat.tos!.levels, rows: usat.tos!.rows.map((r) => ({ area: r.area, v: r.v.map(String), ...(r.subtotal ? { subtotal: "on" } : {}) })) },
  };
  const r = testForm.safeParse(asForm);
  expect(r.success, JSON.stringify(r.error?.issues?.slice(0, 3))).toBe(true);
  expect(r.data!.tos!.rows.at(-1)!.total).toBe(45);
  expect(r.data!.fee).toBe(2000);
});

test("fee: empty or 'by agreement' means null", () => {
  const base = data.tests[0];
  expect(testForm.parse({ ...base, fee: "", published: "on", categories: undefined, tos: undefined }).fee).toBeNull();
  expect(testForm.parse({ ...base, fee: "2000", feeByAgreement: "on", published: "", categories: undefined, tos: undefined }).fee).toBeNull();
});
