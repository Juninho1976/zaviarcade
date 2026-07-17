import { describe, expect, it } from "vitest";
import { getFeaturedGames } from "./get-featured-games";

describe("getFeaturedGames", () => {
  it("puts Geometry Dash first and includes future-game placeholders", () => {
    const featuredGames = getFeaturedGames();

    expect(featuredGames[0]).toEqual(
      expect.objectContaining({
        isPlaceholder: false,
        slug: "geometry-dash-leaderboard",
        status: "coming-soon",
      }),
    );
    expect(featuredGames.filter((game) => game.isPlaceholder)).toHaveLength(2);
  });
});
