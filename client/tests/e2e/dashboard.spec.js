import { expect, test } from "@playwright/test";
import { createUser, deleteUser, loginByUi } from "./helpers.js";

let user;

test.beforeAll(async () => {
  user = await createUser();
});

test.afterAll(async () => {
  if (user) await deleteUser(user);
});

test("loads dashboard stats, today activity, duration chart, and sales chart", async ({ page }) => {
  await loginByUi(page, user);

  await expect(page.locator("p").filter({ hasText: /^Bookings$/ })).toBeVisible();
  await expect(page.locator("p").filter({ hasText: /^Sales$/ })).toBeVisible();
  await expect(page.locator("p").filter({ hasText: /^Check-ins$/ })).toBeVisible();
  await expect(page.locator("p").filter({ hasText: /^Occupancy rate$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today's activity" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stay duration summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /sales from/i })).toBeVisible();

  await page.getByRole("button", { name: "Last 90 days" }).click();
  await expect(page.getByRole("button", { name: "Last 90 days" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /sales from/i })).toBeVisible();
});

test("deactivates write controls for normal user role", async ({ page }) => {
  await loginByUi(page, user);

  await page.goto("/cabins");
  await expect(page.getByRole("button", { name: "Add Cabin" })).toBeDisabled();

  await page.goto("/bookings");
  await expect(page.getByRole("button", { name: "Add booking" })).toBeDisabled();

  await page.goto("/settings");
  await expect(page.locator("#minimumNights")).toBeDisabled();
});
