export const ZAVI_FISH_VIEWPORT = { width: 960, height: 540 } as const;
export const ZAVI_FISH_DURATION_SECONDS = 60;
export const ZAVI_FISH_STEP_SECONDS = 1 / 60;

export type FishType = "large" | "medium" | "small" | "rare";
export type Fish = {
  caught: boolean;
  direction: -1 | 1;
  id: number;
  speed: number;
  type: FishType;
  x: number;
  y: number;
};
export type Hook = { caughtFishId: number | null; y: number };
export type FishGamePhase = "ready" | "playing" | "over";
export type FishGameState = {
  catches: Record<FishType, number>;
  elapsedSeconds: number;
  fish: readonly Fish[];
  hook: Hook;
  nextFishId: number;
  phase: FishGamePhase;
  score: number;
  status: "Cast to start!" | "Fish on! Reel it in!" | "Miss — reeling in." | "Ready to cast";
};

export const fishConfig: Record<FishType, { color: string; height: number; points: number; rarity: number; speed: readonly [number, number]; width: number }> = {
  large: { points: 10, width: 78, height: 38, speed: [42, 60], rarity: 0.42, color: "#fbbf24" },
  medium: { points: 25, width: 58, height: 29, speed: [62, 86], rarity: 0.32, color: "#fb7185" },
  small: { points: 50, width: 40, height: 20, speed: [92, 124], rarity: 0.21, color: "#a78bfa" },
  rare: { points: 100, width: 48, height: 24, speed: [72, 98], rarity: 0.05, color: "#67e8f9" },
};
