import { getMaximumScore } from "@/features/zavi-dash/application/get-maximum-score";
import type { LevelDefinition, LevelValidationError } from "@/features/zavi-dash/domain/level";

function hasGroundAt(level: LevelDefinition, x: number): boolean {
  return level.terrain.some((segment) => segment.startX <= x && x <= segment.endX);
}

export function validateLevelDefinition(level: LevelDefinition): readonly LevelValidationError[] {
  const errors: LevelValidationError[] = [];

  if (!level.id.trim()) errors.push({ path: "id", message: "A level ID is required." });
  if (!level.name.trim()) errors.push({ path: "name", message: "A level name is required." });
  if (level.world.width <= 0 || level.world.height <= 0)
    errors.push({ path: "world", message: "World dimensions must be positive." });
  if (level.player.startX < 0 || level.player.startX >= level.world.width)
    errors.push({ path: "player.startX", message: "The player start must be inside the world." });
  if (level.player.width <= 0 || level.player.height <= 0)
    errors.push({ path: "player", message: "Player dimensions must be positive." });
  if (level.physics.gravity <= 0 || level.physics.runSpeed <= 0 || level.physics.jumpImpulse >= 0)
    errors.push({ path: "physics", message: "Physics values must define downward gravity, forward movement, and an upward jump." });
  if (level.finishX <= level.player.startX || level.finishX > level.world.width)
    errors.push({ path: "finishX", message: "The finish must be ahead of the player and inside the world." });

  let previousEnd = -Infinity;
  for (const [index, segment] of level.terrain.entries()) {
    if (segment.startX < 0 || segment.endX > level.world.width || segment.startX >= segment.endX)
      errors.push({ path: `terrain.${index}`, message: "Ground segments must have valid bounds inside the world." });
    if (segment.startX < previousEnd)
      errors.push({ path: `terrain.${index}`, message: "Ground segments must not overlap." });
    previousEnd = Math.max(previousEnd, segment.endX);
  }

  if (!hasGroundAt(level, level.player.startX))
    errors.push({ path: "player.startX", message: "The player must start on solid ground." });
  if (!hasGroundAt(level, level.finishX))
    errors.push({ path: "finishX", message: "The finish must stand on solid ground." });

  const obstacleIds = new Set<string>();
  for (const [index, obstacle] of level.obstacles.entries()) {
    if (obstacleIds.has(obstacle.id))
      errors.push({ path: `obstacles.${index}.id`, message: "Obstacle IDs must be unique." });
    obstacleIds.add(obstacle.id);
    if (obstacle.width <= 0 || obstacle.height <= 0 || obstacle.x < 0 || obstacle.x + obstacle.width > level.finishX)
      errors.push({ path: `obstacles.${index}`, message: "Obstacles must have positive dimensions before the finish." });
    if (!hasGroundAt(level, obstacle.x) || !hasGroundAt(level, obstacle.x + obstacle.width))
      errors.push({ path: `obstacles.${index}`, message: "Obstacles must sit entirely on solid ground." });

    const overlapsAnotherObstacle = level.obstacles.slice(0, index).some((other) =>
      obstacle.x < other.x + other.width && other.x < obstacle.x + obstacle.width,
    );
    if (overlapsAnotherObstacle)
      errors.push({ path: `obstacles.${index}`, message: "Obstacles must not overlap." });
  }

  if (level.scoring.distancePerPoint <= 0 || level.scoring.completionBonus < 0)
    errors.push({ path: "scoring", message: "Score configuration must use positive distance units and a non-negative completion bonus." });
  if (level.scoring.maximumScore !== getMaximumScore(level))
    errors.push({ path: "scoring.maximumScore", message: "The score ceiling must match the finish distance and score rules." });

  return errors;
}
