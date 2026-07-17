import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/features/games/application/get-game-by-slug";
import { games } from "@/features/games/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

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
      {game.leaderboard.entries.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-6 leading-7 text-slate-600">
          Scores will appear here when {game.title} is live.
        </p>
      ) : null}
    </main>
  );
}
