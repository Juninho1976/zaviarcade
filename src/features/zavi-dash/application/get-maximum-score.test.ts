import { describe, expect, it } from "vitest";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import { getMaximumScore } from "./get-maximum-score";

describe("getMaximumScore", () => {
  it("derives the score ceiling from the level's deterministic scoring rules", () => {
    expect(getMaximumScore(zaviDashLevelOne)).toBe(zaviDashLevelOne.scoring.maximumScore);
  });
});
