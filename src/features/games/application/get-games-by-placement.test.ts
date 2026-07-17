import { describe, expect, it } from "vitest";
import { getGamesByPlacement } from "./get-games-by-placement";

describe("getGamesByPlacement", () => {
  it("returns Geometry Future first in the coming-soon collection", () => {
    const upcomingGames = getGamesByPlacement("coming-soon");

    expect(upcomingGames[0]).toEqual(
      expect.objectContaining({
        isPlaceholder: false,
        slug: "geometry-future",
        title: "Geometry Future",
        thumbnail: expect.objectContaining({
          src: "/images/games/geometry-future.png",
        }),
      }),
    );
    expect(upcomingGames.filter((game) => game.isPlaceholder)).toHaveLength(2);
  });

  it("keeps empty collections ready for future content", () => {
    expect(getGamesByPlacement("featured")).toEqual([]);
    expect(getGamesByPlacement("available")).toEqual([]);
  });
});
