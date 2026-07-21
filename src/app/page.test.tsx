import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("welcomes visitors and presents Zavi Dash before future games", () => {
    const page = renderToStaticMarkup(<Home />);

    expect(page).toContain("Welcome to Zavi Arcade.");
    expect(page).toContain(
      "Experience designed by Zavi and built by Zavi and family.",
    );
    expect(page).toContain("Ready to play");
    expect(page).toContain("Mystery Game");
    expect(page).toContain("Your Next Challenge");
    expect(page.indexOf("Zavi Dash")).toBeLessThan(
      page.indexOf("Mystery Game"),
    );
  });
});
