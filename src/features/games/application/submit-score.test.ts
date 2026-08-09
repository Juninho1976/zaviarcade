import { describe, expect, it } from "vitest";
import { submitScore } from "./submit-score";

const submissionId = "123e4567-e89b-42d3-a456-426614174000";

describe("submitScore", () => {
  it("accepts score data without a browser-supplied player identity", () => {
    expect(submitScore("zavi-dash", { score: 1_086, submissionId })).toEqual({
      success: true,
      submission: { score: 1_086, submissionId },
    });
  });

  it("rejects invalid scores and submission IDs", () => {
    expect(submitScore("zavi-dash", { score: -1, submissionId })).toEqual(expect.objectContaining({ success: false }));
    expect(submitScore("zavi-dash", { score: 1_086, submissionId: "retry" })).toEqual(expect.objectContaining({ success: false }));
  });

  it("accepts a non-completed run score and rejects scores above the deterministic maximum", () => {
    expect(submitScore("zavi-dash", { score: 120, submissionId })).toEqual({
      success: true,
      submission: { score: 120, submissionId },
    });
    expect(submitScore("zavi-dash", { score: 1_087, submissionId })).toEqual({
      success: false,
      message: "Score cannot exceed the level maximum of 1086.",
    });
  });

  it("uses Zavi Dash 2's separate deterministic score ceiling", () => {
    expect(submitScore("zavi-dash-2", { score: 1_536, submissionId })).toEqual({
      success: true,
      submission: { score: 1_536, submissionId },
    });
    expect(submitScore("zavi-dash-2", { score: 1_537, submissionId })).toEqual({
      success: false,
      message: "Score cannot exceed the level maximum of 1536.",
    });
  });

  it("accepts George (Pac) Man scores within its two-minute game ceiling", () => {
    expect(submitScore("georges-pac-man", { score: 12_340, submissionId })).toEqual({
      success: true,
      submission: { score: 12_340, submissionId },
    });
    expect(submitScore("georges-pac-man", { score: 100_001, submissionId })).toEqual({
      success: false,
      message: "Score cannot exceed the level maximum of 100000.",
    });
  });

  it("accepts Rak Asteroids scores within its 90-second game ceiling", () => {
    expect(submitScore("rak-asteroids", { score: 19_050, submissionId })).toEqual({
      success: true,
      submission: { score: 19_050, submissionId },
    });
    expect(submitScore("rak-asteroids", { score: 20_001, submissionId })).toEqual({
      success: false,
      message: "Score cannot exceed the level maximum of 20000.",
    });
  });
});
