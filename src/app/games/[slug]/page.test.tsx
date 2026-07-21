import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GamePage from "./page";

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
  });
});
