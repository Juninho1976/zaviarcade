import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getGameByLegacySlug } from "@/features/games/application/get-game-by-legacy-slug";
import { getGameBySlug } from "@/features/games/application/get-game-by-slug";
import { games } from "@/features/games/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    const legacyGame = getGameByLegacySlug(slug);

    if (legacyGame) {
      permanentRedirect(legacyGame.route);
    }

    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12 sm:px-10 lg:py-20">
      {game.thumbnail ? (
        <Image
          alt={game.thumbnail.alt}
          className="aspect-video rounded-3xl object-cover shadow-sm"
          height={675}
          priority
          src={game.thumbnail.src}
          width={1200}
        />
      ) : null}
      <p className="mt-8 text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">
        {game.status.replace("-", " ")}
      </p>
      <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
        {game.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
        {game.description}
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          className="rounded-xl bg-cyan-800 px-6 py-3 font-bold text-white transition-colors hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          type="button"
        >
          Play (coming soon)
        </button>
        <Link
          className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          href={game.leaderboard.route}
        >
          View leaderboard
        </Link>
      </div>
      <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-8" aria-labelledby="leaderboard-heading">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">Leaderboard</p>
        <h2 id="leaderboard-heading" className="mt-2 text-3xl font-bold text-slate-950">Ready when the game is live</h2>
        <p className="mt-3 leading-7 text-slate-600">Scores will appear here once players can start their {game.title} runs.</p>
      </section>
    </main>
  );
}
