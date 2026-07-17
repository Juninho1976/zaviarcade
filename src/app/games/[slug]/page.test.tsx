import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GamePage from "./page";

describe("GamePage", () => {
  it("renders the Geometry Dash play placeholder and leaderboard section", async () => {
    const page = await GamePage({
      params: Promise.resolve({ slug: "geometry-dash" }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Geometry Dash");
    expect(markup).toContain("Play (coming soon)");
    expect(markup).toContain("Leaderboard");
  });
});
