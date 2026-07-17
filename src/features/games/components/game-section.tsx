import type { Game } from "@/features/games/domain/game";
import { GameCard } from "./game-card";

type GameSectionProps = {
  badge: string;
  eyebrow: string;
  games: readonly Game[];
  headingId: string;
  title: string;
};

export function GameSection({
  badge,
  eyebrow,
  games,
  headingId,
  title,
}: GameSectionProps) {
  return (
    <section className="mt-14" aria-labelledby={headingId}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-cyan-700">{eyebrow}</p>
          <h2
            id={headingId}
            className="mt-1 text-3xl font-bold tracking-tight text-slate-950"
          >
            {title}
          </h2>
        </div>
        <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-900">
          {badge}
        </span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}
