import type { Metadata } from "next";
import { getGamesByPlacement } from "@/features/games/application/get-games-by-placement";
import { GameSection } from "@/features/games/components/game-section";

export const metadata: Metadata = {
  title: "Games | Zavi Arcade",
  description: "Discover games, challenges, and upcoming experiments from Zavi Arcade.",
};

export default function GamesPage() {
  const availableGames = getGamesByPlacement("available");
  const upcomingGames = getGamesByPlacement("coming-soon");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12 sm:px-10 lg:py-20">
      <section className="max-w-3xl" aria-labelledby="games-heading">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">Choose a challenge</p>
        <h1 id="games-heading" className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Games</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Play what is ready today, then keep an eye on the arcade for Zavi’s next ideas.
        </p>
      </section>

      <GameSection
        badge="Ready to play"
        eyebrow="Play now"
        games={availableGames}
        headingId="available-games-heading"
        title="Start your next challenge"
      />
      <GameSection
        badge="Coming soon"
        eyebrow="On the horizon"
        games={upcomingGames}
        headingId="upcoming-games-heading"
        title="More games are on the way"
      />
    </main>
  );
}
