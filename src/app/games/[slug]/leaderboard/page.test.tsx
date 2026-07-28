import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLeaderboard } from "@/features/games/application/get-leaderboard";
import LeaderboardPage from "./page";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn().mockResolvedValue({ env: { DB: {} } }),
}));
vi.mock("@/features/games/application/get-leaderboard", () => ({
  getLeaderboard: vi.fn(),
}));

const getLeaderboardMock = vi.mocked(getLeaderboard);

describe("LeaderboardPage", () => {
  beforeEach(() => {
    getLeaderboardMock.mockReset();
  });

  it("invites the first player when a live leaderboard is empty", async () => {
    getLeaderboardMock.mockResolvedValue([]);

    const page = await LeaderboardPage({ params: Promise.resolve({ slug: "zavi-dash" }) });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("No scores yet.");
    expect(markup).toContain("be the first on the leaderboard");
    expect(markup).not.toContain("when Zavi Dash is live");
  });

  it("renders scores returned by D1", async () => {
    getLeaderboardMock.mockResolvedValue([{ playerName: "Zavi", rank: 1, score: 1_086 }]);

    const page = await LeaderboardPage({ params: Promise.resolve({ slug: "zavi-dash" }) });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Zavi");
    expect(markup).toContain("1,086");
    expect(markup).toContain("#1");
  });
});
