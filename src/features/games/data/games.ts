import type { Game } from "@/features/games/domain/game";

export const games: readonly Game[] = [
  {
    slug: "geometry-future",
    title: "Geometry Future",
    description: "A fast-paced arcade adventure is landing in Zavi Arcade soon.",
    status: "coming-soon",
    isPlaceholder: false,
    placement: "coming-soon",
  },
  {
    slug: "mystery-game",
    title: "Mystery Game",
    description: "A brand-new adventure is loading into the arcade soon.",
    status: "coming-soon",
    isPlaceholder: true,
    placement: "coming-soon",
  },
  {
    slug: "next-challenge",
    title: "Your Next Challenge",
    description: "Keep an eye on this space for another game to master.",
    status: "coming-soon",
    isPlaceholder: true,
    placement: "coming-soon",
  },
];
