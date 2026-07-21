export type GamePlacement = "available" | "coming-soon" | "featured";
export type GameStatus = "coming-soon" | "live";

export type LeaderboardEntry = {
  playerName: string;
  rank: number;
  score: number;
};

export type GameLeaderboard = {
  entries: readonly LeaderboardEntry[];
  route: string;
};

export type GameThumbnail = {
  alt: string;
  src: string;
};

export type Game = {
  description: string;
  isPlaceholder: boolean;
  legacySlugs: readonly string[];
  leaderboard: GameLeaderboard;
  placement: GamePlacement;
  route: string;
  slug: string;
  status: GameStatus;
  thumbnail: GameThumbnail | null;
  title: string;
};
