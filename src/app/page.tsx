import { GameCard } from "@/features/games/components/game-card";
import { getFeaturedGames } from "@/features/games/application/get-featured-games";

export default function Home() {
  const featuredGames = getFeaturedGames();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12 sm:px-10 lg:py-20">
      <section className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">
          Zavi Arcade
        </p>
        <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          Welcome to Zavi Arcade.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
          Play, learn, and repeat with a growing collection of games,
          challenges, and experiments made by Zavi and family.
        </p>
      </section>

      <section className="mt-14" aria-labelledby="games-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-cyan-700">First up</p>
            <h2
              id="games-heading"
              className="mt-1 text-3xl font-bold tracking-tight text-slate-950"
            >
              Games in the arcade
            </h2>
          </div>
          <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-900">
            Coming soon
          </span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredGames.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </main>
  );
}
