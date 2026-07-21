import type { LevelVisualTheme } from "@/features/zavi-dash/domain/level";

export const zaviDashVisuals: LevelVisualTheme = {
  animation: {
    backgroundDriftPixelsPerSecond: 18,
    playerPulseMilliseconds: 700,
  },
  background: {
    base: "#172554",
    accent: "#4c1d95",
    sun: "#fef08a",
  },
  finish: {
    pole: "#f8fafc",
    flag: "#facc15",
  },
  ground: {
    fill: "#0891b2",
    edge: "#cffafe",
  },
  obstacle: {
    block: "#a855f7",
    spire: "#fb923c",
  },
  player: {
    fill: "#67e8f9",
    accent: "#0f172a",
    shape: "rounded-block",
  },
};
