import Link from "next/link";
import { navigationItems } from "@/features/navigation/data/navigation-items";

function NavigationLinks() {
  return navigationItems.map((item) => (
    <Link
      key={item.href}
      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
      href={item.href}
    >
      {item.label}
    </Link>
  ));
}

export function SiteNavigation() {
  return (
    <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          className="text-lg font-black tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700"
          href="/"
        >
          Zavi Arcade
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation">
          <NavigationLinks />
        </nav>

        <details className="relative sm:hidden">
          <summary className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 marker:hidden hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
            Menu
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 z-10 mt-2 flex w-48 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
          >
            <NavigationLinks />
          </nav>
        </details>
      </div>
    </header>
  );
}
