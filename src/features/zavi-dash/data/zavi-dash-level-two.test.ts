import { describe, expect, it } from "vitest";
import { createInitialGameState, stepGame } from "@/features/zavi-dash/application/game-engine";
import { getMaximumScore } from "@/features/zavi-dash/application/get-maximum-score";
import { validateLevelDefinition } from "@/features/zavi-dash/application/validate-level-definition";
import { zaviDashLevelOne } from "./zavi-dash-level-one";
import { zaviDashLevelTwo } from "./zavi-dash-level-two";

describe("Zavi Dash 2 level", () => {
  it("is longer, faster, and more hazardous than the original level", () => {
    expect(zaviDashLevelTwo.finishX).toBeGreaterThan(zaviDashLevelOne.finishX);
    expect(zaviDashLevelTwo.physics.runSpeed).toBeGreaterThan(zaviDashLevelOne.physics.runSpeed);
    expect(zaviDashLevelTwo.obstacles.length).toBeGreaterThan(zaviDashLevelOne.obstacles.length);
    expect(zaviDashLevelTwo.terrain.length).toBeGreaterThan(zaviDashLevelOne.terrain.length);
    expect(zaviDashLevelTwo.scoring.maximumScore).toBe(getMaximumScore(zaviDashLevelTwo));
    expect(validateLevelDefinition(zaviDashLevelTwo)).toEqual([]);
  });

  it.each([105, 115, 125])("remains finishable with a forgiving %ipx jump lead", (jumpLead) => {
    const gapStarts = zaviDashLevelTwo.terrain.slice(0, -1).map((segment) => segment.endX);
    const hazards = [
      ...zaviDashLevelTwo.obstacles.map((obstacle) => obstacle.x),
      ...gapStarts,
    ].sort((first, second) => first - second);
    let state = createInitialGameState(zaviDashLevelTwo);

    for (let step = 0; step < 6_000 && state.phase !== "completed" && state.phase !== "dead"; step += 1) {
      const nextHazard = hazards.find((hazardX) => hazardX > state.player.x);
      const shouldJump = state.player.grounded && nextHazard !== undefined && nextHazard - state.player.x <= jumpLead;
      state = stepGame(state, zaviDashLevelTwo, {
        jumpPressed: shouldJump,
        startPressed: step === 0,
      });
    }

    expect(state.player.x).toBeGreaterThanOrEqual(zaviDashLevelTwo.finishX);
    expect(state).toMatchObject({ phase: "completed" });
  });
});
