import { readFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getPlatformProxy } from "wrangler";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getLeaderboard } from "./get-leaderboard";
import { processScoreSubmission } from "./process-score-submission";

let proxy: Awaited<ReturnType<typeof getPlatformProxy<{ DB: D1Database }>>>;

async function applyMigration(path: string) {
  const statements = readFileSync(path, "utf8")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement && !statement.startsWith("PRAGMA"));
  for (const statement of statements) await proxy.env.DB.prepare(statement).run();
}

beforeAll(async () => {
  proxy = await getPlatformProxy<{ DB: D1Database }>({ configPath: "wrangler.jsonc", persist: { path: await mkdtemp(join(tmpdir(), "zaviarcade-d1-")) } });
  await applyMigration("migrations/0001_initial_schema.sql");
  await applyMigration("migrations/0002_seed_geometry_dash.sql");
});
afterAll(async () => proxy.dispose());

describe("local D1 score submission", () => {
  it("persists a submitted score and returns it through the leaderboard", async () => {
    const result = await processScoreSubmission(proxy.env.DB, "geometry-dash", { playerName: "Zavi", score: 987_650 });
    expect(result).toMatchObject({ success: true, status: 201 });
    if (!result.success) throw new Error(result.message);
    const leaderboard = await getLeaderboard(proxy.env.DB, "geometry-dash");
    expect(leaderboard).toContainEqual({ playerName: "Zavi", rank: 1, score: 987_650 });
    const stored = await proxy.env.DB.prepare("SELECT id FROM scores WHERE id = ?").bind(result.scoreId).first<{ id: number }>();
    expect(stored?.id).toBe(result.scoreId);
  });
});
