import { describe, expect, it } from "vitest";
import { persistScore } from "./persist-score";

describe("persistScore", () => {
  it("links a score to the resolved game and authenticated account", async () => {
    const calls: unknown[][] = [];
    const submissionId = "123e4567-e89b-42d3-a456-426614174000";
    const database = { prepare: () => ({ bind: (...values: unknown[]) => ({ all: async () => { calls.push(values); return { results: values[0] === "zavi-dash" ? [{ id: 1 }] : values[0] === submissionId ? [{ id: 7 }] : [{ id: 2 }], meta: {} }; }, run: async () => ({ results: [], meta: { last_row_id: 7 } }) }) }) };
    await expect(persistScore(database, "zavi-dash", "user-1", { score: 1_086, submissionId })).resolves.toEqual({ success: true, scoreId: 7 });
    expect(calls).toContainEqual(["zavi-dash"]);
    expect(calls).toContainEqual([submissionId]);
  });
});
