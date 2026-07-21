import { describe, expect, it } from "vitest";
import { getLeaderboard } from "./get-leaderboard";

describe("getLeaderboard", () => {
  it("queries the game leaderboard and returns ranked D1 rows", async () => {
    const prepare = () => ({ bind: () => ({ all: async () => ({ results: [{ playerName: "Zavi", rank: 1, score: 99 }] }) }) });
    await expect(getLeaderboard({ prepare }, "geometry-dash")).resolves.toEqual([{ playerName: "Zavi", rank: 1, score: 99 }]);
  });
});
