import { describe, expect, it } from "vitest";
import { wouldRemoveFinalAdministrator } from "./admin";

describe("administrator safety", () => {
  it("protects only the final active administrator", () => {
    expect(wouldRemoveFinalAdministrator("admin", false, 1)).toBe(true);
    expect(wouldRemoveFinalAdministrator("admin", false, 2)).toBe(false);
    expect(wouldRemoveFinalAdministrator("user", false, 1)).toBe(false);
    expect(wouldRemoveFinalAdministrator("admin", true, 1)).toBe(false);
  });
});
