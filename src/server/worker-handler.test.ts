import { describe, expect, it, vi } from "vitest";
import { createWorker } from "./worker-handler";

const env = {} as CloudflareEnv;
const ctx = {} as ExecutionContext;

describe("Worker scan protection", () => {
  it.each([
    "/.trash7206/index.php", "/xmlrpc.php?rsd", "/sito/wp-includes/wlwmanifest.xml",
    "/.env", "/.env.production", "/.git/config", "/admin.PHP/login",
    "/%2eenv", "/%77p-admin/install.php", "/invalid%zz",
  ])("rejects %s without loading the application", async (path) => {
    const loadApplication = vi.fn();
    const response = await createWorker(loadApplication).fetch(new Request(`https://zaviarcade.com${path}`), env, ctx);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
    expect(loadApplication).not.toHaveBeenCalled();
  });

  it.each([
    "/", "/login", "/games/zavi-dash", "/games/zavi-dash/leaderboard",
    "/api/auth/sign-in/username", "/api/games/zavi-dash/scores",
    "/_next/static/chunk.js", "/images/games/zavi-dash.svg",
    "/.well-known/acme-challenge/token", "/ordinary-missing-page",
  ])("preserves app handling for %s", async (path) => {
    const response = new Response("application response");
    const fetch = vi.fn().mockResolvedValue(response);
    const request = new Request(`https://zaviarcade.com${path}`);
    expect(await createWorker(async () => ({ default: { fetch } })).fetch(request, env, ctx)).toBe(response);
    expect(fetch).toHaveBeenCalledWith(request, env, ctx);
  });
});
