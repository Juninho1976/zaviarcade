export const FIXED_TIME_STEP_SECONDS = 1 / 120;

export type DeathReason = "gap" | "obstacle";
export type GamePhase = "completed" | "dead" | "ready" | "running";

export type PlayerState = {
  grounded: boolean;
  velocityY: number;
  x: number;
  y: number;
};

export type GameState = {
  deathReason: DeathReason | null;
  elapsedSeconds: number;
  phase: GamePhase;
  player: PlayerState;
  progress: number;
  score: number;
};

export type GameInput = {
  jumpPressed?: boolean;
  restartPressed?: boolean;
  startPressed?: boolean;
};

export type Bounds = {
  height: number;
  width: number;
  x: number;
  y: number;
};
