import { describe, expect, it } from "vitest";
import {
  GEORGES_PAC_MAN_DURATION_SECONDS,
  type Direction,
  type GeorgesPacManState,
  type GridPosition,
} from "@/features/georges-pac-man/domain/game";
import { georgesPacManMaze, isMazeWalkable, positionKey } from "@/features/georges-pac-man/data/maze";
import { createInitialGeorgesPacManState, stepGeorgesPacMan } from "./game-engine";

const directionSteps: readonly [Direction, number, number][] = [
  ["up", -1, 0],
  ["left", 0, -1],
  ["down", 1, 0],
  ["right", 0, 1],
];

function findPath(start: GridPosition, targets: ReadonlySet<string>): Direction[] {
  const queue: { path: Direction[]; position: GridPosition }[] = [{ path: [], position: start }];
  const visited = new Set([positionKey(start)]);
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (targets.has(positionKey(current.position))) return current.path;
    for (const [direction, rowDelta, columnDelta] of directionSteps) {
      const position = {
        column: current.position.column + columnDelta,
        row: current.position.row + rowDelta,
      };
      const key = positionKey(position);
      if (!visited.has(key) && isMazeWalkable(position)) {
        visited.add(key);
        queue.push({ path: [...current.path, direction], position });
      }
    }
  }
  return [];
}

describe("George (Pac) Man game engine", () => {
  it("uses a fully connected compact maze with four power pellets", () => {
    const initial = createInitialGeorgesPacManState();
    const reachable = new Set([positionKey(initial.player)]);
    const queue: GridPosition[] = [initial.player];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      for (const [, rowDelta, columnDelta] of directionSteps) {
        const position = { column: current.column + columnDelta, row: current.row + rowDelta };
        const key = positionKey(position);
        if (!reachable.has(key) && isMazeWalkable(position)) {
          reachable.add(key);
          queue.push(position);
        }
      }
    }
    const walkableTiles = georgesPacManMaze.flatMap((row, rowIndex) => [...row]
      .map((tile, column) => tile === "#" ? null : positionKey({ column, row: rowIndex }))
      .filter((key): key is string => key !== null));

    expect(reachable.size).toBe(walkableTiles.length);
    expect(initial.powerPellets).toHaveLength(4);
    expect(initial.pellets.length).toBeGreaterThan(80);
  });

  it("buffers turns, moves George, and eats pellets", () => {
    let state = createInitialGeorgesPacManState();
    state = stepGeorgesPacMan(state, { direction: "up" }, 0.13);

    expect(state.phase).toBe("playing");
    expect(state.player).toMatchObject({ column: 7, row: 7, direction: "up" });
    expect(state.score).toBe(10);
  });

  it("makes ghosts edible after a power pellet", () => {
    const initial = createInitialGeorgesPacManState();
    const ghost = { ...initial.ghosts[0], column: 6, row: 8 };
    const state: GeorgesPacManState = {
      ...initial,
      ghosts: [ghost],
      phase: "playing",
      player: { ...initial.player, direction: "left", nextDirection: "left" },
      playerMoveAccumulator: 0.129,
      powerSeconds: 4,
    };
    const next = stepGeorgesPacMan(state, {}, 0.001);

    expect(next.score).toBe(210);
    expect(next.ghostCombo).toBe(1);
    expect(next.ghosts[0].recoveringSeconds).toBeGreaterThan(0);
    expect(next.status).toContain("Ghost gobbled");
  });

  it("loses a life on an ordinary ghost collision", () => {
    const initial = createInitialGeorgesPacManState();
    const state: GeorgesPacManState = {
      ...initial,
      ghosts: [{ ...initial.ghosts[0], column: 6, row: 8 }],
      phase: "playing",
      player: { ...initial.player, direction: "left", nextDirection: "left" },
      playerMoveAccumulator: 0.129,
    };
    const next = stepGeorgesPacMan(state, {}, 0.001);

    expect(next.lives).toBe(2);
    expect(next.phase).toBe("playing");
    expect(next.player).toMatchObject({ column: 7, row: 8 });
  });

  it("can clear every pellet comfortably inside the two-minute limit", () => {
    let state: GeorgesPacManState = { ...createInitialGeorgesPacManState(), ghosts: [] };
    let moves = 0;
    while (state.phase !== "won" && moves < 1_000) {
      const targets = new Set([...state.pellets, ...state.powerPellets]);
      const path = findPath(state.player, targets);
      expect(path.length).toBeGreaterThan(0);
      for (const direction of path) {
        state = stepGeorgesPacMan(state, { direction }, 0.13);
        moves += 1;
        if (state.phase === "won") break;
      }
    }

    expect(state.phase).toBe("won");
    expect(state.elapsedSeconds).toBeLessThan(GEORGES_PAC_MAN_DURATION_SECONDS);
    expect(moves).toBeLessThan(600);
  });

  it("ends the run when the two-minute clock expires", () => {
    const state = stepGeorgesPacMan(
      { ...createInitialGeorgesPacManState(), phase: "playing" },
      {},
      GEORGES_PAC_MAN_DURATION_SECONDS,
    );

    expect(state).toMatchObject({ phase: "lost", status: "Time’s up — try another route!" });
  });

  it("buffers an early turn until George reaches the next opening", () => {
    let state = createInitialGeorgesPacManState();
    state = stepGeorgesPacMan(state, { direction: "up" }, 0.13);
    state = stepGeorgesPacMan(state, { direction: "right" }, 0.13);

    expect(state.player).toMatchObject({ column: 7, row: 6, direction: "up", nextDirection: "right" });

    state = stepGeorgesPacMan(state, {}, 0.13);
    expect(state.player).toMatchObject({ column: 8, row: 6, direction: "right" });
  });

  it("ends an unfinished run with its current score intact", () => {
    const playing = { ...createInitialGeorgesPacManState(), phase: "playing" as const, score: 280 };
    const ended = stepGeorgesPacMan(playing, { endRunPressed: true }, 0);

    expect(ended).toMatchObject({
      phase: "lost",
      score: 280,
      status: "Run ended — your score still counts!",
    });
  });
});
