import { games } from "@/features/games/data/games";
import type { Game, GamePlacement } from "@/features/games/domain/game";

export function getGamesByPlacement(placement: GamePlacement): readonly Game[] {
  return games.filter((game) => game.placement === placement);
}
