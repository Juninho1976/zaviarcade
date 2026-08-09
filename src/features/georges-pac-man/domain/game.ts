export const GEORGES_PAC_MAN_DURATION_SECONDS = 120;
export const GEORGES_PAC_MAN_MAX_SCORE = 100_000;
export const GEORGES_PAC_MAN_STEP_SECONDS = 1 / 60;
export const GEORGES_PAC_MAN_VIEWPORT = { width: 660, height: 660 } as const;

export type Direction = "down" | "left" | "right" | "up";
export type GamePhase = "lost" | "playing" | "ready" | "won";

export type GridPosition = {
  column: number;
  row: number;
};

export type GhostState = GridPosition & {
  color: string;
  direction: Direction;
  id: string;
  recoveringSeconds: number;
  spawn: GridPosition;
};

export type GeorgesPacManState = {
  elapsedSeconds: number;
  ghostCombo: number;
  ghostMoveAccumulator: number;
  ghosts: readonly GhostState[];
  invulnerableSeconds: number;
  lives: number;
  pellets: readonly string[];
  phase: GamePhase;
  player: GridPosition & {
    direction: Direction | null;
    nextDirection: Direction | null;
  };
  playerMoveAccumulator: number;
  powerPellets: readonly string[];
  powerSeconds: number;
  score: number;
  status: string;
};

export type GeorgesPacManInput = {
  direction?: Direction;
  endRunPressed?: boolean;
  restartPressed?: boolean;
  startPressed?: boolean;
};
