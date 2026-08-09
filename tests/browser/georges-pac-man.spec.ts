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

test.describe("Georges Pac Man player journey", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAndLogin(page);
  });

  test("starts with large on-screen controls without horizontal overflow", async ({ page }) => {
    await page.goto("/games/georges-pac-man");
    await expect(page.getByText(`Playing as ${admin.displayName}`)).toBeVisible();
    const canvas = page.getByRole("img", { name: /Georges Pac Man maze/i });
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
});
