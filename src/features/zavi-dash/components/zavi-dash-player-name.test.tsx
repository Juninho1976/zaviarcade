import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ZaviDashPlayerName } from "./zavi-dash-player-name";

describe("ZaviDashPlayerName", () => {
  it("explains the pre-game leaderboard name flow", () => {
    const markup = renderToStaticMarkup(<ZaviDashPlayerName onChange={() => undefined} value="Zavi" />);

    expect(markup).toContain("Choose your player name");
    expect(markup).toContain("Enter your name before playing");
    expect(markup).toContain('value="Zavi"');
  });
});
