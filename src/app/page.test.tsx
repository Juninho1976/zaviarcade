import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/features/community/server/comments", () => ({ listCommunityComments: vi.fn().mockResolvedValue([]) }));
vi.mock("@/features/auth/server/session", () => ({ getAuthenticatedPlayer: vi.fn().mockResolvedValue(null) }));

describe("Home", () => {
  it("welcomes visitors and presents Zavi Dash before future games", async () => {
    const page = renderToStaticMarkup(await Home());

    expect(page).toContain("Welcome to Zavi Arcade.");
    expect(page).toContain(
      "Experience designed by Zavi and built by Zavi and family.",
    );
    expect(page).toContain("Ready to play");
    expect(page).toContain("Mystery Game");
    expect(page).toContain("Your Next Challenge");
    expect(page).toContain("Community Comments");
    expect(page.indexOf("Zavi Dash")).toBeLessThan(
      page.indexOf("Mystery Game"),
    );
  });
});
