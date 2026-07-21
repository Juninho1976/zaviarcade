import type { ScoreSubmission } from "./submit-score";

type QueryResult<T> = { results: T[]; meta: { last_row_id?: number } };
type Database = { prepare(query: string): { bind(...values: unknown[]): { all<T>(): Promise<QueryResult<T>>; run(): Promise<QueryResult<never>> } } };
type IdRow = { id: number };

export async function persistScore(database: Database, slug: string, submission: ScoreSubmission) {
  const game = await database.prepare("SELECT id FROM games WHERE slug = ?").bind(slug).all<IdRow>();
  const gameId = game.results[0]?.id;
  if (!gameId) return { success: false as const, message: "Game not found." };

  await database.prepare("INSERT OR IGNORE INTO players (display_name) VALUES (?)").bind(submission.playerName).run();
  const player = await database.prepare("SELECT id FROM players WHERE display_name = ?").bind(submission.playerName).all<IdRow>();
  const playerId = player.results[0]?.id;
  if (!playerId) return { success: false as const, message: "Player could not be created." };

  const score = await database.prepare("INSERT INTO scores (game_id, player_id, score) VALUES (?, ?, ?)").bind(gameId, playerId, submission.score).run();
  return { success: true as const, scoreId: score.meta.last_row_id };
}
