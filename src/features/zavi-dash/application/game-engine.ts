import { getMaximumScore } from "@/features/zavi-dash/application/get-maximum-score";
import { sweptBoundsIntersectTriangle, type Triangle } from "@/features/zavi-dash/application/spire-collision";
import {
  FIXED_TIME_STEP_SECONDS,
  type Bounds,
  type GameInput,
  type GameState,
  type PlayerState,
} from "@/features/zavi-dash/domain/game";
import type { LevelDefinition, LevelObstacle } from "@/features/zavi-dash/domain/level";

function getPlayerBounds(player: PlayerState, level: LevelDefinition): Bounds {
  return {
    x: player.x,
    y: player.y,
    width: level.player.width,
    height: level.player.height,
  };
}

function getObstacleBounds(obstacle: LevelObstacle, level: LevelDefinition): Bounds {
  return {
    x: obstacle.x,
    y: level.groundY - obstacle.height,
    width: obstacle.width,
    height: obstacle.height,
  };
}

function getSpireTriangle(obstacle: LevelObstacle, level: LevelDefinition): Triangle {
  return {
    left: { x: obstacle.x, y: level.groundY },
    apex: { x: obstacle.x + obstacle.width / 2, y: level.groundY - obstacle.height },
    right: { x: obstacle.x + obstacle.width, y: level.groundY },
  };
}

function boundsOverlap(first: Bounds, second: Bounds): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function getSweepTimes(position: number, delta: number, minimum: number, maximum: number): readonly [number, number] {
  if (delta === 0) {
    return position >= minimum && position <= maximum
      ? [-Infinity, Infinity]
      : [Infinity, -Infinity];
  }

  const first = (minimum - position) / delta;
  const second = (maximum - position) / delta;

  return [Math.min(first, second), Math.max(first, second)];
}

export function sweptBoundsCollisionTime(previous: Bounds, next: Bounds, obstacle: Bounds): number | undefined {
  if (boundsOverlap(previous, obstacle)) return 0;

  const expandedLeft = obstacle.x - previous.width;
  const expandedRight = obstacle.x + obstacle.width;
  const expandedTop = obstacle.y - previous.height;
  const expandedBottom = obstacle.y + obstacle.height;
  const [xEntry, xExit] = getSweepTimes(previous.x, next.x - previous.x, expandedLeft, expandedRight);
  const [yEntry, yExit] = getSweepTimes(previous.y, next.y - previous.y, expandedTop, expandedBottom);
  const entry = Math.max(xEntry, yEntry);
  const exit = Math.min(xExit, yExit);

  if (entry > exit || entry > 1 || exit < 0) return undefined;

  return Math.max(0, entry);
}

export function sweptBoundsIntersect(previous: Bounds, next: Bounds, obstacle: Bounds): boolean {
  return sweptBoundsCollisionTime(previous, next, obstacle) !== undefined;
}

function interpolatePlayer(previous: PlayerState, next: PlayerState, progress: number): PlayerState {
  return {
    x: previous.x + (next.x - previous.x) * progress,
    y: previous.y + (next.y - previous.y) * progress,
    velocityY: next.velocityY,
    grounded: false,
  };
}

function hasGroundAt(level: LevelDefinition, x: number): boolean {
  return level.terrain.some((segment) => segment.startX <= x && x <= segment.endX);
}

function getProgress(level: LevelDefinition, x: number): number {
  return Math.min(1, Math.max(0, (x - level.player.startX) / (level.finishX - level.player.startX)));
}

function getScore(level: LevelDefinition, x: number, completed: boolean): number {
  if (completed) return getMaximumScore(level);

  return Math.floor(Math.max(0, x - level.player.startX) / level.scoring.distancePerPoint);
}

function withRunMetrics(state: Omit<GameState, "progress" | "score">, level: LevelDefinition): GameState {
  const completed = state.phase === "completed";

  return {
    ...state,
    progress: completed ? 1 : getProgress(level, state.player.x),
    score: getScore(level, state.player.x, completed),
  };
}

export function createInitialGameState(level: LevelDefinition): GameState {
  return withRunMetrics(
    {
      phase: "ready",
      elapsedSeconds: 0,
      deathReason: null,
      player: {
        x: level.player.startX,
        y: level.groundY - level.player.height,
        velocityY: 0,
        grounded: true,
      },
    },
    level,
  );
}

function createDeadState(state: GameState, level: LevelDefinition, deathReason: "gap" | "obstacle"): GameState {
  return withRunMetrics({ ...state, phase: "dead", deathReason }, level);
}

function stepRunningGame(state: GameState, level: LevelDefinition, input: GameInput): GameState {
  const previousPlayer = state.player;
  const velocityY = input.jumpPressed && previousPlayer.grounded
    ? level.physics.jumpImpulse
    : previousPlayer.velocityY;
  const nextVelocityY = velocityY + level.physics.gravity * FIXED_TIME_STEP_SECONDS;
  const nextPlayer: PlayerState = {
    x: previousPlayer.x + level.physics.runSpeed * FIXED_TIME_STEP_SECONDS,
    y: previousPlayer.y + nextVelocityY * FIXED_TIME_STEP_SECONDS,
    velocityY: nextVelocityY,
    grounded: false,
  };
  const previousBounds = getPlayerBounds(previousPlayer, level);
  const nextBounds = getPlayerBounds(nextPlayer, level);
  const collision = level.obstacles.find((candidate) => (
    candidate.kind === "spire"
      ? sweptBoundsIntersectTriangle(previousBounds, nextBounds, getSpireTriangle(candidate, level))
      : sweptBoundsCollisionTime(previousBounds, nextBounds, getObstacleBounds(candidate, level)) !== undefined
  ));

  if (collision) {
    const collisionTime = collision.kind === "block"
      ? sweptBoundsCollisionTime(previousBounds, nextBounds, getObstacleBounds(collision, level))
      : undefined;
    return createDeadState(
      {
        ...state,
        player: collisionTime === undefined ? nextPlayer : interpolatePlayer(previousPlayer, nextPlayer, collisionTime),
        elapsedSeconds: state.elapsedSeconds + FIXED_TIME_STEP_SECONDS,
      },
      level,
      "obstacle",
    );
  }

  const playerCenterX = nextPlayer.x + level.player.width / 2;
  if (
    nextPlayer.velocityY >= 0 &&
    hasGroundAt(level, playerCenterX) &&
    nextPlayer.y + level.player.height >= level.groundY
  ) {
    nextPlayer.y = level.groundY - level.player.height;
    nextPlayer.velocityY = 0;
    nextPlayer.grounded = true;
  }

  const runningState = {
    ...state,
    player: nextPlayer,
    elapsedSeconds: state.elapsedSeconds + FIXED_TIME_STEP_SECONDS,
  };

  if (nextPlayer.x >= level.finishX) {
    return withRunMetrics(
      {
        ...runningState,
        phase: "completed",
        player: { ...nextPlayer, x: level.finishX },
      },
      level,
    );
  }
  if (nextPlayer.y >= level.world.height) return createDeadState(runningState, level, "gap");

  return withRunMetrics(runningState, level);
}

export function stepGame(state: GameState, level: LevelDefinition, input: GameInput = {}): GameState {
  if (input.restartPressed && (state.phase === "dead" || state.phase === "completed")) {
    return createInitialGameState(level);
  }
  if (state.phase === "dead" || state.phase === "completed") return state;
  if (state.phase === "ready") {
    if (!input.startPressed && !input.jumpPressed) return state;

    return stepRunningGame({ ...state, phase: "running" }, level, input);
  }

  return stepRunningGame(state, level, input);
}
