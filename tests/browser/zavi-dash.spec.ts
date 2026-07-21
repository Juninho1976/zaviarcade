import { expect, test } from "@playwright/test";

async function startGameWithKeyboard(page: import("@playwright/test").Page) {
  const canvas = page.getByRole("img", { name: /Zavi Dash game canvas/i });
  await canvas.focus();
  await page.keyboard.press("Space");
}

test.describe("Zavi Dash player journey", () => {
  test("starts with keyboard and pointer or touch controls", async ({ page }, testInfo) => {
    await page.goto("/games/zavi-dash?e2e=running");
    await startGameWithKeyboard(page);
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

  test("shows death and supports a quick restart", async ({ page }) => {
    await page.goto("/games/zavi-dash?e2e=death");
    const name = page.getByRole("textbox", { name: "Player name" });
    await name.fill("Zavi");
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await expect(page.getByRole("heading", { name: "Ready for another dash?" })).toBeVisible();
    await page.getByRole("button", { name: "Restart run" }).click();
    await expect(page.locator("#zavi-dash-status")).toContainText("ready");
    await expect(name).toHaveValue("Zavi");
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
    await page.waitForTimeout(1_000);

    await expect(page.locator("#zavi-dash-status")).toContainText("running");
  });

  test("keeps the name above the game, submits a completed run once, and opens the leaderboard", async ({ page }) => {
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
    const name = page.getByRole("textbox", { name: "Player name" });
    const canvas = page.getByRole("img", { name: /Zavi Dash game canvas/i });
    const [nameBox, canvasBox] = await Promise.all([name.boundingBox(), canvas.boundingBox()]);
    expect(nameBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();
    expect(nameBox!.y).toBeLessThan(canvasBox!.y);
    await name.fill("Zavi");
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
    await page.getByRole("textbox", { name: "Player name" }).fill("Zavi");
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await expect(page.getByRole("alert")).toContainText("The score service is unavailable. Please try again.");
    await expect(page.getByRole("button", { name: "Try saving again" })).toBeVisible();
  });
});
