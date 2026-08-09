import { describe, expect, it } from "vitest";
import { getLeaderboard } from "./get-leaderboard";

describe("getLeaderboard", () => {
  it("queries the game leaderboard and returns ranked D1 rows", async () => {
    let query = "";
    const row = { playerName: "Zavi", rank: 1, scoredAt: "2026-08-09T14:35:00Z", score: 99 };
    const prepare = (statement: string) => {
      query = statement;
      return { bind: () => ({ all: async () => ({ results: [row] }) }) };
    };

    await expect(getLeaderboard({ prepare }, "zavi-dash")).resolves.toEqual([row]);
    expect(query).toContain("s.created_at");
    expect(query).toContain("AS scoredAt");
  });
});
