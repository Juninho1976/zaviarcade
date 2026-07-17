import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/features/games/domain/game";

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700"
      href={game.route}
    >
      <article
        className={`h-full overflow-hidden rounded-3xl border shadow-sm transition-transform sm:group-hover:-translate-y-1 ${
          game.isPlaceholder
            ? "border-dashed border-cyan-300 bg-cyan-50/50"
            : "border-slate-200 bg-white"
        }`}
      >
        {game.thumbnail ? (
          <Image
            alt={game.thumbnail.alt}
            className="aspect-video w-full object-cover"
            height={675}
            src={game.thumbnail.src}
            width={1200}
          />
        ) : (
          <div
            aria-hidden="true"
            className="aspect-video bg-linear-to-br from-cyan-100 via-violet-100 to-orange-100"
          />
        )}
        <div className="p-8">
          <p className="text-sm font-semibold tracking-wide text-cyan-700 uppercase">
            {game.isPlaceholder
              ? "Future game"
              : game.status.replace("-", " ")}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-950">{game.title}</h3>
          <p className="mt-3 leading-7 text-slate-600">{game.description}</p>
        </div>
      </article>
    </Link>
  );
}
