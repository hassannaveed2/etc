import { expect, type Page } from "@playwright/test";

export type Account = { email: string; password: string };

export const ADMIN: Account = { email: process.env.ADMIN_EMAIL ?? "", password: process.env.ADMIN_PASSWORD ?? "" };
// Test-only editor created by global-setup; the password exists only in this test fixture.
export const EDITOR: Account = { email: "e2e+editor@etc.test", password: "e2e-editor-password-123" };

export async function login(page: Page, who: Account) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(who.email);
  await page.getByLabel("Password").fill(who.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
