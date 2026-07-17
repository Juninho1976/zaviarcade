import type { Game } from "@/features/games/domain/game";

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold tracking-wide text-cyan-700 uppercase">
        {game.status.replace("-", " ")}
      </p>
      <h3 className="mt-3 text-2xl font-bold text-slate-950">{game.title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{game.description}</p>
    </article>
  );
}
