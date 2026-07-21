import Link from "next/link";
import type { Game } from "@/features/games/domain/game";

type LeaderboardGameListProps = {
  games: readonly Game[];
};

export function LeaderboardGameList({ games }: LeaderboardGameListProps) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Game leaderboards">
      {games.map((game) => (
        <li key={game.slug}>
          <Link
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700"
            href={game.leaderboard.route}
          >
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">
              Game leaderboard
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950 group-hover:text-cyan-950">
              {game.title}
            </h2>
            <p className="mt-3 leading-7 text-slate-600">{game.description}</p>
            <span className="mt-6 font-semibold text-cyan-800">View rankings →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
