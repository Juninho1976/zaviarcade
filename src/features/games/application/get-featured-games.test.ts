import { describe, expect, it } from "vitest";
import { getFeaturedGames } from "./get-featured-games";

describe("getFeaturedGames", () => {
  it("returns the Geometry Dash leaderboard as a coming-soon game", () => {
    expect(getFeaturedGames()).toEqual([
      expect.objectContaining({
        slug: "geometry-dash-leaderboard",
        status: "coming-soon",
      }),
    ]);
  });
});
