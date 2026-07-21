import { readdirSync, readFileSync } from "node:fs";
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
  for (const migration of readdirSync("migrations").sort()) {
    await applyMigration(`migrations/${migration}`);
  }
});
afterAll(async () => proxy.dispose());

describe("local D1 score submission", () => {
  it("persists a submitted score and returns it through the leaderboard", async () => {
    const game = await proxy.env.DB.prepare("SELECT id, slug, name FROM games").first<{ id: number; name: string; slug: string }>();
    expect(game).toEqual({ id: 1, name: "Zavi Dash", slug: "zavi-dash" });

    const result = await processScoreSubmission(proxy.env.DB, "zavi-dash", { playerName: "Zavi", score: 987_650 });
    expect(result).toMatchObject({ success: true, status: 201 });
    if (!result.success) throw new Error(result.message);
    const leaderboard = await getLeaderboard(proxy.env.DB, "zavi-dash");
    expect(leaderboard).toContainEqual({ playerName: "Zavi", rank: 1, score: 987_650 });
    const stored = await proxy.env.DB.prepare("SELECT id FROM scores WHERE id = ?").bind(result.scoreId).first<{ id: number }>();
    expect(stored?.id).toBe(result.scoreId);
  });
});
