import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteNavigation } from "./site-navigation";

describe("SiteNavigation", () => {
  it("renders desktop and mobile navigation with every public route", () => {
    const navigation = renderToStaticMarkup(<SiteNavigation />);

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
