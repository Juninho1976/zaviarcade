import {
  GEORGES_PAC_MAN_DURATION_SECONDS,
  GEORGES_PAC_MAN_STEP_SECONDS,
  type Direction,
  type GeorgesPacManInput,
  type GeorgesPacManState,
  type GhostState,
  type GridPosition,
} from "@/features/georges-pac-man/domain/game";
import {
  georgesPacManGhostSpawns,
  georgesPacManMaze,
  georgesPacManPlayerSpawn,
  isMazeWalkable,
  positionKey,
} from "@/features/georges-pac-man/data/maze";

const PLAYER_MOVE_SECONDS = 0.13;
const GHOST_MOVE_SECONDS = 0.21;
const POWER_SECONDS = 8;
const directions: readonly Direction[] = ["up", "left", "down", "right"];
const ghostColors = ["#fb7185", "#22d3ee", "#f0abfc", "#fb923c"] as const;
const opposite: Record<Direction, Direction> = { down: "up", left: "right", right: "left", up: "down" };

function move(position: GridPosition, direction: Direction): GridPosition {
  if (direction === "up") return { ...position, row: position.row - 1 };
  if (direction === "down") return { ...position, row: position.row + 1 };
  if (direction === "left") return { ...position, column: position.column - 1 };
  return { ...position, column: position.column + 1 };
}

function createGhosts(): readonly GhostState[] {
  return georgesPacManGhostSpawns.map((spawn, index) => ({
    ...spawn,
    color: ghostColors[index],
    direction: index % 2 === 0 ? "left" : "right",
    id: `ghost-${index + 1}`,
    recoveringSeconds: 0,
    spawn,
  }));
}

function collectMazeItems(tile: "." | "o"): string[] {
  const items: string[] = [];
  for (const [row, line] of georgesPacManMaze.entries()) {
    for (const [column, value] of [...line].entries()) {
      if (value === tile) items.push(positionKey({ column, row }));
    }
  }
  return items;
}

export function createInitialGeorgesPacManState(): GeorgesPacManState {
  return {
    elapsedSeconds: 0,
    ghostCombo: 0,
    ghostMoveAccumulator: 0,
    ghosts: createGhosts(),
    invulnerableSeconds: 0,
    lives: 3,
    pellets: collectMazeItems("."),
    phase: "ready",
    player: { ...georgesPacManPlayerSpawn, direction: null, nextDirection: null },
    playerMoveAccumulator: 0,
    powerPellets: collectMazeItems("o"),
    powerSeconds: 0,
    score: 0,
    status: "Choose a direction to start!",
  };
}

function movePlayer(state: GeorgesPacManState): GeorgesPacManState {
  const preferred = state.player.nextDirection;
  const current = state.player.direction;
  const direction = preferred && isMazeWalkable(move(state.player, preferred))
    ? preferred
    : current && isMazeWalkable(move(state.player, current))
      ? current
      : null;
  if (!direction) return state;

  const player = { ...move(state.player, direction), direction, nextDirection: preferred };
  const key = positionKey(player);
  const atePellet = state.pellets.includes(key);
  const atePowerPellet = state.powerPellets.includes(key);

  return {
    ...state,
    ghostCombo: atePowerPellet ? 0 : state.ghostCombo,
    pellets: atePellet ? state.pellets.filter((pellet) => pellet !== key) : state.pellets,
    player,
    powerPellets: atePowerPellet
      ? state.powerPellets.filter((pellet) => pellet !== key)
      : state.powerPellets,
    powerSeconds: atePowerPellet ? POWER_SECONDS : state.powerSeconds,
    score: state.score + (atePowerPellet ? 50 : atePellet ? 10 : 0),
    status: atePowerPellet ? "Power pellet! Chase the ghosts!" : state.status,
  };
}

function distance(first: GridPosition, second: GridPosition): number {
  return Math.abs(first.column - second.column) + Math.abs(first.row - second.row);
}

function ghostTarget(state: GeorgesPacManState, index: number): GridPosition {
  const playerDirection = state.player.direction ?? "left";
  if (index === 1) {
    let target: GridPosition = state.player;
    for (let step = 0; step < 3; step += 1) target = move(target, playerDirection);
    return target;
  }
  if (index === 2) {
    return {
      column: georgesPacManMaze[0].length - 1 - state.player.column,
      row: georgesPacManMaze.length - 1 - state.player.row,
    };
  }
  if (index === 3 && Math.floor(state.elapsedSeconds / 6) % 2 === 0) return { column: 1, row: 13 };
  return state.player;
}

function moveGhost(state: GeorgesPacManState, ghost: GhostState, index: number): GhostState {
  if (ghost.recoveringSeconds > 0) return ghost;
  const valid = directions.filter((direction) => isMazeWalkable(move(ghost, direction)));
  const withoutReverse = valid.filter((direction) => direction !== opposite[ghost.direction]);
  const choices = withoutReverse.length > 0 ? withoutReverse : valid;
  const target = ghostTarget(state, index);
  const frightened = state.powerSeconds > 0;
  const chosen = choices.reduce((best, direction) => {
    const bestDistance = distance(move(ghost, best), target);
    const candidateDistance = distance(move(ghost, direction), target);
    if (frightened ? candidateDistance > bestDistance : candidateDistance < bestDistance) return direction;
    return best;
  }, choices[(index + Math.floor(state.elapsedSeconds)) % choices.length] ?? ghost.direction);
  return { ...ghost, ...move(ghost, chosen), direction: chosen };
}

function resetActors(state: GeorgesPacManState): GeorgesPacManState {
  return {
    ...state,
    ghosts: createGhosts(),
    ghostMoveAccumulator: 0,
    player: { ...georgesPacManPlayerSpawn, direction: null, nextDirection: null },
    playerMoveAccumulator: 0,
    powerSeconds: 0,
  };
}

function resolveCollisions(state: GeorgesPacManState): GeorgesPacManState {
  let next = state;
  for (const [index, ghost] of next.ghosts.entries()) {
    if (ghost.recoveringSeconds > 0 || positionKey(ghost) !== positionKey(next.player)) continue;
    if (next.powerSeconds > 0) {
      const points = 200 * 2 ** next.ghostCombo;
      next = {
        ...next,
        ghostCombo: next.ghostCombo + 1,
        ghosts: next.ghosts.map((candidate, ghostIndex) => ghostIndex === index
          ? { ...candidate, ...candidate.spawn, recoveringSeconds: 1.5 }
          : candidate),
        score: next.score + points,
        status: `Ghost gobbled! +${points}`,
      };
    } else if (next.invulnerableSeconds <= 0) {
      const lives = next.lives - 1;
      if (lives === 0) return { ...next, lives, phase: "lost", status: "The ghosts caught George!" };
      next = resetActors({
        ...next,
        invulnerableSeconds: 1.5,
        lives,
        status: `${lives} ${lives === 1 ? "life" : "lives"} left — keep going!`,
      });
      break;
    }
  }
  return next;
}

export function stepGeorgesPacMan(
  state: GeorgesPacManState,
  input: GeorgesPacManInput = {},
  seconds = GEORGES_PAC_MAN_STEP_SECONDS,
): GeorgesPacManState {
  if (input.endRunPressed && state.phase === "playing") {
    return { ...state, phase: "lost", status: "Run ended — your score still counts!" };
  }
  if (input.restartPressed && (state.phase === "lost" || state.phase === "won")) {
    return createInitialGeorgesPacManState();
  }
  if (state.phase === "lost" || state.phase === "won") return state;

  const nextDirection = input.direction ?? state.player.nextDirection;
  const starting = state.phase === "ready" && (input.startPressed || input.direction);
  if (state.phase === "ready" && !starting) return { ...state, player: { ...state.player, nextDirection } };

  let next: GeorgesPacManState = {
    ...state,
    elapsedSeconds: Math.min(GEORGES_PAC_MAN_DURATION_SECONDS, state.elapsedSeconds + seconds),
    ghostMoveAccumulator: state.ghostMoveAccumulator + seconds,
    ghosts: state.ghosts.map((ghost) => ({
      ...ghost,
      recoveringSeconds: Math.max(0, ghost.recoveringSeconds - seconds),
    })),
    invulnerableSeconds: Math.max(0, state.invulnerableSeconds - seconds),
    phase: "playing",
    player: { ...state.player, nextDirection },
    playerMoveAccumulator: state.playerMoveAccumulator + seconds,
    powerSeconds: Math.max(0, state.powerSeconds - seconds),
    status: state.phase === "ready" ? "Clear every pellet!" : state.status,
  };

  while (next.playerMoveAccumulator >= PLAYER_MOVE_SECONDS) {
    next = movePlayer({ ...next, playerMoveAccumulator: next.playerMoveAccumulator - PLAYER_MOVE_SECONDS });
    next = resolveCollisions(next);
    if (next.phase === "lost") return next;
  }
  while (next.ghostMoveAccumulator >= GHOST_MOVE_SECONDS) {
    next = {
      ...next,
      ghostMoveAccumulator: next.ghostMoveAccumulator - GHOST_MOVE_SECONDS,
      ghosts: next.ghosts.map((ghost, index) => moveGhost(next, ghost, index)),
    };
    next = resolveCollisions(next);
    if (next.phase === "lost") return next;
  }

  if (next.pellets.length === 0 && next.powerPellets.length === 0) {
    const timeBonus = Math.ceil(GEORGES_PAC_MAN_DURATION_SECONDS - next.elapsedSeconds) * 25;
    const livesBonus = next.lives * 500;
    return {
      ...next,
      phase: "won",
      score: next.score + timeBonus + livesBonus,
      status: `Maze cleared! +${timeBonus + livesBonus} bonus`,
    };
  }
  if (next.elapsedSeconds >= GEORGES_PAC_MAN_DURATION_SECONDS) {
    return { ...next, phase: "lost", status: "Time’s up — try another route!" };
  }
  return next;
}
