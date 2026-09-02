import { expect, test } from "@playwright/test";
import { getAdminCredentials, loginByUi } from "./helpers.js";

const admin = getAdminCredentials();

test.skip(!admin, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin E2E tests.");

test("admin can open create cabin and create booking flows", async ({ page }) => {
  await loginByUi(page, admin);

  await page.goto("/cabins");
  await expect(page.getByRole("button", { name: "Add Cabin" })).toBeEnabled();
  await page.getByRole("button", { name: "Add Cabin" }).click();
  await expect(page.getByPlaceholder("Cabin Name")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/bookings");
  await expect(page.getByRole("button", { name: "Add booking" })).toBeEnabled();
  await page.getByRole("button", { name: "Add booking" }).click();
  await expect(page.getByText("Cabin")).toBeVisible();
});
