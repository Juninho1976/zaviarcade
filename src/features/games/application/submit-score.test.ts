import { describe, expect, it } from "vitest";
import { normalizePlayerName, submitScore } from "./submit-score";

const submissionId = "123e4567-e89b-42d3-a456-426614174000";

describe("submitScore", () => {
  it("normalizes an accepted Zavi Dash player name", () => {
    expect(normalizePlayerName("  Zavi   Dash  ")).toBe("Zavi Dash");
    expect(submitScore("zavi-dash", { playerName: "  Zavi   Dash  ", score: 1_086, submissionId })).toEqual({
      success: true,
      submission: { playerName: "Zavi Dash", score: 1_086, submissionId },
    });
  });

  it("rejects invalid player names and scores", () => {
    expect(submitScore("zavi-dash", { playerName: "", score: 1_086, submissionId })).toEqual(expect.objectContaining({ success: false }));
    expect(submitScore("zavi-dash", { playerName: "Zavi!", score: 1_086, submissionId })).toEqual(expect.objectContaining({ success: false }));
    expect(submitScore("zavi-dash", { playerName: "Zavi", score: -1, submissionId })).toEqual(expect.objectContaining({ success: false }));
    expect(submitScore("zavi-dash", { playerName: "Zavi", score: 1_086, submissionId: "retry" })).toEqual(expect.objectContaining({ success: false }));
  });

  it("accepts a non-completed run score and rejects scores above the deterministic maximum", () => {
    expect(submitScore("zavi-dash", { playerName: "Zavi", score: 120, submissionId })).toEqual({
      success: true,
      submission: { playerName: "Zavi", score: 120, submissionId },
    });
    expect(submitScore("zavi-dash", { playerName: "Zavi", score: 1_087, submissionId })).toEqual({
      success: false,
      message: "Score cannot exceed the level maximum of 1086.",
    });
  });
});
