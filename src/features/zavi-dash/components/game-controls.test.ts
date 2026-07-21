import { describe, expect, it } from "vitest";
import { getKeyboardGameInput, getPointerGameInput } from "./game-controls";

describe("Zavi Dash controls", () => {
  it("maps Space and Arrow Up to jump input", () => {
    expect(getKeyboardGameInput("Space")).toEqual({ jumpPressed: true });
    expect(getKeyboardGameInput("ArrowUp")).toEqual({ jumpPressed: true });
  });

  it("maps R to restart and ignores unrelated keys", () => {
    expect(getKeyboardGameInput("KeyR")).toEqual({ restartPressed: true });
    expect(getKeyboardGameInput("KeyA")).toBeUndefined();
  });

  it("maps a pointer press to jump input for mouse and touch support", () => {
    expect(getPointerGameInput()).toEqual({ jumpPressed: true });
  });
});
