import { describe, expect, it } from "vitest";
import { formatScoreDate } from "./format-score-date";

describe("formatScoreDate", () => {
  it("formats score timestamps consistently in UTC", () => {
    expect(formatScoreDate("2026-08-09T14:35:00Z")).toBe("9 Aug 2026, 14:35 UTC");
  });
});
