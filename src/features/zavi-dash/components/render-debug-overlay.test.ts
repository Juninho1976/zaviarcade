import { describe, expect, it } from "vitest";
import { isDebugOverlayEnabled } from "./render-debug-overlay";

describe("Zavi Dash debug overlay", () => {
  it("is enabled in development and disabled by default in production", () => {
    expect(isDebugOverlayEnabled({ environment: "development" })).toBe(true);
    expect(isDebugOverlayEnabled({ environment: "production" })).toBe(false);
  });

  it("allows an explicit debug flag in production", () => {
    expect(isDebugOverlayEnabled({ environment: "production", explicitFlag: true })).toBe(true);
  });
});
