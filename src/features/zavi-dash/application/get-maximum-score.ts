import type { LevelDefinition } from "@/features/zavi-dash/domain/level";

export function getMaximumScore(level: LevelDefinition): number {
  const distance = level.finishX - level.player.startX;

  return Math.floor(distance / level.scoring.distancePerPoint) + level.scoring.completionBonus;
}
