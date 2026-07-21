import { describe, expect, it } from "vitest";
import { readScoreSubmissionRequest } from "./read-score-submission-request";

describe("readScoreSubmissionRequest", () => {
  it("parses a JSON score request", async () => {
    const request = new Request("https://zaviarcade.com/api/games/zavi-dash/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ playerName: "Zavi", score: 100 }),
    });

    await expect(readScoreSubmissionRequest(request)).resolves.toEqual({
      success: true,
      body: { playerName: "Zavi", score: 100 },
    });
  });

  it("rejects malformed, oversized, and non-JSON requests", async () => {
    await expect(readScoreSubmissionRequest(new Request("https://zaviarcade.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }))).resolves.toEqual(expect.objectContaining({ success: false, status: 400 }));
    await expect(readScoreSubmissionRequest(new Request("https://zaviarcade.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ playerName: "Zavi", note: "x".repeat(1_024) }),
    }))).resolves.toEqual(expect.objectContaining({ success: false, status: 413 }));
    await expect(readScoreSubmissionRequest(new Request("https://zaviarcade.com", {
      method: "POST",
      body: "score=100",
    }))).resolves.toEqual(expect.objectContaining({ success: false, status: 415 }));
  });
});
