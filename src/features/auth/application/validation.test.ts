import { describe, expect, it } from "vitest";
import {
  generateTemporaryPassword,
  isValidDisplayName,
  isValidUsername,
  normalizeDisplayName,
  normalizeUsername,
  safeReturnTo,
} from "./validation";

describe("player identity validation", () => {
  it("normalizes and validates private usernames", () => {
    expect(normalizeUsername("  Zavi.Player ")).toBe("zavi.player");
    expect(isValidUsername("zavi-player")).toBe(true);
    expect(isValidUsername("no spaces")).toBe(false);
    expect(isValidUsername("ab")).toBe(false);
  });

  it("allows non-unique nickname-style public display names", () => {
    expect(normalizeDisplayName("  Zavi   Dash ")).toBe("Zavi Dash");
    expect(isValidDisplayName("Zavi Dash")).toBe(true);
    expect(isValidDisplayName("")).toBe(false);
  });

  it("only accepts local return destinations", () => {
    expect(safeReturnTo("/games/zavi-dash")).toBe("/games/zavi-dash");
    expect(safeReturnTo("https://example.com")).toBe("/");
    expect(safeReturnTo("//example.com")).toBe("/");
    expect(safeReturnTo("/\\example.com")).toBe("/");
  });

  it("generates readable five-character temporary passwords", () => {
    expect(generateTemporaryPassword()).toMatch(/^[A-HJ-NP-Za-km-z2-9]{5}$/);
  });
});
