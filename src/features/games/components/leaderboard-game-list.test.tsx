import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getGamesWithLeaderboards } from "@/features/games/application/get-games-with-leaderboards";
import { LeaderboardGameList } from "./leaderboard-game-list";

describe("LeaderboardGameList", () => {
  it("links each game to its dedicated leaderboard", () => {
    const list = renderToStaticMarkup(
      <LeaderboardGameList games={getGamesWithLeaderboards()} />,
    );

    expect(list).toContain("Geometry Dash");
    expect(list).toContain('href="/games/geometry-dash/leaderboard"');
  });
});
