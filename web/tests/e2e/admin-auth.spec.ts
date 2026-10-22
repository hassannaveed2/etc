import { test, expect } from "@playwright/test";
import { ADMIN, EDITOR, login } from "./fixtures";

test("anonymous /admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Sign in to ETC Admin" })).toBeVisible();
});

test("admin signs in and sees the dashboard", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
});

test("editor signs in without the admin-only nav", async ({ page }) => {
  await login(page, EDITOR);
  await expect(page.getByRole("navigation", { name: "Admin" }).getByRole("link", { name: "Notices" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
});

test("wrong password shows the generic error", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(EDITOR.email);
  await page.getByLabel("Password").fill("definitely-not-it");
  await page.getByRole("button", { name: "Sign in" }).click();
  // Next.js renders its own route announcer with role=alert, so scope to the form
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Email or password is incorrect, or the account is locked. Try again in 15 minutes.",
  );
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("sign out returns to the login page", async ({ page }) => {
  await login(page, EDITOR);
  await page.locator("summary", { hasText: "Account menu" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
