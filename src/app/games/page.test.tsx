import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GamesPage from "./page";

describe("GamesPage", () => {
  it("lists registered available and upcoming games", () => {
    const page = renderToStaticMarkup(<GamesPage />);

    expect(page).toContain("Games");
    expect(page).toContain("Zavi Dash");
    expect(page).toContain('href="/games/zavi-dash"');
    expect(page).toContain("Mystery Game");
    expect(page).toContain("Your Next Challenge");
  });
});
