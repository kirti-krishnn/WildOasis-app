/* global process */
import { defineConfig, devices } from "@playwright/test";

const clientPort = Number(process.env.E2E_CLIENT_PORT || 5173);
const serverPort = Number(process.env.E2E_SERVER_PORT || 5000);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  workers: 1,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  use: {
    baseURL: `http://127.0.0.1:${clientPort}`,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm.cmd run dev",
      cwd: "../server",
      env: {
        ...process.env,
        DISABLE_RATE_LIMIT: "true",
      },
      url: `http://127.0.0.1:${serverPort}/api/v1/health`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "npm.cmd run dev -- --host 127.0.0.1",
      url: `http://127.0.0.1:${clientPort}`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
