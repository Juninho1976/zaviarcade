export const RAK_ASTEROIDS_DURATION_SECONDS = 90;
export const RAK_ASTEROIDS_MAX_SCORE = 20_000;
export const RAK_ASTEROIDS_STEP_SECONDS = 1 / 60;
export const RAK_ASTEROIDS_VIEWPORT = { width: 960, height: 600 } as const;

export type AsteroidSize = "large" | "medium" | "small";
export type RakAsteroidsPhase = "over" | "playing" | "ready" | "won";

export type Vector = {
  x: number;
  y: number;
};

export type Asteroid = Vector & {
  angle: number;
  id: number;
  rotationSpeed: number;
  size: AsteroidSize;
  velocity: Vector;
};

export type Laser = Vector & {
  id: number;
  lifeSeconds: number;
  velocity: Vector;
};

export type Ship = Vector & {
  angle: number;
  invulnerableSeconds: number;
  velocity: Vector;
};

export type RakAsteroidsState = {
  asteroids: readonly Asteroid[];
  elapsedSeconds: number;
  fireCooldownSeconds: number;
  hits: number;
  lasers: readonly Laser[];
  lives: number;
  nextEntityId: number;
  phase: RakAsteroidsPhase;
  score: number;
  ship: Ship;
  shotsFired: number;
  status: string;
};

export type RakAsteroidsInput = {
  endRunPressed?: boolean;
  firePressed?: boolean;
  restartPressed?: boolean;
  rotateLeft?: boolean;
  rotateRight?: boolean;
  thrust?: boolean;
};
