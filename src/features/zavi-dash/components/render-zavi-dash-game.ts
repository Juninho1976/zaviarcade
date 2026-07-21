import type { Bounds, GameState } from "@/features/zavi-dash/domain/game";
import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashCanvasViewport } from "./canvas-viewport";

export type RenderFrame = {
  cameraX: number;
  playerBounds: Bounds;
};

function getCameraX(level: LevelDefinition, state: GameState): number {
  const preferredCameraX = state.player.x - zaviDashCanvasViewport.width * 0.28;

  return Math.min(
    Math.max(0, preferredCameraX),
    Math.max(0, level.world.width - zaviDashCanvasViewport.width),
  );
}

function drawBackground(context: CanvasRenderingContext2D, level: LevelDefinition, cameraX: number): void {
  const gradient = context.createLinearGradient(0, 0, 0, zaviDashCanvasViewport.height);
  gradient.addColorStop(0, level.visuals.background.base);
  gradient.addColorStop(1, level.visuals.background.accent);
  context.fillStyle = gradient;
  context.fillRect(0, 0, zaviDashCanvasViewport.width, zaviDashCanvasViewport.height);

  context.fillStyle = level.visuals.background.sun;
  context.beginPath();
  context.arc(770 - cameraX * 0.08, 118, 54, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgb(255 255 255 / 0.18)";
  for (const offset of [80, 330, 610, 890]) {
    const x = offset - (cameraX * 0.18 % 1_050);
    context.fillRect(x, 190, 118, 8);
    context.fillRect(x + 26, 176, 66, 8);
  }
}

function drawObstacle(context: CanvasRenderingContext2D, level: LevelDefinition, obstacle: LevelDefinition["obstacles"][number]): void {
  const y = level.groundY - obstacle.height;
  context.fillStyle = obstacle.kind === "spire" ? level.visuals.obstacle.spire : level.visuals.obstacle.block;

  if (obstacle.kind === "spire") {
    context.beginPath();
    context.moveTo(obstacle.x, level.groundY);
    context.lineTo(obstacle.x + obstacle.width / 2, y);
    context.lineTo(obstacle.x + obstacle.width, level.groundY);
    context.closePath();
    context.fill();
    return;
  }

  context.fillRect(obstacle.x, y, obstacle.width, obstacle.height);
}

export function renderZaviDashGame(
  context: CanvasRenderingContext2D,
  level: LevelDefinition,
  state: GameState,
): RenderFrame {
  const cameraX = getCameraX(level, state);
  const playerBounds: Bounds = {
    x: state.player.x,
    y: state.player.y,
    width: level.player.width,
    height: level.player.height,
  };

  drawBackground(context, level, cameraX);
  context.save();
  context.translate(-cameraX, 0);

  for (const segment of level.terrain) {
    context.fillStyle = level.visuals.ground.fill;
    context.fillRect(segment.startX, level.groundY, segment.endX - segment.startX, level.world.height - level.groundY);
    context.fillStyle = level.visuals.ground.edge;
    context.fillRect(segment.startX, level.groundY, segment.endX - segment.startX, 8);
  }

  for (const obstacle of level.obstacles) drawObstacle(context, level, obstacle);

  context.fillStyle = level.visuals.finish.pole;
  context.fillRect(level.finishX, level.groundY - 210, 10, 210);
  context.fillStyle = level.visuals.finish.flag;
  context.beginPath();
  context.moveTo(level.finishX + 10, level.groundY - 205);
  context.lineTo(level.finishX + 142, level.groundY - 162);
  context.lineTo(level.finishX + 10, level.groundY - 118);
  context.closePath();
  context.fill();

  context.fillStyle = level.visuals.player.fill;
  context.beginPath();
  context.roundRect(playerBounds.x, playerBounds.y, playerBounds.width, playerBounds.height, 12);
  context.fill();
  context.fillStyle = level.visuals.player.accent;
  context.fillRect(playerBounds.x + 14, playerBounds.y + 23, playerBounds.width - 28, 8);
  context.restore();

  return { cameraX, playerBounds };
}
