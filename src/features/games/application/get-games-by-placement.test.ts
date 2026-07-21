import { describe, expect, it } from "vitest";
import { getGamesByPlacement } from "./get-games-by-placement";

describe("getGamesByPlacement", () => {
  it("returns Zavi Dash in the available collection", () => {
    const availableGames = getGamesByPlacement("available");

    expect(availableGames).toEqual([
      expect.objectContaining({
        isPlaceholder: false,
        placement: "available",
        slug: "zavi-dash",
        status: "live",
        title: "Zavi Dash",
        thumbnail: expect.objectContaining({
          src: "/images/games/zavi-dash.svg",
        }),
      }),
    ]);
    expect(getGamesByPlacement("coming-soon").filter((game) => game.isPlaceholder)).toHaveLength(2);
  });

  it("keeps empty collections ready for future content", () => {
    expect(getGamesByPlacement("featured")).toEqual([]);
  });
});
