import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashLevelOne } from "./zavi-dash-level-one";

type BrowserTestScenario = "complete" | "death" | "opening-section" | "running" | "spire-near-miss";
type BrowserTestLevelOverrides = Pick<LevelDefinition, "finishX" | "obstacles" | "terrain" | "world"> &
  Partial<Pick<LevelDefinition, "physics">>;

function createBrowserTestLevel(
  id: string,
  overrides: BrowserTestLevelOverrides,
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
    obstacles: [{ id: "browser-spire", kind: "spire", x: 300, width: 100, height: 100 }],
    terrain: [{ startX: 0, endX: 4_200 }],
    world: { width: 4_200, height: 540 },
  }),
  running: createBrowserTestLevel("browser-running", {
    finishX: 4_000,
    obstacles: [],
    terrain: [{ startX: 0, endX: 4_200 }],
    world: { width: 4_200, height: 540 },
  }),
  "spire-near-miss": createBrowserTestLevel("browser-spire-near-miss", {
    finishX: 3_000,
    obstacles: [{ id: "browser-near-miss-spire", kind: "spire", x: 300, width: 90, height: 200 }],
    physics: { ...zaviDashLevelOne.physics, jumpImpulse: -1_200 },
    terrain: [{ startX: 0, endX: 3_200 }],
    world: { width: 3_200, height: 540 },
  }),
  "opening-section": createBrowserTestLevel("browser-opening-section", {
    finishX: 3_000,
    obstacles: zaviDashLevelOne.obstacles.slice(0, 2),
    terrain: [{ startX: 0, endX: 3_200 }],
    world: { width: 3_200, height: 540 },
  }),
};

export function getBrowserTestLevel(scenario: string | undefined): LevelDefinition | undefined {
  if (
    scenario !== "complete" &&
    scenario !== "death" &&
    scenario !== "opening-section" &&
    scenario !== "running" &&
    scenario !== "spire-near-miss"
  ) return undefined;

  return browserTestLevels[scenario];
}
