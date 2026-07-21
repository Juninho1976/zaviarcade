import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getGameBySlug } from "@/features/games/application/get-game-by-slug";
import { getLeaderboard } from "@/features/games/application/get-leaderboard";
import { games } from "@/features/games/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}
export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }
  const { env } = await getCloudflareContext({ async: true });
  const entries = await getLeaderboard(env.DB, slug);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12 sm:px-10 lg:py-20">
      <Link className="text-sm font-semibold text-cyan-800 hover:text-cyan-950" href={game.route}>
        ← Back to {game.title}
      </Link>
      <p className="mt-10 text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">
        Leaderboard
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        {game.title}
      </h1>
      {entries.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-6 leading-7 text-slate-600">
          Scores will appear here when {game.title} is live.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[500px] text-left">
            <caption className="sr-only">{game.title} player rankings and scores</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold" scope="col">Rank</th>
                <th className="px-5 py-4 font-semibold" scope="col">Player</th>
                <th className="px-5 py-4 text-right font-semibold" scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr className="border-b border-slate-100 last:border-0" key={entry.rank}>
                  <td className="px-5 py-4 font-bold text-cyan-800">#{entry.rank}</td>
                  <td className="px-5 py-4 font-semibold text-slate-950">{entry.playerName}</td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700">{entry.score.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
