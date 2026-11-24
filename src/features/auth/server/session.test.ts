import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(), context: vi.fn(), createAuth: vi.fn(), getSession: vi.fn(),
}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: mocks.context }));
vi.mock("./auth", () => ({ createAuth: mocks.createAuth }));

import { getAuthenticatedPlayer, getSession } from "./session";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.context.mockResolvedValue({ env: { DB: "database", AUTH_SECRET: "secret" } });
  mocks.createAuth.mockReturnValue({ api: { getSession: mocks.getSession } });
});

describe("session lookup", () => {
  it("skips authentication setup for visitors without cookies", async () => {
    mocks.headers.mockResolvedValue(new Headers());
    expect(await getAuthenticatedPlayer()).toBeNull();
    expect(mocks.context).not.toHaveBeenCalled();
    expect(mocks.createAuth).not.toHaveBeenCalled();
  });

  it.each(["__Secure-zavi-arcade.session_token=token", "zavi-arcade.session_token=token", "unrelated=value"])("still validates cookie-bearing requests: %s", async (cookie) => {
    const headers = new Headers({ cookie });
    mocks.headers.mockResolvedValue(headers);
    mocks.getSession.mockResolvedValue(null);
    expect(await getSession()).toBeNull();
    expect(mocks.getSession).toHaveBeenCalledWith({ headers });
  });

  it("preserves authenticated identity and rejects disabled players", async () => {
    mocks.headers.mockResolvedValue(new Headers({ cookie: "__Secure-zavi-arcade.session_token=token" }));
    mocks.getSession.mockResolvedValue({ user: { id: "player-1", name: "Player", role: "admin", mustChangePassword: true } });
    expect(await getAuthenticatedPlayer()).toEqual({ id: "player-1", displayName: "Player", role: "admin", mustChangePassword: true });
    mocks.getSession.mockResolvedValue({ user: { id: "player-1", name: "Player", banned: true } });
    expect(await getAuthenticatedPlayer()).toBeNull();
  });
});
