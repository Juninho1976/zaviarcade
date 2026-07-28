import { describe, expect, it } from "vitest";
import { createInitialFishGameState, startFishGame, stepFishGame } from "./game-engine";
import { ZAVI_FISH_DURATION_SECONDS, ZAVI_FISH_STEP_SECONDS } from "../domain/game";

describe("Zavi Fish engine", () => {
  it("only starts its 60-second clock when play begins", () => {
    expect(stepFishGame(createInitialFishGameState(), true).elapsedSeconds).toBe(0);
    expect(stepFishGame(startFishGame(createInitialFishGameState()), true).elapsedSeconds).toBe(ZAVI_FISH_STEP_SECONDS);
  });
  it("lowers while held, reels on release, misses at the bottom, and resets cleanly", () => {
    let state = startFishGame(createInitialFishGameState());
    for (let index = 0; index < 200; index++) state = stepFishGame(state, true, () => 0.1);
    expect(state.status).toBe("Miss — reeling in.");
    for (let index = 0; index < 200; index++) state = stepFishGame(state, false, () => 0.1);
    expect(state.hook.y).toBe(88);
    expect(createInitialFishGameState()).toMatchObject({ score: 0, fish: [], elapsedSeconds: 0 });
  });
  it("ends after the configured game duration and prevents more scoring", () => {
    let state = startFishGame(createInitialFishGameState());
    for (let index = 0; index < Math.ceil(ZAVI_FISH_DURATION_SECONDS / ZAVI_FISH_STEP_SECONDS); index++) state = stepFishGame(state, false, () => 0.1);
    expect(state.phase).toBe("over");
    expect(stepFishGame(state, true)).toEqual(state);
  });
});
