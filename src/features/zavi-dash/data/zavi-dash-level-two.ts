import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashVisuals } from "./zavi-dash-visuals";

const distancePerPoint = 12;
const completionBonus = 750;
const finishX = 9_600;
const playerStartX = 160;

export const zaviDashLevelTwo: LevelDefinition = {
  id: "neon-gauntlet",
  name: "Neon Gauntlet",
  world: {
    width: 9_900,
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
    runSpeed: 330,
  },
  terrain: [
    { startX: 0, endX: 1_450 },
    { startX: 1_590, endX: 3_100 },
    { startX: 3_250, endX: 4_850 },
    { startX: 5_005, endX: 6_660 },
    { startX: 6_820, endX: 8_400 },
    { startX: 8_550, endX: 9_900 },
  ],
  obstacles: [
    { id: "opening-spire", kind: "spire", x: 650, width: 72, height: 68 },
    { id: "opening-block", kind: "block", x: 1_050, width: 76, height: 72 },
    { id: "second-spire", kind: "spire", x: 1_920, width: 76, height: 72 },
    { id: "second-block", kind: "block", x: 2_330, width: 76, height: 76 },
    { id: "second-finale", kind: "spire", x: 2_760, width: 80, height: 76 },
    { id: "third-block", kind: "block", x: 3_560, width: 80, height: 76 },
    { id: "third-spire", kind: "spire", x: 4_030, width: 80, height: 78 },
    { id: "third-finale", kind: "block", x: 4_500, width: 82, height: 80 },
    { id: "fourth-spire", kind: "spire", x: 5_340, width: 82, height: 80 },
    { id: "fourth-block", kind: "block", x: 5_820, width: 82, height: 82 },
    { id: "fourth-finale", kind: "spire", x: 6_280, width: 84, height: 82 },
    { id: "fifth-block", kind: "block", x: 7_160, width: 84, height: 82 },
    { id: "fifth-spire", kind: "spire", x: 7_630, width: 84, height: 84 },
    { id: "fifth-finale", kind: "block", x: 8_050, width: 86, height: 84 },
    { id: "final-spire", kind: "spire", x: 8_880, width: 86, height: 86 },
    { id: "finish-block", kind: "block", x: 9_280, width: 86, height: 86 },
  ],
  finishX,
  scoring: {
    distancePerPoint,
    completionBonus,
    maximumScore: Math.floor((finishX - playerStartX) / distancePerPoint) + completionBonus,
  },
  visuals: {
    ...zaviDashVisuals,
    background: {
      base: "#2e1065",
      accent: "#0e7490",
      sun: "#f0abfc",
    },
    ground: {
      fill: "#7c3aed",
      edge: "#a5f3fc",
    },
  },
};
