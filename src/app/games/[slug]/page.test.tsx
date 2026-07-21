import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GamePage from "./page";

describe("GamePage", () => {
  it("renders the Zavi Dash play placeholder and leaderboard section", async () => {
    const page = await GamePage({
      params: Promise.resolve({ slug: "zavi-dash" }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Zavi Dash");
    expect(markup).toContain("Play (coming soon)");
    expect(markup).toContain("Leaderboard");
  });
});
