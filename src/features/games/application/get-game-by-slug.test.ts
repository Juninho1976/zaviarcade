import { describe, expect, it } from "vitest";
import { getGameBySlug } from "./get-game-by-slug";

describe("getGameBySlug", () => {
  it("returns Zavi Dash with its route, thumbnail, and leaderboard", () => {
    expect(getGameBySlug("zavi-dash")).toEqual(
      expect.objectContaining({
        route: "/games/zavi-dash",
        status: "coming-soon",
        thumbnail: expect.objectContaining({
          src: "/images/games/zavi-dash.svg",
        }),
        leaderboard: expect.objectContaining({
          route: "/games/zavi-dash/leaderboard",
          entries: [],
        }),
      }),
    );
  });

  it("returns undefined for an unknown game", () => {
    expect(getGameBySlug("not-a-game")).toBeUndefined();
  });
});
