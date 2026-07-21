import { describe, expect, it } from "vitest";
import { getGameByLegacySlug } from "./get-game-by-legacy-slug";

describe("getGameByLegacySlug", () => {
  it("maps the legacy Geometry Dash slug to Zavi Dash", () => {
    expect(getGameByLegacySlug("geometry-dash")).toEqual(
      expect.objectContaining({
        route: "/games/zavi-dash",
        slug: "zavi-dash",
        title: "Zavi Dash",
      }),
    );
  });

  it("returns undefined for an unknown legacy slug", () => {
    expect(getGameByLegacySlug("not-a-game")).toBeUndefined();
  });
});
