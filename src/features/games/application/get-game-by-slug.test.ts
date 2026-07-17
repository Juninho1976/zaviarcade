import { describe, expect, it } from "vitest";
import { getGameBySlug } from "./get-game-by-slug";

describe("getGameBySlug", () => {
  it("returns Geometry Dash with its route, thumbnail, and leaderboard", () => {
    expect(getGameBySlug("geometry-dash")).toEqual(
      expect.objectContaining({
        route: "/games/geometry-dash",
        status: "coming-soon",
        thumbnail: expect.objectContaining({
          src: "/images/games/geometry-dash.png",
        }),
        leaderboard: expect.objectContaining({
          route: "/games/geometry-dash/leaderboard",
          entries: expect.arrayContaining([
            expect.objectContaining({ playerName: "Zavi", rank: 1, score: 987_650 }),
          ]),
        }),
      }),
    );
  });

  it("returns undefined for an unknown game", () => {
    expect(getGameBySlug("not-a-game")).toBeUndefined();
  });
});
