import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LeaderboardsPage from "./page";

describe("LeaderboardsPage", () => {
  it("lists the Zavi Dash leaderboard", () => {
    const page = renderToStaticMarkup(<LeaderboardsPage />);

    expect(page).toContain("Leaderboards");
    expect(page).toContain("Zavi Dash");
    expect(page).toContain('href="/games/zavi-dash/leaderboard"');
  });
});
