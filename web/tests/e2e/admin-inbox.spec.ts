import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.enquiry.deleteMany({ where: { organization: { startsWith: "E2E " } } });
  await prisma.contactMessage.deleteMany({ where: { name: { startsWith: "E2E " } } });
  await prisma.$disconnect();
});

test("an enquiry shows as New, moves to In progress and is in the CSV export", async ({ page }) => {
  const e = await prisma.enquiry.create({
    data: {
      organization: "E2E Provincial Testing Board",
      contactPerson: "E2E Officer",
      email: "officer@example.gov.pk",
      service: "Recruitment & screening",
      candidates: 1200,
      timeline: "1–3 months",
      message: "=HYPERLINK(\"http://x\") We need a recruitment test.",
      ipHash: "0".repeat(64),
    },
  });
  await login(page, EDITOR);
  await page.goto("/admin/enquiries");
  await expect(page.getByRole("link", { name: /Enquiries.*new/ })).toBeVisible();
  const row = page.getByRole("row", { name: /E2E Provincial Testing Board/ });
  await expect(row.getByText("New", { exact: true })).toBeVisible();
  await row.getByRole("link", { name: "E2E Provincial Testing Board" }).click();
  await expect(page.getByText("We need a recruitment test.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Reply by email" })).toHaveAttribute("href", /^mailto:officer@example\.gov\.pk\?subject=/);
  await page.getByRole("button", { name: "Mark in progress" }).click();
  await expect(page.getByText("In progress", { exact: true }).first()).toBeVisible();
  expect((await prisma.enquiry.findUniqueOrThrow({ where: { id: e.id } })).status).toBe("IN_PROGRESS");

  const res = await page.request.get("/admin/enquiries/export");
  expect(res.headers()["content-type"]).toContain("text/csv");
  expect(res.headers()["content-disposition"]).toMatch(/attachment; filename="enquiries-\d{4}-\d{2}-\d{2}\.csv"/);
  const csv = await res.text();
  expect(csv).toContain("E2E Provincial Testing Board");
  expect(csv).toContain(`"'=HYPERLINK(""http://x"") We need a recruitment test."`);
  expect(csv).not.toContain("0".repeat(64));
});

test("contact messages appear in their inbox", async ({ page }) => {
  await prisma.contactMessage.create({
    data: { name: "E2E Candidate", email: "candidate@example.com", subject: "Results", message: "When are results out?", ipHash: "1".repeat(64) },
  });
  await login(page, EDITOR);
  await page.goto("/admin/messages");
  await page.getByRole("link", { name: "E2E Candidate" }).click();
  await expect(page.getByText("When are results out?")).toBeVisible();
  await page.getByRole("button", { name: "Mark closed" }).click();
  await expect(page.getByText("Closed", { exact: true }).first()).toBeVisible();
});

test("the export is refused when signed out", async ({ request }) => {
  const res = await request.get("/admin/enquiries/export", { maxRedirects: 0 });
  expect([302, 307, 401]).toContain(res.status());
});
