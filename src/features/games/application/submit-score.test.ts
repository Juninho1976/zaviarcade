import { describe, expect, it } from "vitest";
import { submitScore } from "./submit-score";

describe("submitScore", () => {
  it("accepts a valid Geometry Dash score", () => expect(submitScore("geometry-dash", { playerName: "Zavi", score: 100 })).toEqual({ success: true, submission: { playerName: "Zavi", score: 100 } }));
  it("rejects invalid scores", () => expect(submitScore("geometry-dash", { playerName: "", score: -1 })).toEqual(expect.objectContaining({ success: false })));
});
