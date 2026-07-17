import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LeaderboardPage from "./page";

describe("LeaderboardPage", () => {
  it("renders Geometry Dash rankings, player names, and scores", async () => {
    const page = await LeaderboardPage({
      params: Promise.resolve({ slug: "geometry-dash" }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Rank");
    expect(markup).toContain("Zavi");
    expect(markup).toContain("987,650");
    expect(markup.indexOf("Zavi")).toBeLessThan(markup.indexOf("Nova"));
  });
});
