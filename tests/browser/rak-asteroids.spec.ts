import { expect, test } from "@playwright/test";

const admin = { username: "zavi-e2e-admin", displayName: "Zavi Test Admin", password: "zavi-e2e-password-123" };

async function ensureAdminAndLogin(page: import("@playwright/test").Page) {
  await page.request.post("/api/admin/bootstrap", { headers: { authorization: "Bearer zavi-e2e-bootstrap-only" }, data: admin });
  const login = await page.request.post("/api/auth/sign-in/username", { data: { username: admin.username, password: admin.password } });
  expect(login.ok()).toBe(true);
}

test.describe("Rak Asteroids player journey", () => {
  test.beforeEach(async ({ page }) => { await ensureAdminAndLogin(page); });

  test("fits large flight controls without horizontal overflow", async ({ page }) => {
    await page.goto("/games/rak-asteroids");
    await expect(page.getByText(`Playing as ${admin.displayName}`)).toBeVisible();
    await expect(page.getByRole("img", { name: /Rak Asteroids game/i })).toBeVisible();
    for (const name of ["Rotate left", "Thrust", "Rotate right", "Fire laser"]) {
      const box = await page.getByRole("button", { name }).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(64);
    }
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));

    await page.getByRole("button", { name: "Fire laser" }).click();
    await expect(page.locator("#rak-asteroids-status")).toContainText("Clear every asteroid");
  });

  test("saves a deliberately ended run", async ({ page }) => {
    await page.route("**/api/games/rak-asteroids/scores", async (route) => {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ scoreId: 91 }) });
    });
    await page.goto("/games/rak-asteroids");
    await page.getByRole("button", { name: "Fire laser" }).click();
    await page.getByRole("button", { name: "End run & save score" }).click();

    await expect(page.getByRole("heading", { name: "Run finished — your score counts!" })).toBeVisible();
    await expect(page.getByText("Score #91 saved to the leaderboard!")).toBeVisible();
  });

  test("supports keyboard rotation, thrust, and single-shot fire on desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.startsWith("mobile"), "Keyboard coverage belongs to the desktop project.");
    await page.goto("/games/rak-asteroids");
    await page.keyboard.down("ArrowLeft"); await page.waitForTimeout(120); await page.keyboard.up("ArrowLeft");
    await page.keyboard.down("ArrowUp"); await page.waitForTimeout(120); await page.keyboard.up("ArrowUp");
    await page.keyboard.press("Space");
    await expect(page.locator("#rak-asteroids-status")).toContainText("Clear every asteroid");
  });
});
