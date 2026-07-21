import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LeaderboardsPage from "./page";

describe("LeaderboardsPage", () => {
  it("lists the Geometry Dash leaderboard", () => {
    const page = renderToStaticMarkup(<LeaderboardsPage />);

    expect(page).toContain("Leaderboards");
    expect(page).toContain("Geometry Dash");
    expect(page).toContain('href="/games/geometry-dash/leaderboard"');
  });
});
