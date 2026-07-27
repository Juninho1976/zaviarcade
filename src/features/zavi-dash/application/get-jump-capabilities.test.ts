import { describe, expect, it } from "vitest";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import { getJumpCapabilities } from "./get-jump-capabilities";

describe("getJumpCapabilities", () => {
  it("derives deterministic, non-pixel-perfect level limits from the fixed-step physics", () => {
    expect(getJumpCapabilities(zaviDashLevelOne)).toEqual({
      maximumDistance: 237,
      maximumHeight: 148,
      safeGap: 177,
      safeObstacleHeight: 133,
      safeObstacleWidth: 177,
    });
  });
});
