import { describe, expect, it } from "vitest";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import { getJumpCapabilities } from "./get-jump-capabilities";

describe("getJumpCapabilities", () => {
  it("derives deterministic, non-pixel-perfect level limits from the fixed-step physics", () => {
    expect(getJumpCapabilities(zaviDashLevelOne)).toEqual({
      maximumDistance: 215,
      maximumHeight: 134,
      safeGap: 161,
      safeObstacleHeight: 120,
    });
  });
});
