import { afterEach, describe, expect, it, vi } from "vitest";
import { submitGeorgePacManScore } from "./score-submission-client";

const submissionId = "123e4567-e89b-42d3-a456-426614174000";

describe("George (Pac) Man score submission client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("saves an unfinished run score and returns its leaderboard ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ scoreId: 42 }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitGeorgePacManScore(280, submissionId)).resolves.toBe(42);
    expect(fetchMock).toHaveBeenCalledWith("/api/games/georges-pac-man/scores", expect.objectContaining({
      body: JSON.stringify({ score: 280, submissionId }),
      method: "POST",
    }));
  });

  it("explains when the production game migration is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: "Game not found." }),
      { status: 404 },
    )));

    await expect(submitGeorgePacManScore(280, submissionId)).rejects.toThrow(
      "apply the latest database migration",
    );
  });
});
