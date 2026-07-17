import type { NavigationItem } from "@/features/navigation/domain/navigation-item";

export const navigationItems: readonly NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/about", label: "About" },
];
