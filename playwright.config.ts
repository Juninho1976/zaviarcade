import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    env: {
      ADMIN_BOOTSTRAP_TOKEN: "zavi-e2e-bootstrap-only",
      AUTH_SECRET: "zavi-e2e-auth-secret-that-is-at-least-32-characters",
      BETTER_AUTH_URL: "http://127.0.0.1:3000",
      ZAVI_ARCADE_E2E: "1",
    },
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
  ],
});
