import { expect, test } from "@playwright/test";

const admin = {
  username: "zavi-e2e-admin",
  displayName: "Zavi Test Admin",
  password: "zavi-e2e-password-123",
};

async function ensureAdminAndLogin(page: import("@playwright/test").Page) {
  const bootstrap = await page.request.post("/api/admin/bootstrap", {
    headers: { authorization: "Bearer zavi-e2e-bootstrap-only" },
    data: admin,
  });
  const login = await page.request.post("/api/auth/sign-in/username", {
    data: { username: admin.username, password: admin.password },
  });
  expect(login.ok(), `bootstrap ${bootstrap.status()}: ${await bootstrap.text()}; login ${login.status()}: ${await login.text()}`).toBe(true);
}

test.describe("Zavi Dash player journey", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAndLogin(page);
  });

  test("requires central login and returns to the selected game", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/games/zavi-dash?e2e=running");
    await expect(page).toHaveURL(/\/login\?returnTo=/);
    await page.getByLabel("Username").fill(admin.username);
    await page.getByLabel("Password").fill(admin.password);
    await page.getByRole("button", { name: "Log in and play" }).click();
    await expect(page).toHaveURL("/games/zavi-dash");
    await expect(page.getByText(`Playing as ${admin.displayName}`)).toBeVisible();
  });

  test("starts with keyboard and pointer or touch controls", async ({ page }, testInfo) => {
    await page.goto("/games/zavi-dash?e2e=running");
    await page.getByRole("heading", { name: "Zavi Dash" }).click();
    await page.keyboard.press("Space");
    await expect(page.locator("#zavi-dash-status")).toContainText("running");

    await page.goto("/games/zavi-dash?e2e=running");
    const canvas = page.getByRole("img", { name: /Zavi Dash game canvas/i });
    if (testInfo.project.name === "mobile-chromium") {
      await canvas.tap();
    } else {
      await canvas.click();
    }
    await expect(page.locator("#zavi-dash-status")).toContainText("running");
  });

  test("saves the score after death and supports a quick restart", async ({ page }) => {
    let submissions = 0;
    await page.route("**/api/games/zavi-dash/scores", async (route) => {
      submissions += 1;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ scoreId: 24 }),
      });
    });
    await page.goto("/games/zavi-dash?e2e=death");
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await expect(page.getByRole("heading", { name: "Ready for another dash?" })).toBeVisible();
    await expect(page.getByText("Score #24 saved.")).toBeVisible();
    await expect.poll(() => submissions).toBe(1);
    await page.getByRole("button", { name: "Restart run" }).click();
    await expect(page.locator("#zavi-dash-status")).toContainText("ready");
    await expect(page.getByText(`Playing as ${admin.displayName}`)).toBeVisible();
  });

  test("keeps the account identity after a page refresh", async ({ page }) => {
    await page.goto("/games/zavi-dash?e2e=running");
    await page.reload();
    await expect(page.getByText(`Playing as ${admin.displayName}`)).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Player name" })).toHaveCount(0);
  });

  test("survives a visible near-miss beside a triangular spire", async ({ page }) => {
    await page.goto("/games/zavi-dash?e2e=spire-near-miss");
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await page.waitForTimeout(1_200);
    await expect(page.locator("#zavi-dash-status")).toContainText("running");
  });

  test("clears the opening spike and reduced introductory cube with reasonable timing", async ({ page }) => {
    await page.goto("/games/zavi-dash?e2e=opening-section");
    const canvas = page.getByRole("img", { name: /Zavi Dash game canvas/i });
    await canvas.click();

    await page.waitForTimeout(1_500);
    await canvas.click();
    await page.waitForTimeout(1_450);
    await canvas.click();
    await page.waitForTimeout(650);

    await expect(page.locator("#zavi-dash-status")).toContainText("running");
  });

  test("shows account identity, submits a completed run once, and opens the leaderboard", async ({ page }) => {
    let submissions = 0;
    await page.route("**/api/games/zavi-dash/scores", async (route) => {
      submissions += 1;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ scoreId: 42 }),
      });
    });
    await page.goto("/games/zavi-dash?e2e=complete");
    const canvas = page.getByRole("img", { name: /Zavi Dash game canvas/i });
    await expect(page.getByText(`Playing as ${admin.displayName}`)).toBeVisible();
    await canvas.click();

    await expect(page.getByRole("heading", { name: "You reached the finish!" })).toBeVisible();
    await expect(page.getByText("Score #42 saved.")).toBeVisible();
    await expect.poll(() => submissions).toBe(1);
    await page.getByRole("link", { name: "View the leaderboard" }).click();
    await expect(page).toHaveURL("/games/zavi-dash/leaderboard");
    await expect(page.getByRole("heading", { name: "Zavi Dash" })).toBeVisible();
  });

  test("shows a submission failure instead of silently losing a completed score", async ({ page }) => {
    await page.route("**/api/games/zavi-dash/scores", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "The score service is unavailable. Please try again." }),
      });
    });
    await page.goto("/games/zavi-dash?e2e=complete");
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: "The score service is unavailable" }))
      .toContainText("The score service is unavailable. Please try again.");
    await expect(page.getByRole("button", { name: "Try saving again" })).toBeVisible();
  });
});
