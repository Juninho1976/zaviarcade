import { FIXED_TIME_STEP_SECONDS } from "@/features/zavi-dash/domain/game";
import type { LevelDefinition } from "@/features/zavi-dash/domain/level";

const safeGapRatio = 0.75;
const safeObstacleHeightRatio = 0.9;

export type JumpCapabilities = {
  maximumDistance: number;
  maximumHeight: number;
  safeGap: number;
  safeObstacleHeight: number;
};

export function getJumpCapabilities(level: LevelDefinition): JumpCapabilities {
  let velocityY = level.physics.jumpImpulse;
  let horizontalDistance = 0;
  let verticalOffset = 0;
  let highestOffset = 0;

  do {
    velocityY += level.physics.gravity * FIXED_TIME_STEP_SECONDS;
    verticalOffset += velocityY * FIXED_TIME_STEP_SECONDS;
    horizontalDistance += level.physics.runSpeed * FIXED_TIME_STEP_SECONDS;
    highestOffset = Math.min(highestOffset, verticalOffset);
  } while (verticalOffset < 0);

  const maximumDistance = Math.floor(horizontalDistance);
  const maximumHeight = Math.floor(-highestOffset);

  return {
    maximumDistance,
    maximumHeight,
    safeGap: Math.floor(maximumDistance * safeGapRatio),
    safeObstacleHeight: Math.floor(maximumHeight * safeObstacleHeightRatio),
  };
}
