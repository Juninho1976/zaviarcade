import { getGamesByPlacement } from "@/features/games/application/get-games-by-placement";
import { GameSection } from "@/features/games/components/game-section";
import { CommunitySection } from "@/features/community/components/community-section";
import { listCommunityComments } from "@/features/community/server/comments";
import { getAuthenticatedPlayer } from "@/features/auth/server/session";

export default async function Home() {
  const availableGames = getGamesByPlacement("available");
  const upcomingGames = getGamesByPlacement("coming-soon");
  const [comments, player] = await Promise.all([listCommunityComments(), getAuthenticatedPlayer()]);

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
          Experience designed by Zavi and built by Zavi and family.
        </p>
      </section>

      <GameSection
        badge="Ready to play"
        eyebrow="Play now"
        games={availableGames}
        headingId="available-games-heading"
        title="Start your next challenge"
      />
      <CommunitySection comments={comments} player={player} games={availableGames.map(({ slug, title }) => ({ slug, title }))} />

      <GameSection
        badge="Coming soon"
        eyebrow="First up"
        games={upcomingGames}
        headingId="upcoming-games-heading"
        title="Games in the arcade"
      />
    </main>
  );
}
