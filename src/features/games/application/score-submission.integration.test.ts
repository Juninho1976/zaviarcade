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
    const game = await proxy.env.DB.prepare("SELECT id, slug, name, status FROM games").first<{ id: number; name: string; slug: string; status: string }>();
    expect(game).toEqual({ id: 1, name: "Zavi Dash", slug: "zavi-dash", status: "live" });

    const result = await processScoreSubmission(proxy.env.DB, "zavi-dash", {
      playerName: "Zavi",
      score: 1_086,
      submissionId: "123e4567-e89b-42d3-a456-426614174000",
    });
    expect(result).toMatchObject({ success: true, status: 201 });
    if (!result.success) throw new Error(result.message);
    const leaderboard = await getLeaderboard(proxy.env.DB, "zavi-dash");
    expect(leaderboard).toContainEqual({ playerName: "Zavi", rank: 1, score: 1_086 });
    const stored = await proxy.env.DB.prepare("SELECT id FROM scores WHERE id = ?").bind(result.scoreId).first<{ id: number }>();
    expect(stored?.id).toBe(result.scoreId);
  });

  it("reuses the normalized player and stores a retried completion exactly once", async () => {
    const submissionId = "223e4567-e89b-42d3-a456-426614174000";
    await expect(processScoreSubmission(proxy.env.DB, "zavi-dash", { playerName: "Zavi Family", score: 1_086, submissionId })).resolves.toMatchObject({ success: true, status: 201 });
    await expect(processScoreSubmission(proxy.env.DB, "zavi-dash", { playerName: " Zavi Family ", score: 1_086, submissionId })).resolves.toMatchObject({ success: true, status: 201 });
    const players = await proxy.env.DB.prepare("SELECT id FROM players WHERE display_name = ?").bind("Zavi Family").all<{ id: number }>();
    const scores = await proxy.env.DB.prepare("SELECT id FROM scores WHERE submission_id = ?").bind(submissionId).all<{ id: number }>();

    expect(players.results).toHaveLength(1);
    expect(scores.results).toHaveLength(1);
  });
});
