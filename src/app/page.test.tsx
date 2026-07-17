import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("welcomes visitors and presents Geometry Dash before future games", () => {
    const page = renderToStaticMarkup(<Home />);

    expect(page).toContain("Welcome to Zavi Arcade.");
    expect(page).toContain("Mystery Game");
    expect(page).toContain("Your Next Challenge");
    expect(page.indexOf("Geometry Dash Leaderboard")).toBeLessThan(
      page.indexOf("Mystery Game"),
    );
  });
});
