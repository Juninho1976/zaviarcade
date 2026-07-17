import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getGameBySlug } from "@/features/games/application/get-game-by-slug";
import { GameCard } from "./game-card";

describe("GameCard", () => {
  it("renders a game thumbnail and links to its game route", () => {
    const game = getGameBySlug("geometry-future");

    if (!game || !game.thumbnail) {
      throw new Error("Geometry Future must be registered");
    }

    const card = renderToStaticMarkup(<GameCard game={game} />);

    expect(card).toContain('href="/games/geometry-future"');
    expect(card).toContain(encodeURIComponent(game.thumbnail.src));
    expect(card).toContain(game.thumbnail.alt);
  });
});
