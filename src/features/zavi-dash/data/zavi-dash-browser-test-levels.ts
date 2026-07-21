import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashLevelOne } from "./zavi-dash-level-one";

type BrowserTestScenario = "complete" | "death" | "running";

function createBrowserTestLevel(
  id: string,
  overrides: Pick<LevelDefinition, "finishX" | "obstacles" | "terrain" | "world">,
): LevelDefinition {
  const maximumScore = Math.floor(
    (overrides.finishX - zaviDashLevelOne.player.startX) / zaviDashLevelOne.scoring.distancePerPoint,
  ) + zaviDashLevelOne.scoring.completionBonus;

  return {
    ...zaviDashLevelOne,
    ...overrides,
    id,
    scoring: { ...zaviDashLevelOne.scoring, maximumScore },
  };
}

const browserTestLevels: Record<BrowserTestScenario, LevelDefinition> = {
  complete: createBrowserTestLevel("browser-complete", {
    finishX: 340,
    obstacles: [],
    terrain: [{ startX: 0, endX: 700 }],
    world: { width: 700, height: 540 },
  }),
  death: createBrowserTestLevel("browser-death", {
    finishX: 4_000,
    obstacles: [{ id: "browser-obstacle", kind: "block", x: 300, width: 100, height: 100 }],
    terrain: [{ startX: 0, endX: 4_200 }],
    world: { width: 4_200, height: 540 },
  }),
  running: createBrowserTestLevel("browser-running", {
    finishX: 4_000,
    obstacles: [],
    terrain: [{ startX: 0, endX: 4_200 }],
    world: { width: 4_200, height: 540 },
  }),
};

export function getBrowserTestLevel(scenario: string | undefined): LevelDefinition | undefined {
  if (scenario !== "complete" && scenario !== "death" && scenario !== "running") return undefined;

  return browserTestLevels[scenario];
}
