import type { LeaderboardEntry } from "@/features/games/domain/game";

type LeaderboardRow = { playerName: string; rank: number; score: number };
type Database = { prepare(query: string): { bind(...values: unknown[]): { all<T>(): Promise<{ results: T[] }> } } };

export async function getLeaderboard(database: Database, slug: string): Promise<readonly LeaderboardEntry[]> {
  const result = await database.prepare(`
    SELECT p.display_name AS playerName, s.score,
      ROW_NUMBER() OVER (ORDER BY s.score DESC, s.id ASC) AS rank
    FROM scores s
    JOIN games g ON g.id = s.game_id
    JOIN players p ON p.id = s.player_id
    WHERE g.slug = ?
    ORDER BY s.score DESC, s.id ASC
  `).bind(slug).all<LeaderboardRow>();
  return result.results;
}
