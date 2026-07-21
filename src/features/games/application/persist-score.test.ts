import { describe, expect, it } from "vitest";
import { persistScore } from "./persist-score";

describe("persistScore", () => {
  it("links a score to the resolved game and reused player", async () => {
    const calls: unknown[][] = [];
    const database = { prepare: () => ({ bind: (...values: unknown[]) => ({ all: async () => { calls.push(values); return { results: values[0] === "zavi-dash" ? [{ id: 1 }] : [{ id: 2 }], meta: {} }; }, run: async () => ({ results: [], meta: { last_row_id: 7 } }) }) }) };
    await expect(persistScore(database, "zavi-dash", { playerName: "Zavi", score: 50 })).resolves.toEqual({ success: true, scoreId: 7 });
    expect(calls).toContainEqual(["zavi-dash"]);
  });
});
