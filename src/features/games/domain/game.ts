export type GamePlacement = "available" | "coming-soon" | "featured";

export type Game = {
  description: string;
  isPlaceholder: boolean;
  placement: GamePlacement;
  slug: string;
  status: "coming-soon" | "available";
  title: string;
};
