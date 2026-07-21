import type { GameState } from "@/features/zavi-dash/domain/game";
import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import type { RenderFrame } from "./render-zavi-dash-game";

export type DebugOverlayOptions = {
  environment?: string;
  explicitFlag?: boolean;
};

export function isDebugOverlayEnabled({
  environment = process.env.NODE_ENV,
  explicitFlag = false,
}: DebugOverlayOptions = {}): boolean {
  return explicitFlag || environment === "development";
}

export function renderDebugOverlay(
  context: CanvasRenderingContext2D,
  level: LevelDefinition,
  state: GameState,
  frame: RenderFrame,
  framesPerSecond: number,
): void {
  const lines = [
    `FPS: ${framesPerSecond.toFixed(0)}`,
    `Phase: ${state.phase}`,
    `Player: ${state.player.x.toFixed(1)}, ${state.player.y.toFixed(1)}`,
    `Velocity Y: ${state.player.velocityY.toFixed(1)}`,
    `Grounded: ${state.player.grounded}`,
    `Score: ${state.score}`,
    `Progress: ${(state.progress * 100).toFixed(1)}%`,
  ];

  context.save();
  context.fillStyle = "rgb(15 23 42 / 0.82)";
  context.fillRect(12, 12, 250, lines.length * 22 + 18);
  context.fillStyle = "#ecfeff";
  context.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
  lines.forEach((line, index) => context.fillText(line, 22, 36 + index * 22));

  context.strokeStyle = "#f472b6";
  context.lineWidth = 2;
  context.strokeRect(
    frame.playerBounds.x - frame.cameraX,
    frame.playerBounds.y,
    frame.playerBounds.width,
    frame.playerBounds.height,
  );
  context.strokeStyle = "#a7f3d0";
  for (const obstacle of level.obstacles) {
    context.strokeRect(
      obstacle.x - frame.cameraX,
      level.groundY - obstacle.height,
      obstacle.width,
      obstacle.height,
    );
  }
  context.restore();
}
