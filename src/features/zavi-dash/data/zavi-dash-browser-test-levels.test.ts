import { describe, expect, it } from "vitest";
import { getBrowserTestLevel } from "./zavi-dash-browser-test-levels";

describe("browser test levels", () => {
  it("provides deterministic complete, death, and running scenarios", () => {
    expect(getBrowserTestLevel("complete")?.obstacles).toEqual([]);
    expect(getBrowserTestLevel("death")?.obstacles).toHaveLength(1);
    expect(getBrowserTestLevel("running")?.finishX).toBe(4_000);
    expect(getBrowserTestLevel("unknown")).toBeUndefined();
  });
});
