import { games } from "@/features/games/data/games";
import type { Game } from "@/features/games/domain/game";

export function getGamesWithLeaderboards(): readonly Game[] {
  return games.filter((game) => !game.isPlaceholder);
}
