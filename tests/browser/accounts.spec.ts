import { expect, test } from "@playwright/test";

const admin = {
  username: "zavi-e2e-admin",
  displayName: "Zavi Test Admin",
  password: "zavi-e2e-password-123",
};

async function bootstrap(page: import("@playwright/test").Page) {
  await page.request.post("/api/admin/bootstrap", {
    headers: { authorization: "Bearer zavi-e2e-bootstrap-only" },
    data: admin,
  });
}

test.describe("central player accounts", () => {
  test("administrator creates a player and the authenticated game uses that identity", async ({ page }, testInfo) => {
    await bootstrap(page);
    await page.goto("/login?returnTo=/admin/players");
    await page.waitForLoadState("networkidle");
    if (testInfo.project.name === "desktop-chromium") {
      await page.screenshot({ fullPage: true, path: "docs/screenshots/account-login.png" });
    }
    await page.getByLabel("Username").fill(admin.username);
    await page.getByLabel("Password").fill(admin.password);
    await page.getByRole("button", { name: "Log in and play" }).click();
    await expect(page).toHaveURL("/admin/players");

    const project = testInfo.project.name.startsWith("mobile") ? "m" : "d";
    const username = `player-${project}-${crypto.randomUUID().slice(0, 10)}`;
    await page.getByLabel("Username", { exact: true }).first().fill(username);
    await page.getByLabel("Public display name", { exact: true }).first().fill("Shared Star");
    await page.getByRole("button", { name: "Create player account" }).click();
    await expect(page.getByText("Copy this temporary password now")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Shared Star" }).last()).toBeVisible();
    const temporaryPassword = (await page.locator(".select-all").textContent())?.trim();
    expect(temporaryPassword).toBeTruthy();
    if (testInfo.project.name === "desktop-chromium") {
      await page.locator(".select-all").evaluate((element) => {
        element.textContent = "Temporary password shown once (hidden in screenshot)";
      });
      await page.screenshot({ fullPage: true, path: "docs/screenshots/admin-player-created.png" });
    }

    if (testInfo.project.name.startsWith("mobile")) {
      await page.getByText("Menu", { exact: true }).click();
    }
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/login?returnTo=/games/zavi-dash");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(temporaryPassword!);
    await page.getByRole("button", { name: "Log in and play" }).click();
    await expect(page).toHaveURL(/\/account\/change-password/);
    const newPassword = `new-${crypto.randomUUID()}!`;
    await page.getByLabel("Temporary password").fill(temporaryPassword!);
    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel("Type it again").fill(newPassword);
    await page.getByRole("button", { name: "Save password and continue" }).click();

    await expect(page).toHaveURL("/games/zavi-dash");
    await expect(page.getByText("Playing as Shared Star")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Player name" })).toHaveCount(0);
    if (testInfo.project.name === "desktop-chromium") {
      await page.screenshot({ fullPage: true, path: "docs/screenshots/authenticated-zavi-dash.png" });
    }
  });
});
