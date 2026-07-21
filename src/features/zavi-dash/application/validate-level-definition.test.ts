import { describe, expect, it } from "vitest";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import { validateLevelDefinition } from "./validate-level-definition";

describe("validateLevelDefinition", () => {
  it("accepts the original Level One course", () => {
    expect(validateLevelDefinition(zaviDashLevelOne)).toEqual([]);
  });

  it("rejects overlapping ground segments", () => {
    const level = {
      ...zaviDashLevelOne,
      terrain: [
        { startX: 0, endX: 1_600 },
        { startX: 1_500, endX: 3_000 },
      ],
    };

    expect(validateLevelDefinition(level).map((error) => error.message)).toContain("Ground segments must not overlap.");
  });

  it("rejects obstacles that overlap", () => {
    const level = {
      ...zaviDashLevelOne,
      obstacles: [
        { id: "first", kind: "block" as const, x: 500, width: 100, height: 80 },
        { id: "second", kind: "spire" as const, x: 580, width: 100, height: 80 },
      ],
    };

    expect(validateLevelDefinition(level).map((error) => error.message)).toContain("Obstacles must not overlap.");
  });

  it("rejects a score ceiling that does not match the level rules", () => {
    const level = {
      ...zaviDashLevelOne,
      scoring: {
        ...zaviDashLevelOne.scoring,
        maximumScore: 1,
      },
    };

    expect(validateLevelDefinition(level).map((error) => error.message)).toContain(
      "The score ceiling must match the finish distance and score rules.",
    );
  });
});
