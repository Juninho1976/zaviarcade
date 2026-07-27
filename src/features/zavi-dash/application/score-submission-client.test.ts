import { describe, expect, it, vi } from "vitest";
import { createInitialGameState } from "./game-engine";
import { canSubmitFinishedRun, submitZaviDashScore } from "./score-submission-client";
import { zaviDashLevelOne } from "../data/zavi-dash-level-one";

const submissionId = "123e4567-e89b-42d3-a456-426614174000";

describe("Zavi Dash score submission client", () => {
  it("enables submission for dead and completed runs that are not already saved or pending", () => {
    const completed = { ...createInitialGameState(zaviDashLevelOne), phase: "completed" as const, score: 1_086 };
    const dead = { ...completed, phase: "dead" as const, deathReason: "gap" as const };

    expect(canSubmitFinishedRun(completed, { status: "idle" })).toBe(true);
    expect(canSubmitFinishedRun(completed, { status: "pending" })).toBe(false);
    expect(canSubmitFinishedRun(completed, { status: "success", scoreId: 7 })).toBe(false);
    expect(canSubmitFinishedRun(dead, { status: "idle" })).toBe(true);
  });

  it("posts a completed score and returns its persisted ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ scoreId: 7 }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitZaviDashScore("Zavi", 1_086, submissionId)).resolves.toBe(7);
    expect(fetchMock).toHaveBeenCalledWith("/api/games/zavi-dash/scores", expect.objectContaining({
      body: JSON.stringify({ playerName: "Zavi", score: 1_086, submissionId }),
      method: "POST",
    }));
    vi.unstubAllGlobals();
  });

  it("surfaces the server validation message when saving fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Player name is required." }), { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitZaviDashScore("", 1_086, submissionId)).rejects.toThrow("Player name is required.");
    vi.unstubAllGlobals();
  });
});
