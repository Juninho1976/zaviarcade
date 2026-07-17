import { games } from "@/features/games/data/games";
import type { Game } from "@/features/games/domain/game";

export function getFeaturedGames(): readonly Game[] {
  return games;
}
