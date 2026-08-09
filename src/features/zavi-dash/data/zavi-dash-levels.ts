import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashLevelOne } from "./zavi-dash-level-one";
import { zaviDashLevelTwo } from "./zavi-dash-level-two";

export const zaviDashLevels: readonly LevelDefinition[] = [zaviDashLevelOne, zaviDashLevelTwo];

export function getZaviDashLevel(id: string): LevelDefinition | undefined {
  return zaviDashLevels.find((level) => level.id === id);
}
