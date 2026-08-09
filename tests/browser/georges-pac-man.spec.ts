import { expect, test } from "@playwright/test";

const admin = {
  username: "zavi-e2e-admin",
  displayName: "Zavi Test Admin",
  password: "zavi-e2e-password-123",
};

async function ensureAdminAndLogin(page: import("@playwright/test").Page) {
  await page.request.post("/api/admin/bootstrap", {
    headers: { authorization: "Bearer zavi-e2e-bootstrap-only" },
    data: admin,
  });
  const login = await page.request.post("/api/auth/sign-in/username", {
    data: { username: admin.username, password: admin.password },
  });
  expect(login.ok()).toBe(true);
}

test.describe("George (Pac) Man player journey", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAndLogin(page);
  });

  test("starts with large on-screen controls without horizontal overflow", async ({ page }) => {
    await page.goto("/games/georges-pac-man");
    await expect(page.getByText(`Playing as ${admin.displayName}`)).toBeVisible();
    const canvas = page.getByRole("img", { name: /George \(Pac\) Man maze/i });
    await expect(canvas).toBeVisible();

    for (const name of ["Move up", "Move left", "Move down", "Move right"]) {
      const box = await page.getByRole("button", { name }).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(64);
      expect(box?.height).toBeGreaterThanOrEqual(64);
    }
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => window.innerWidth),
    );

    await page.getByRole("button", { name: "Move up" }).click();
    await expect(page.locator("#georges-pac-man-status")).toContainText("Clear every pellet");
    await expect(page.getByText("Choose a direction to start!")).toHaveCount(0);
  });

  test("supports keyboard movement on desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.startsWith("mobile"), "Keyboard coverage belongs to the desktop project.");
    await page.goto("/games/georges-pac-man");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#georges-pac-man-status")).toContainText("Clear every pellet");
  });

  test("saves an unfinished run and confirms its leaderboard score", async ({ page }) => {
    await page.route("**/api/games/georges-pac-man/scores", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ scoreId: 73 }),
      });
    });
    await page.goto("/games/georges-pac-man");
    await page.getByRole("button", { name: "Move up" }).click();
    await expect(page.getByRole("button", { name: "End run & save score" })).toBeVisible();
    await page.getByRole("button", { name: "End run & save score" }).click();

    await expect(page.getByRole("heading", { name: "Run finished — your score counts!" })).toBeVisible();
    await expect(page.getByText("Score #73 saved to the leaderboard!")).toBeVisible();
  });

  test("shows a useful migration error and lets the player retry saving", async ({ page }) => {
    await page.route("**/api/games/georges-pac-man/scores", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Game not found." }),
      });
    });
    await page.goto("/games/georges-pac-man");
    await page.getByRole("button", { name: "Move up" }).click();
    await page.getByRole("button", { name: "End run & save score" }).click();

    await expect(page.getByRole("region", { name: "Clear the maze with George Man!" }).getByRole("alert"))
      .toContainText("apply the latest database migration");
    await expect(page.getByRole("button", { name: "Try saving again" })).toBeVisible();
  });
});
