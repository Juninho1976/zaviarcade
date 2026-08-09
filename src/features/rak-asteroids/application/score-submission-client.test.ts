import { afterEach, describe, expect, it, vi } from "vitest";
import { submitRakAsteroidsScore } from "./score-submission-client";

const submissionId = "123e4567-e89b-42d3-a456-426614174000";

describe("Rak Asteroids score submission client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("saves a run and returns its leaderboard ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ scoreId: 88 }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitRakAsteroidsScore(2_450, submissionId)).resolves.toBe(88);
    expect(fetchMock).toHaveBeenCalledWith("/api/games/rak-asteroids/scores", expect.objectContaining({
      body: JSON.stringify({ score: 2_450, submissionId }),
      method: "POST",
    }));
  });
});
