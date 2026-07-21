import type { Game } from "@/features/games/domain/game";

export const games: readonly Game[] = [
  {
    slug: "geometry-dash",
    title: "Geometry Dash",
    description: "A fast-paced arcade adventure is landing in Zavi Arcade soon.",
    status: "coming-soon",
    isPlaceholder: false,
    route: "/games/geometry-dash",
    thumbnail: {
      alt: "A glowing geometric arcade course with ramps, portals, and colourful cubes",
      src: "/images/games/geometry-dash.png",
    },
    leaderboard: {
      entries: [],
      route: "/games/geometry-dash/leaderboard",
    },
    placement: "coming-soon",
  },
  {
    slug: "mystery-game",
    title: "Mystery Game",
    description: "A brand-new adventure is loading into the arcade soon.",
    status: "coming-soon",
    isPlaceholder: true,
    route: "/games/mystery-game",
    thumbnail: null,
    leaderboard: {
      entries: [],
      route: "/games/mystery-game/leaderboard",
    },
    placement: "coming-soon",
  },
  {
    slug: "next-challenge",
    title: "Your Next Challenge",
    description: "Keep an eye on this space for another game to master.",
    status: "coming-soon",
    isPlaceholder: true,
    route: "/games/next-challenge",
    thumbnail: null,
    leaderboard: {
      entries: [],
      route: "/games/next-challenge/leaderboard",
    },
    placement: "coming-soon",
  },
];
