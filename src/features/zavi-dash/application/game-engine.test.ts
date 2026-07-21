import { describe, expect, it } from "vitest";
import { getMaximumScore } from "@/features/zavi-dash/application/get-maximum-score";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import type { GameInput, GameState } from "@/features/zavi-dash/domain/game";
import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { createInitialGameState, stepGame } from "./game-engine";

function runSteps(state: GameState, level: LevelDefinition, steps: number, input: GameInput = {}): GameState {
  let nextState = state;

  for (let index = 0; index < steps; index += 1) {
    nextState = stepGame(nextState, level, index === 0 ? input : {});
  }

  return nextState;
}

function createFlatLevel(overrides: Partial<LevelDefinition> = {}): LevelDefinition {
  const finishX = 600;
  const playerStartX = 100;
  const distancePerPoint = 10;
  const completionBonus = 100;

  return {
    ...zaviDashLevelOne,
    world: { width: 800, height: 540 },
    player: { ...zaviDashLevelOne.player, startX: playerStartX },
    terrain: [{ startX: 0, endX: 800 }],
    obstacles: [],
    finishX,
    scoring: {
      distancePerPoint,
      completionBonus,
      maximumScore: Math.floor((finishX - playerStartX) / distancePerPoint) + completionBonus,
    },
    ...overrides,
  };
}

describe("Zavi Dash game engine", () => {
  it("starts a run and moves the player automatically at a fixed timestep", () => {
    const state = createInitialGameState(zaviDashLevelOne);
    const nextState = stepGame(state, zaviDashLevelOne, { startPressed: true });

    expect(nextState.phase).toBe("running");
    expect(nextState.player.x).toBeGreaterThan(state.player.x);
    expect(nextState.elapsedSeconds).toBeGreaterThan(0);
  });

  it("jumps, applies gravity, and lands back on solid ground", () => {
    let state = stepGame(createInitialGameState(zaviDashLevelOne), zaviDashLevelOne, { startPressed: true });
    state = stepGame(state, zaviDashLevelOne, { jumpPressed: true });

    expect(state.player.velocityY).toBeLessThan(0);
    expect(state.player.grounded).toBe(false);

    state = runSteps(state, zaviDashLevelOne, 180);

    expect(state.phase).toBe("running");
    expect(state.player).toMatchObject({
      grounded: true,
      velocityY: 0,
      y: zaviDashLevelOne.groundY - zaviDashLevelOne.player.height,
    });
  });

  it("detects an obstacle collision even when one fixed step crosses its bounds", () => {
    const level = createFlatLevel({
      physics: { ...zaviDashLevelOne.physics, runSpeed: 60_000 },
      obstacles: [{ id: "fast-spire", kind: "spire", x: 400, width: 60, height: 100 }],
    });

    const state = stepGame(createInitialGameState(level), level, { startPressed: true });

    expect(state).toMatchObject({ phase: "dead", deathReason: "obstacle" });
  });

  it("kills the player after falling through a gap", () => {
    const level = createFlatLevel({
      terrain: [
        { startX: 0, endX: 220 },
        { startX: 460, endX: 800 },
      ],
      finishX: 760,
      scoring: { distancePerPoint: 10, completionBonus: 100, maximumScore: 166 },
    });
    const state = runSteps(createInitialGameState(level), level, 420, { startPressed: true });

    expect(state).toMatchObject({ phase: "dead", deathReason: "gap" });
  });

  it("completes a clear level with bounded progress and maximum score", () => {
    const level = createFlatLevel();
    const state = runSteps(createInitialGameState(level), level, 220, { startPressed: true });

    expect(state).toMatchObject({ phase: "completed", progress: 1 });
    expect(state.score).toBe(getMaximumScore(level));
  });

  it("quickly restarts dead and completed runs", () => {
    const level = createFlatLevel({
      obstacles: [{ id: "nearby-block", kind: "block", x: 154, width: 60, height: 80 }],
    });
    const deadState = stepGame(createInitialGameState(level), level, { startPressed: true });
    const restartedState = stepGame(deadState, level, { restartPressed: true });

    expect(deadState.phase).toBe("dead");
    expect(restartedState).toEqual(createInitialGameState(level));

    const completedLevel = createFlatLevel();
    const completedState = runSteps(createInitialGameState(completedLevel), completedLevel, 220, { startPressed: true });

    expect(completedState.phase).toBe("completed");
    expect(stepGame(completedState, completedLevel, { restartPressed: true })).toEqual(
      createInitialGameState(completedLevel),
    );
  });

  it("produces the same result for identical level data and inputs", () => {
    const level = createFlatLevel();
    const inputs: readonly GameInput[] = [{ startPressed: true }, {}, { jumpPressed: true }, {}, {}, {}];

    const first = inputs.reduce((state, input) => stepGame(state, level, input), createInitialGameState(level));
    const second = inputs.reduce((state, input) => stepGame(state, level, input), createInitialGameState(level));

    expect(first).toEqual(second);
  });
});
