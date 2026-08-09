import { readdirSync, readFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getPlatformProxy } from "wrangler";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getLeaderboard } from "./get-leaderboard";
import { processScoreSubmission } from "./process-score-submission";
import { createAuth } from "@/features/auth/server/auth";

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

    await proxy.env.DB.prepare(
      `INSERT INTO "user" (id, name, email, emailVerified, createdAt, updatedAt, username, role, banned, mustChangePassword)
       VALUES (?, ?, ?, 0, ?, ?, ?, 'user', 0, 0)`,
    ).bind("user-zavi", "Zavi", "zavi@players.invalid", Date.now(), Date.now(), "zavi").run();
    const result = await processScoreSubmission(proxy.env.DB, "zavi-dash", "user-zavi", {
      score: 1_086,
      submissionId: "123e4567-e89b-42d3-a456-426614174000",
    });
    expect(result).toMatchObject({ success: true, status: 201 });
    if (!result.success) throw new Error(result.message);
    const leaderboard = await getLeaderboard(proxy.env.DB, "zavi-dash");
    expect(leaderboard).toContainEqual(expect.objectContaining({
      playerName: "Zavi",
      rank: 1,
      score: 1_086,
      scoredAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
    }));
    const stored = await proxy.env.DB.prepare("SELECT id FROM scores WHERE id = ?").bind(result.scoreId).first<{ id: number }>();
    expect(stored?.id).toBe(result.scoreId);
  });

  it("seeds George (Pac) Man with its own score stream and leaderboard", async () => {
    const game = await proxy.env.DB.prepare(
      "SELECT slug, name, status FROM games WHERE slug = ?",
    ).bind("georges-pac-man").first<{ name: string; slug: string; status: string }>();
    expect(game).toEqual({ name: "George (Pac) Man", slug: "georges-pac-man", status: "live" });

    const now = Date.now();
    await proxy.env.DB.prepare(
      `INSERT INTO "user" (id, name, email, emailVerified, createdAt, updatedAt, username, role, banned, mustChangePassword)
       VALUES (?, ?, ?, 0, ?, ?, ?, 'user', 0, 0)`,
    ).bind("user-george", "George", "george@players.invalid", now, now, "george").run();
    await expect(processScoreSubmission(proxy.env.DB, "georges-pac-man", "user-george", {
      score: 4_250,
      submissionId: "323e4567-e89b-42d3-a456-426614174000",
    })).resolves.toMatchObject({ success: true, status: 201 });

    const leaderboard = await getLeaderboard(proxy.env.DB, "georges-pac-man");
    expect(leaderboard).toContainEqual(expect.objectContaining({
      playerName: "George",
      rank: 1,
      score: 4_250,
    }));
    const zaviDashLeaderboard = await getLeaderboard(proxy.env.DB, "zavi-dash");
    expect(zaviDashLeaderboard).not.toContainEqual(expect.objectContaining({ playerName: "George" }));
  });

  it("stores a retried completion once and supports duplicate display names", async () => {
    const submissionId = "223e4567-e89b-42d3-a456-426614174000";
    const now = Date.now();
    await proxy.env.DB.prepare(
      `INSERT INTO "user" (id, name, email, emailVerified, createdAt, updatedAt, username, role, banned, mustChangePassword)
       VALUES (?, 'Shared Name', ?, 0, ?, ?, ?, 'user', 0, 0), (?, 'Shared Name', ?, 0, ?, ?, ?, 'user', 0, 0)`,
    ).bind("user-a", "a@players.invalid", now, now, "player-a", "user-b", "b@players.invalid", now, now, "player-b").run();
    await expect(processScoreSubmission(proxy.env.DB, "zavi-dash", "user-a", { score: 1_086, submissionId })).resolves.toMatchObject({ success: true, status: 201 });
    await expect(processScoreSubmission(proxy.env.DB, "zavi-dash", "user-a", { score: 1_086, submissionId })).resolves.toMatchObject({ success: true, status: 201 });
    const players = await proxy.env.DB.prepare(`SELECT id FROM "user" WHERE name = ?`).bind("Shared Name").all<{ id: string }>();
    const scores = await proxy.env.DB.prepare("SELECT id FROM scores WHERE submission_id = ?").bind(submissionId).all<{ id: number }>();

    expect(players.results).toHaveLength(2);
    expect(scores.results).toHaveLength(1);
  });
});

describe("local D1 account authentication", () => {
  it("lets an administrator create a player with a five-character password and that player sign in", async () => {
    const auth = createAuth(proxy.env.DB, "test-secret-that-is-at-least-32-characters", true);
    const adminSignup = await auth.handler(new Request("http://localhost/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "create-player-admin@players.invalid",
        name: "Create Player Admin",
        password: "Adm1n",
        username: "create-player-admin",
        mustChangePassword: false,
      }),
    }));
    expect(adminSignup.status).toBe(200);
    const adminUser = await proxy.env.DB.prepare(
      `SELECT id FROM "user" WHERE username = ?`,
    ).bind("create-player-admin").first<{ id: string }>();
    expect(adminUser?.id).toBeTruthy();
    await proxy.env.DB.prepare(`UPDATE "user" SET role = 'admin' WHERE id = ?`).bind(adminUser!.id).run();

    const adminSignIn = await auth.handler(new Request("http://localhost/api/auth/sign-in/username", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "create-player-admin", password: "Adm1n" }),
    }));
    expect(adminSignIn.status).toBe(200);
    const adminCookie = adminSignIn.headers.get("set-cookie")?.split(";", 1)[0];
    expect(adminCookie).toBeTruthy();

    await expect(auth.api.createUser({
      body: {
        email: "created-player@players.invalid",
        name: "Created Player",
        password: "P7ayr",
        role: "user",
        data: {
          username: "created-player",
          displayUsername: "created-player",
          mustChangePassword: true,
        },
      },
      headers: new Headers({ cookie: adminCookie! }),
    })).resolves.toMatchObject({ user: { username: "created-player" } });

    const playerSignIn = await auth.handler(new Request("http://localhost/api/auth/sign-in/username", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "created-player", password: "P7ayr" }),
    }));
    expect(playerSignIn.status).toBe(200);
  });

  it("hashes passwords, signs in by username and creates a secure server session", async () => {
    const auth = createAuth(proxy.env.DB, "test-secret-that-is-at-least-32-characters", true);
    const signup = await auth.handler(new Request("http://localhost/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "auth-test@players.invalid",
        name: "Auth Tester",
        password: "temporary-password-123",
        username: "auth-tester",
        mustChangePassword: true,
      }),
    }));
    expect(signup.status).toBe(200);
    const account = await proxy.env.DB.prepare(
      `SELECT password FROM account WHERE providerId = 'credential' AND userId = (SELECT id FROM "user" WHERE username = ?)`,
    ).bind("auth-tester").first<{ password: string }>();
    expect(account?.password).toBeTruthy();
    expect(account?.password).not.toContain("temporary-password-123");

    const signIn = await auth.handler(new Request("http://localhost/api/auth/sign-in/username", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "auth-tester", password: "temporary-password-123" }),
    }));
    expect(signIn.status).toBe(200);
    const cookie = signIn.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("temporary-password-123");
  });

  it("keeps public registration disabled in the normal auth configuration", async () => {
    const auth = createAuth(proxy.env.DB, "test-secret-that-is-at-least-32-characters");
    const response = await auth.handler(new Request("http://localhost/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "blocked@players.invalid",
        name: "Blocked",
        password: "temporary-password-123",
        username: "blocked-player",
      }),
    }));
    expect(response.status).toBe(404);
  });

  it("rate-limits repeated username login failures in shared D1 state", async () => {
    const auth = createAuth(proxy.env.DB, "test-secret-that-is-at-least-32-characters");
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await auth.handler(new Request("http://localhost/api/auth/sign-in/username", {
        method: "POST",
        headers: {
          "x-forwarded-for": "203.0.113.77",
          "content-type": "application/json",
        },
        body: JSON.stringify({ username: "does-not-exist", password: "wrong-password-123" }),
      }));
      statuses.push(response.status);
    }
    expect(statuses.slice(0, 5)).not.toContain(429);
    expect(statuses[5]).toBe(429);
  });

  it("prevents a disabled account from signing in", async () => {
    const auth = createAuth(proxy.env.DB, "test-secret-that-is-at-least-32-characters", true);
    await auth.handler(new Request("http://localhost/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "disabled@players.invalid",
        name: "Disabled Player",
        password: "temporary-password-123",
        username: "disabled-player",
      }),
    }));
    await proxy.env.DB.prepare(`UPDATE "user" SET banned = 1 WHERE username = ?`).bind("disabled-player").run();
    const response = await auth.handler(new Request("http://localhost/api/auth/sign-in/username", {
      method: "POST",
      headers: {
        "x-forwarded-for": "203.0.113.88",
        "content-type": "application/json",
      },
      body: JSON.stringify({ username: "disabled-player", password: "temporary-password-123" }),
    }));
    expect(response.status).toBe(403);
  });
});
