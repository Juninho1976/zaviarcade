export type GroundSegment = {
  endX: number;
  startX: number;
};

export type LevelObstacle = {
  height: number;
  id: string;
  kind: "block" | "spire";
  width: number;
  x: number;
};

export type LevelVisualTheme = {
  animation: {
    backgroundDriftPixelsPerSecond: number;
    playerPulseMilliseconds: number;
  };
  background: {
    accent: string;
    base: string;
    sun: string;
  };
  finish: {
    flag: string;
    pole: string;
  };
  ground: {
    edge: string;
    fill: string;
  };
  obstacle: {
    block: string;
    spire: string;
  };
  player: {
    accent: string;
    fill: string;
    shape: "rounded-block";
  };
};

export type LevelDefinition = {
  finishX: number;
  groundY: number;
  id: string;
  name: string;
  obstacles: readonly LevelObstacle[];
  physics: {
    gravity: number;
    jumpImpulse: number;
    runSpeed: number;
  };
  player: {
    height: number;
    startX: number;
    width: number;
  };
  scoring: {
    completionBonus: number;
    distancePerPoint: number;
    maximumScore: number;
  };
  terrain: readonly GroundSegment[];
  visuals: LevelVisualTheme;
  world: {
    height: number;
    width: number;
  };
};

export type LevelValidationError = {
  message: string;
  path: string;
};
