import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteNavigation } from "./site-navigation";

vi.mock("@/features/auth/server/session", () => ({
  getAuthenticatedPlayer: vi.fn().mockResolvedValue(null),
}));

describe("SiteNavigation", () => {
  it("renders desktop and mobile navigation with every public route", async () => {
    const navigation = renderToStaticMarkup(await SiteNavigation());

    expect(navigation).toContain('aria-label="Main navigation"');
    expect(navigation).toContain('aria-label="Mobile navigation"');
    expect(navigation).toContain("Menu");

    for (const [href, label] of [
      ["/", "Home"],
      ["/games", "Games"],
      ["/leaderboards", "Leaderboards"],
      ["/about", "About"],
    ]) {
      expect(navigation).toContain(`href="${href}"`);
      expect(navigation).toContain(label);
    }
  });
});
