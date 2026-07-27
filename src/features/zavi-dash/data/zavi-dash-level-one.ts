import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashVisuals } from "./zavi-dash-visuals";

const distancePerPoint = 12;
const completionBonus = 500;
const finishX = 7_200;
const playerStartX = 160;

export const zaviDashLevelOne: LevelDefinition = {
  id: "sunlit-sprint",
  name: "Sunlit Sprint",
  world: {
    width: 7_500,
    height: 540,
  },
  groundY: 430,
  player: {
    startX: playerStartX,
    width: 52,
    height: 52,
  },
  physics: {
    gravity: 1_900,
    jumpImpulse: -760,
    runSpeed: 300,
  },
  terrain: [
    { startX: 0, endX: 1_560 },
    { startX: 1_680, endX: 3_460 },
    { startX: 3_580, endX: 5_470 },
    { startX: 5_590, endX: 7_500 },
  ],
  obstacles: [
    { id: "first-spire", kind: "spire", x: 760, width: 72, height: 60 },
    { id: "paired-blocks", kind: "block", x: 1_180, width: 72, height: 60 },
    { id: "ridge-spire", kind: "spire", x: 2_250, width: 72, height: 60 },
    { id: "high-block", kind: "block", x: 2_790, width: 72, height: 60 },
    { id: "twin-spires", kind: "spire", x: 4_160, width: 72, height: 60 },
    { id: "finish-block", kind: "block", x: 6_370, width: 72, height: 60 },
  ],
  finishX,
  scoring: {
    distancePerPoint,
    completionBonus,
    maximumScore: Math.floor((finishX - playerStartX) / distancePerPoint) + completionBonus,
  },
  visuals: zaviDashVisuals,
};
