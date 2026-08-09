import { describe, expect, it } from "vitest";
import { getZaviDashLevel, zaviDashLevels } from "./zavi-dash-levels";

describe("zaviDashLevels", () => {
  it("registers both original levels with visual tokens ready for a Canvas renderer", () => {
    expect(zaviDashLevels).toHaveLength(2);
    expect(zaviDashLevels[0]).toMatchObject({
      id: "sunlit-sprint",
      name: "Sunlit Sprint",
      visuals: {
        player: { shape: "rounded-block" },
      },
    });
  });

  it("retrieves a level by its data-driven identifier", () => {
    expect(getZaviDashLevel("sunlit-sprint")).toBe(zaviDashLevels[0]);
    expect(getZaviDashLevel("neon-gauntlet")).toBe(zaviDashLevels[1]);
    expect(getZaviDashLevel("unknown-level")).toBeUndefined();
  });
});
