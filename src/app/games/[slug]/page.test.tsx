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

  it("renders Zavi Dash 2 with its harder level", async () => {
    const page = await GamePage({
      params: Promise.resolve({ slug: "zavi-dash-2" }),
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Zavi Dash 2");
    expect(markup).toContain("Neon Gauntlet");
    expect(markup).toContain("Jump");
    expect(markup).toContain("Playing as Zavi");
  });

  it("renders George (Pac) Man with touch-friendly maze controls", async () => {
    const page = await GamePage({
      params: Promise.resolve({ slug: "georges-pac-man" }),
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("George (Pac) Man");
    expect(markup).toContain("Clear the maze with George Man!");
    expect(markup).toContain("Move up");
    expect(markup).toContain("Move right");
    expect(markup).toContain("Playing as Zavi");
  });

  it("renders Rak Asteroids with touch-friendly flight controls", async () => {
    const page = await GamePage({
      params: Promise.resolve({ slug: "rak-asteroids" }),
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Rak Asteroids");
    expect(markup).toContain("Clear Rak’s asteroid field!");
    expect(markup).toContain("Rotate left");
    expect(markup).toContain("Fire laser");
    expect(markup).toContain("Playing as Zavi");
  });
});
