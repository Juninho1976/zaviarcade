import Link from "next/link";
import { navigationItems } from "@/features/navigation/data/navigation-items";
import { getAuthenticatedPlayer } from "@/features/auth/server/session";
import { logout } from "@/features/auth/server/actions";

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

export async function SiteNavigation() {
  const player = await getAuthenticatedPlayer();
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
          {player?.role === "admin" ? (
            <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-cyan-50" href="/admin/players">Admin</Link>
          ) : null}
          {player ? (
            <>
              <span className="ml-2 text-sm font-bold text-cyan-900" aria-label={`Logged in as ${player.displayName}`}>{player.displayName}</span>
              <form action={logout}><button className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" type="submit">Log out</button></form>
            </>
          ) : (
            <Link className="ml-2 rounded-lg bg-cyan-800 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-950" href="/login">Log in</Link>
          )}
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
            {player?.role === "admin" ? <Link className="rounded-lg px-3 py-2 text-sm font-semibold" href="/admin/players">Admin</Link> : null}
            {player ? (
              <form action={logout} className="border-t border-slate-100 pt-2">
                <p className="px-3 pb-2 text-xs font-bold text-cyan-900">{player.displayName}</p>
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold" type="submit">Log out</button>
              </form>
            ) : <Link className="rounded-lg bg-cyan-800 px-3 py-2 text-sm font-bold text-white" href="/login">Log in</Link>}
          </nav>
        </details>
      </div>
    </header>
  );
}
