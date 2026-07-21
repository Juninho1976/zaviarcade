import { describe, expect, it } from "vitest";
import { getGamesWithLeaderboards } from "./get-games-with-leaderboards";

describe("getGamesWithLeaderboards", () => {
  it("returns registered games with public leaderboards, excluding future placeholders", () => {
    expect(getGamesWithLeaderboards().map((game) => game.slug)).toEqual([
      "zavi-dash",
    ]);
  });
});
