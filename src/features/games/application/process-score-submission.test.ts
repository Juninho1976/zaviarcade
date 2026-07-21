import { describe, expect, it } from "vitest";
import { processScoreSubmission } from "./process-score-submission";

const database = {
  prepare: () => ({
    bind: (...values: unknown[]) => ({
      all: async () => ({ results: values[0] === "zavi-dash" ? [{ id: 1 }] : [{ id: 2 }], meta: {} }),
      run: async () => ({ results: [], meta: { last_row_id: 7 } }),
    }),
  }),
};

describe("processScoreSubmission", () => {
  it("rejects an exhausted rate limit before persisting a valid score", async () => {
    const limit = async () => ({ success: false });

    await expect(processScoreSubmission(database, "zavi-dash", { playerName: "Zavi", score: 100 }, {
      rateLimiter: { limit },
      rateLimitKey: "score-submission:test",
    })).resolves.toEqual({
      success: false,
      status: 429,
      message: "Too many score submissions. Please wait a minute and try again.",
    });
  });

  it("rejects an unknown game independently through persistence", async () => {
    const unknownGameDatabase = {
      prepare: () => ({
        bind: () => ({
          all: async () => ({ results: [], meta: {} }),
          run: async () => ({ results: [], meta: {} }),
        }),
      }),
    };

    await expect(processScoreSubmission(unknownGameDatabase, "not-a-game", { playerName: "Zavi", score: 100 })).resolves.toEqual({
      success: false,
      status: 404,
      message: "Game not found.",
    });
  });
});
