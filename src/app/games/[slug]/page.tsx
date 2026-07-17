import Image from "next/image";
import { notFound } from "next/navigation";
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
    </main>
  );
}
