import type { Game } from "@/features/games/domain/game";

export const games: readonly Game[] = [
  {
    slug: "zavi-dash",
    title: "Zavi Dash",
    description: "An original obstacle run made for fast reflexes and fresh starts.",
    status: "live",
    isPlaceholder: false,
    legacySlugs: ["geometry-dash"],
    route: "/games/zavi-dash",
    thumbnail: {
      alt: "An original Zavi Dash course with a bright player block, ramps, and a finish flag",
      src: "/images/games/zavi-dash.svg",
    },
    leaderboard: {
      entries: [],
      route: "/games/zavi-dash/leaderboard",
    },
    placement: "available",
  },
  {
    slug: "mystery-game",
    title: "Mystery Game",
    description: "A brand-new adventure is loading into the arcade soon.",
    status: "coming-soon",
    isPlaceholder: true,
    legacySlugs: [],
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
    legacySlugs: [],
    route: "/games/next-challenge",
    thumbnail: null,
    leaderboard: {
      entries: [],
      route: "/games/next-challenge/leaderboard",
    },
    placement: "coming-soon",
  },
];
