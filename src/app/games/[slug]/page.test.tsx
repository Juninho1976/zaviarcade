import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import GamePage from "./page";

vi.mock("@/features/auth/server/session", () => ({
  requirePlayer: vi.fn().mockResolvedValue({
    id: "user-1",
    displayName: "Zavi",
    role: "player",
    mustChangePassword: false,
  }),
}));

describe("GamePage", () => {
  it("renders the playable Zavi Dash run flow", async () => {
    const page = await GamePage({
      params: Promise.resolve({ slug: "zavi-dash" }),
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Zavi Dash");
    expect(markup).toContain("Playable level");
    expect(markup).toContain("Sunlit Sprint");
    expect(markup).toContain("Jump");
    expect(markup).toContain("Playing as Zavi");
  });
});
