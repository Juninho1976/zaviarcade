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
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await expect(page.getByRole("heading", { name: "Ready for another dash?" })).toBeVisible();
    await page.getByRole("button", { name: "Restart run" }).click();
    await expect(page.locator("#zavi-dash-status")).toContainText("ready");
  });

  test("survives a visible near-miss beside a triangular spire", async ({ page }) => {
    await page.goto("/games/zavi-dash?e2e=spire-near-miss");
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await page.waitForTimeout(1_200);
    await expect(page.locator("#zavi-dash-status")).toContainText("running");
  });

  test("completes a run, submits once, and opens the leaderboard", async ({ page }) => {
    await page.route("**/api/games/zavi-dash/scores", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ scoreId: 42 }),
      });
    });
    await page.goto("/games/zavi-dash?e2e=complete");
    await page.getByRole("img", { name: /Zavi Dash game canvas/i }).click();

    await expect(page.getByRole("heading", { name: "You reached the finish!" })).toBeVisible();
    await page.getByLabel("Player name").fill("Zavi");
    await page.getByRole("button", { name: "Save score" }).click();
    await expect(page.getByText("Score #42 saved.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Score saved" })).toBeDisabled();
    await page.getByRole("link", { name: "View the leaderboard" }).click();
    await expect(page).toHaveURL("/games/zavi-dash/leaderboard");
    await expect(page.getByRole("heading", { name: "Zavi Dash" })).toBeVisible();
  });
});
