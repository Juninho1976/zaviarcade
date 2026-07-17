import { describe, expect, it } from "vitest";
import { navigationItems } from "./navigation-items";

describe("navigationItems", () => {
  it("defines the public site routes in navigation order", () => {
    expect(navigationItems).toEqual([
      { href: "/", label: "Home" },
      { href: "/games", label: "Games" },
      { href: "/leaderboards", label: "Leaderboards" },
      { href: "/about", label: "About" },
    ]);
  });
});
