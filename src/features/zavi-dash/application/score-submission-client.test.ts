import { describe, expect, it, vi } from "vitest";
import { createInitialGameState } from "./game-engine";
import { canSubmitCompletedRun, submitCompletedZaviDashScore } from "./score-submission-client";
import { zaviDashLevelOne } from "../data/zavi-dash-level-one";

describe("Zavi Dash score submission client", () => {
  it("only enables submission for a completed run that is not already saved or pending", () => {
    const completed = { ...createInitialGameState(zaviDashLevelOne), phase: "completed" as const, score: 1_086 };
    const dead = { ...completed, phase: "dead" as const, deathReason: "gap" as const };

    expect(canSubmitCompletedRun(completed, { status: "idle" })).toBe(true);
    expect(canSubmitCompletedRun(completed, { status: "pending" })).toBe(false);
    expect(canSubmitCompletedRun(completed, { status: "success", scoreId: 7 })).toBe(false);
    expect(canSubmitCompletedRun(dead, { status: "idle" })).toBe(false);
  });

  it("posts a completed score and returns its persisted ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ scoreId: 7 }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitCompletedZaviDashScore("Zavi", 1_086)).resolves.toBe(7);
    expect(fetchMock).toHaveBeenCalledWith("/api/games/zavi-dash/scores", expect.objectContaining({ method: "POST" }));
    vi.unstubAllGlobals();
  });
});
