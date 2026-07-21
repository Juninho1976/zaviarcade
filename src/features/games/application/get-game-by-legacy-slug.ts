import { games } from "@/features/games/data/games";
import type { Game } from "@/features/games/domain/game";

export function getGameByLegacySlug(slug: string): Game | undefined {
  return games.find((game) => game.legacySlugs.includes(slug));
}
