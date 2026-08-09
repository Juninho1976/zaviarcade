import type { GridPosition } from "@/features/georges-pac-man/domain/game";

export const georgesPacManMaze = [
  "###############",
  "#o....#.#....o#",
  "#.###.#.#.###.#",
  "#.....#.#.....#",
  "###.#.....#.###",
  "#...#.###.#...#",
  "#.#...G.G...#.#",
  "#.#.###.###.#.#",
  "#....G.P.G....#",
  "#.#.###.###.#.#",
  "#.#.........#.#",
  "#...#.###.#...#",
  "###.#.....#.###",
  "#o....#.#....o#",
  "###############",
] as const;

export const georgesPacManPlayerSpawn: GridPosition = { column: 7, row: 8 };
export const georgesPacManGhostSpawns: readonly GridPosition[] = [
  { column: 6, row: 6 },
  { column: 8, row: 6 },
  { column: 5, row: 8 },
  { column: 9, row: 8 },
];

export function positionKey(position: GridPosition): string {
  return `${position.row},${position.column}`;
}

export function isMazeWalkable(position: GridPosition): boolean {
  return georgesPacManMaze[position.row]?.[position.column] !== undefined &&
    georgesPacManMaze[position.row][position.column] !== "#";
}
