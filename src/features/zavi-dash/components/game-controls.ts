import type { GameInput } from "@/features/zavi-dash/domain/game";

const jumpKeys = new Set(["ArrowUp", "Space"]);

export function getKeyboardGameInput(code: string): GameInput | undefined {
  if (jumpKeys.has(code)) return { jumpPressed: true };
  if (code === "KeyR") return { restartPressed: true };

  return undefined;
}

export function getPointerGameInput(): GameInput {
  return { jumpPressed: true };
}
