export type Game = {
  description: string;
  isPlaceholder: boolean;
  slug: string;
  status: "coming-soon" | "available";
  title: string;
};
