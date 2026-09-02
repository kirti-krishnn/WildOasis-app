import { expect, test } from "@playwright/test";
import { createUser, deleteUser, loginByUi } from "./helpers.js";

let user;

test.beforeAll(async () => {
  user = await createUser();
});

test.afterAll(async () => {
  if (user) await deleteUser(user);
});

test("redirects protected pages to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Log in to your account" })).toBeVisible();
});

test("logs in, navigates core pages, logs out, and blocks protected pages again", async ({ page }) => {
  await loginByUi(page, user);

  await page.getByRole("link", { name: /cabins/i }).click();
  await expect(page.getByRole("heading", { name: /all cabins/i })).toBeVisible();

  await page.getByRole("link", { name: /bookings/i }).click();
  await expect(page.getByRole("heading", { name: /all bookings/i })).toBeVisible();

  await page.getByRole("link", { name: /settings/i }).click();
  await expect(page.getByRole("heading", { name: /update hotel settings/i })).toBeVisible();

  await page.getByRole("button").last().click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/bookings");
  await expect(page).toHaveURL(/\/login$/);
});
