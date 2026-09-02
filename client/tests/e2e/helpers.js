/* global process */
import { expect, request } from "@playwright/test";

const configuredApiBaseURL = process.env.E2E_API_URL || "http://127.0.0.1:5000/api/v1";
export const apiBaseURL = configuredApiBaseURL.endsWith("/")
  ? configuredApiBaseURL
  : `${configuredApiBaseURL}/`;
export const userPassword = "Test1234!";

export function uniqueEmail(prefix = "e2e") {
  return `${prefix}+${Date.now()}-${Math.random().toString(36).slice(2)}@wildoasis.local`;
}

export async function createApiContext() {
  return request.newContext({
    baseURL: apiBaseURL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });
}

export async function createUser({ name = "E2E User", email = uniqueEmail(), password = userPassword } = {}) {
  const api = await createApiContext();
  const response = await api.post("users/signup", {
    data: {
      name,
      email,
      password,
      passwordConfirm: password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Unable to create E2E user: ${response.status()} ${await response.text()}`);
  }
  await api.dispose();

  return { email, password };
}

export async function deleteUser({ email, password }) {
  const api = await createApiContext();
  const loginResponse = await api.post("users/login", {
    data: { email, password },
  });

  if (loginResponse.ok()) {
    await api.delete("users/deleteMe");
  }

  await api.dispose();
}

export async function loginByUi(page, { email, password }) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

export function getAdminCredentials() {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  return email && password ? { email, password } : null;
}
