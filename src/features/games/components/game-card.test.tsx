import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getGameBySlug } from "@/features/games/application/get-game-by-slug";
import { GameCard } from "./game-card";

describe("GameCard", () => {
  it("renders a game thumbnail and links to its game route", () => {
    const game = getGameBySlug("zavi-dash");

    if (!game || !game.thumbnail) {
      throw new Error("Zavi Dash must be registered");
    }

    const card = renderToStaticMarkup(<GameCard game={game} />);

    expect(card).toContain('href="/games/zavi-dash"');
    expect(card).toContain(game.thumbnail.src);
    expect(card).toContain(game.thumbnail.alt);
  });
});
