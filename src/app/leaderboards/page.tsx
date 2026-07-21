import { getGamesWithLeaderboards } from "@/features/games/application/get-games-with-leaderboards";
import { LeaderboardGameList } from "@/features/games/components/leaderboard-game-list";

export default function LeaderboardsPage() {
  const games = getGamesWithLeaderboards();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12 sm:px-10 lg:py-20">
      <section aria-labelledby="leaderboards-heading">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">
          Rankings
        </p>
        <h1 id="leaderboards-heading" className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Leaderboards
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          See the top scores for every game in Zavi Arcade.
        </p>
        <LeaderboardGameList games={games} />
      </section>
    </main>
  );
}
