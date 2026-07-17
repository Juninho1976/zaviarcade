import type { Game } from "@/features/games/domain/game";

export const games: readonly Game[] = [
  {
    slug: "geometry-dash-leaderboard",
    title: "Geometry Dash Leaderboard",
    description: "Track scores, chase personal bests, and celebrate every new record.",
    status: "coming-soon",
    isPlaceholder: false,
  },
  {
    slug: "mystery-game",
    title: "Mystery Game",
    description: "A brand-new adventure is loading into the arcade soon.",
    status: "coming-soon",
    isPlaceholder: true,
  },
  {
    slug: "next-challenge",
    title: "Your Next Challenge",
    description: "Keep an eye on this space for another game to master.",
    status: "coming-soon",
    isPlaceholder: true,
  },
];
