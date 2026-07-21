import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashLevelOne } from "./zavi-dash-level-one";

export const zaviDashLevels: readonly LevelDefinition[] = [zaviDashLevelOne];

export function getZaviDashLevel(id: string): LevelDefinition | undefined {
  return zaviDashLevels.find((level) => level.id === id);
}
