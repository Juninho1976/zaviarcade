import { describe, expect, it } from "vitest";
import { getGameBySlug } from "./get-game-by-slug";

describe("getGameBySlug", () => {
  it("returns Geometry Future with its route, thumbnail, and leaderboard", () => {
    expect(getGameBySlug("geometry-future")).toEqual(
      expect.objectContaining({
        route: "/games/geometry-future",
        status: "coming-soon",
        thumbnail: expect.objectContaining({
          src: "/images/games/geometry-future.png",
        }),
        leaderboard: expect.objectContaining({
          route: "/games/geometry-future/leaderboard",
        }),
      }),
    );
  });

  it("returns undefined for an unknown game", () => {
    expect(getGameBySlug("not-a-game")).toBeUndefined();
  });
});
