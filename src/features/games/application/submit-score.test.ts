import { describe, expect, it } from "vitest";
import { normalizePlayerName, submitScore } from "./submit-score";

describe("submitScore", () => {
  it("normalizes an accepted Zavi Dash player name", () => {
    expect(normalizePlayerName("  Zavi   Dash  ")).toBe("Zavi Dash");
    expect(submitScore("zavi-dash", { playerName: "  Zavi   Dash  ", score: 100 })).toEqual({
      success: true,
      submission: { playerName: "Zavi Dash", score: 100 },
    });
  });

  it("rejects invalid player names and scores", () => {
    expect(submitScore("zavi-dash", { playerName: "", score: 10 })).toEqual(expect.objectContaining({ success: false }));
    expect(submitScore("zavi-dash", { playerName: "Zavi!", score: 10 })).toEqual(expect.objectContaining({ success: false }));
    expect(submitScore("zavi-dash", { playerName: "Zavi", score: -1 })).toEqual(expect.objectContaining({ success: false }));
  });

  it("rejects scores beyond the deterministic level maximum", () => {
    expect(submitScore("zavi-dash", { playerName: "Zavi", score: 1_087 })).toEqual({
      success: false,
      message: "Score cannot exceed the level maximum of 1086.",
    });
  });
});
